import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { MessageService } from '../services/message.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import jwt from 'jsonwebtoken';

const setupSocketIO = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.email = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle QR Code Generation
    socket.on('generate_qr', async (data, callback) => {
      try {
        const { accountId } = data;
        const result = await WhatsAppService.generateQR(accountId, socket.userId);
        
        socket.emit('qr_generated', result);
        callback({ success: true, data: result });
      } catch (error) {
        logger.error('QR generation error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle Connect WhatsApp
    socket.on('connect_whatsapp', async (data, callback) => {
      try {
        const { accountId } = data;
        const result = await WhatsAppService.connectAccount(accountId, socket.userId, io);
        
        // Emit to all user's connected sockets
        io.to(`user:${socket.userId}`).emit('connection_status', {
          accountId,
          status: 'connecting',
          timestamp: new Date(),
        });
        
        callback({ success: true, data: result });
      } catch (error) {
        logger.error('WhatsApp connection error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle Disconnect WhatsApp
    socket.on('disconnect_whatsapp', async (data, callback) => {
      try {
        const { accountId } = data;
        await WhatsAppService.disconnectAccount(accountId);
        
        io.to(`user:${socket.userId}`).emit('connection_status', {
          accountId,
          status: 'disconnected',
          timestamp: new Date(),
        });
        
        callback({ success: true });
      } catch (error) {
        logger.error('WhatsApp disconnection error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle Send Message
    socket.on('send_message', async (data, callback) => {
      try {
        const { accountId, chatId, message, messageType = 'text', mediaUrl } = data;
        
        const result = await MessageService.sendMessage(
          accountId,
          chatId,
          message,
          messageType,
          mediaUrl
        );
        
        io.to(`user:${socket.userId}`).emit('message_sent', {
          messageId: result.id,
          accountId,
          chatId,
          status: 'sent',
          timestamp: new Date(),
        });
        
        callback({ success: true, data: result });
      } catch (error) {
        logger.error('Send message error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle Update Settings
    socket.on('update_settings', async (data, callback) => {
      try {
        const { accountId, settings } = data;
        const result = await WhatsAppService.updateSettings(accountId, settings, socket.userId);
        
        io.to(`user:${socket.userId}`).emit('settings_updated', {
          accountId,
          settings: result,
        });
        
        callback({ success: true, data: result });
      } catch (error) {
        logger.error('Update settings error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle Get Analytics
    socket.on('get_analytics', async (data, callback) => {
      try {
        const { accountId, period = '7d' } = data;
        const analytics = await AnalyticsService.getAnalytics(accountId, period);
        
        callback({ success: true, data: analytics });
      } catch (error) {
        logger.error('Get analytics error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Handle Ping
    socket.on('ping', (callback) => {
      callback({ success: true, timestamp: new Date() });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export { setupSocketIO };
