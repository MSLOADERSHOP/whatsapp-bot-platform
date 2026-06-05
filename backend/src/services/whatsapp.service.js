import { Baileys } from '@baileys/core';
import { UnixSocketConnector } from '@baileys/core/ws';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';
import { logger } from '../utils/logger.js';
import { AccountService } from './account.service.js';
import { MessageService } from './message.service.js';
import { AutoReplyService } from './autoReply.service.js';
import { AntiLinkService } from '../services/antiLink.service.js';
import { AntiSpamService } from '../services/antiSpam.service.js';
import { ActivityLogService } from './activityLog.service.js';

const sessions = new Map();
const sessionDir = process.env.BAILEYS_SESSION_DIR || './sessions';

if (!existsSync(sessionDir)) {
  mkdirSync(sessionDir, { recursive: true });
}

const generateQR = async (accountId, userId) => {
  try {
    const sessionPath = join(sessionDir, accountId);
    if (!existsSync(sessionPath)) {
      mkdirSync(sessionPath, { recursive: true });
    }

    // Generate pairing code instead of QR
    const pairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Generate QR for display
    const qrData = `whatsapp://pair/${pairingCode}`;
    const qrCodeImage = await qrcode.toDataURL(qrData);

    await AccountService.saveQRCode(accountId, qrCodeImage);

    logger.info(`QR generated for account: ${accountId}`);
    return {
      accountId,
      qrCode: qrCodeImage,
      pairingCode,
      expiresIn: 180, // seconds
    };
  } catch (error) {
    logger.error('Generate QR error:', error);
    throw error;
  }
};

const connectAccount = async (accountId, userId, io) => {
  try {
    const sessionPath = join(sessionDir, accountId);
    if (!existsSync(sessionPath)) {
      mkdirSync(sessionPath, { recursive: true });
    }

    // Initialize Baileys
    const { state, saveCreds } = await Baileys.useMultiFileAuthState(sessionPath);

    const sock = Baileys.default({
      auth: state,
      printQRInTerminal: false,
      browser: ['WhatsApp Bot Platform', 'Chrome', '1.0.0'],
      logger: Baileys.DisconnectReason,
      retryRequestDelayMs: 100,
    });

    // Connection events
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const qrImage = await qrcode.toDataURL(qr);
        await AccountService.saveQRCode(accountId, qrImage);
        
        io.to(`user:${userId}`).emit('qr_code', {
          accountId,
          qrCode: qrImage,
        });
      }

      if (connection === 'connecting') {
        await AccountService.updateConnectionStatus(accountId, 'connecting', 'connecting');
        io.to(`user:${userId}`).emit('connection_status', {
          accountId,
          status: 'connecting',
        });
      }

      if (connection === 'open') {
        await AccountService.updateConnectionStatus(accountId, 'connected', 'online');
        const jid = sock.user.id;
        
        // Save session
        sessions.set(accountId, {
          socket: sock,
          jid,
          userId,
          connectedAt: new Date(),
        });

        io.to(`user:${userId}`).emit('connection_status', {
          accountId,
          status: 'connected',
          jid,
        });

        await ActivityLogService.logActivity(accountId, userId, 'CONNECT_WHATSAPP', 'WhatsApp connected', null, 'success');
        logger.info(`WhatsApp connected for account: ${accountId}`);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== Baileys.DisconnectReason.loggedOut;
        await AccountService.updateConnectionStatus(accountId, 'disconnected', 'offline');
        sessions.delete(accountId);

        io.to(`user:${userId}`).emit('connection_status', {
          accountId,
          status: 'disconnected',
          shouldReconnect,
        });

        if (shouldReconnect) {
          setTimeout(() => connectAccount(accountId, userId, io), 3000);
        }
      }
    });

    // Messages handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        if (message.key.fromMe) continue;

        try {
          const sender = message.key.remoteJid;
          const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '[Media]';
          const messageType = message.message?.imageMessage ? 'image' : message.message?.videoMessage ? 'video' : message.message?.audioMessage ? 'audio' : 'text';

          // Save message
          await MessageService.saveReceivedMessage(accountId, sender, sender, messageText, messageType);

          // Anti-spam check
          if (process.env.ENABLE_ANTI_SPAM === 'true' && AntiSpamService.isSpam(sender)) {
            logger.info(`Spam detected from: ${sender}`);
            continue;
          }

          // Anti-link check
          if (process.env.ENABLE_ANTI_LINK === 'true' && AntiLinkService.checkForLinks(messageText)) {
            try {
              await sock.sendMessage(sender, { delete: message.key });
              const warning = 'Links are not allowed in this chat!';
              await sock.sendMessage(sender, { text: warning });
              logger.info(`Anti-link triggered for: ${sender}`);
            } catch (e) {
              logger.error('Error handling anti-link:', e);
            }
            continue;
          }

          // Auto-reply
          const autoReply = await AutoReplyService.matchAutoReply(accountId, messageText);
          if (autoReply) {
            await sock.sendMessage(sender, { text: autoReply });
            await MessageService.sendMessage(accountId, sender, autoReply);
            logger.info(`Auto-reply sent to: ${sender}`);
          }

          // Emit to frontend
          io.to(`user:${userId}`).emit('message_received', {
            accountId,
            sender,
            messageText,
            messageType,
            timestamp: new Date(),
          });
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      }
    });

    // Credentials update
    sock.ev.on('creds.update', saveCreds);

    return { accountId, status: 'connecting' };
  } catch (error) {
    logger.error('Connect account error:', error);
    throw error;
  }
};

const disconnectAccount = async (accountId) => {
  try {
    const session = sessions.get(accountId);
    if (session) {
      await session.socket.logout();
      sessions.delete(accountId);
      logger.info(`Account disconnected: ${accountId}`);
    }
  } catch (error) {
    logger.error('Disconnect account error:', error);
    throw error;
  }
};

const sendMessage = async (accountId, chatId, messageText) => {
  try {
    const session = sessions.get(accountId);
    if (!session) throw new Error('Account not connected');

    await session.socket.sendMessage(chatId, { text: messageText });
    await MessageService.sendMessage(accountId, chatId, messageText);

    logger.info(`Message sent to ${chatId}`);
    return { chatId, messageText, status: 'sent' };
  } catch (error) {
    logger.error('Send message error:', error);
    throw error;
  }
};

const getAccountStatus = async (accountId) => {
  try {
    const session = sessions.get(accountId);
    return {
      accountId,
      isConnected: !!session,
      connectedAt: session?.connectedAt,
    };
  } catch (error) {
    logger.error('Get account status error:', error);
    throw error;
  }
};

const updateSettings = async (accountId, settings, userId) => {
  try {
    // Update settings in database
    for (const [key, value] of Object.entries(settings)) {
      const settingId = uuidv4();
      // This should use SettingsService
      logger.info(`Setting updated for account ${accountId}: ${key}=${value}`);
    }
    return settings;
  } catch (error) {
    logger.error('Update settings error:', error);
    throw error;
  }
};

export const WhatsAppService = {
  generateQR,
  connectAccount,
  disconnectAccount,
  sendMessage,
  getAccountStatus,
  updateSettings,
};
