import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const sendMessage = async (accountId, chatId, messageText, messageType = 'text', mediaUrl = null) => {
  try {
    const messageId = uuidv4();

    await runDatabase(
      `INSERT INTO messages (id, account_id, chat_id, sender, message_text, message_type, media_url, is_from_me)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [messageId, accountId, chatId, 'bot', messageText, messageType, mediaUrl, 1]
    );

    logger.info(`Message sent: ${messageId}`);
    return { id: messageId, chatId, messageText, messageType, status: 'sent' };
  } catch (error) {
    logger.error('Send message error:', error);
    throw error;
  }
};

const getMessageHistory = async (accountId, chatId, limit = 50, offset = 0) => {
  try {
    const messages = await queryDatabase(
      `SELECT * FROM messages WHERE account_id = ? AND chat_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [accountId, chatId, limit, offset]
    );
    return messages.reverse();
  } catch (error) {
    logger.error('Get message history error:', error);
    throw error;
  }
};

const saveReceivedMessage = async (accountId, chatId, sender, messageText, messageType = 'text', mediaUrl = null) => {
  try {
    const messageId = uuidv4();

    await runDatabase(
      `INSERT INTO messages (id, account_id, chat_id, sender, message_text, message_type, media_url, is_from_me)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [messageId, accountId, chatId, sender, messageText, messageType, mediaUrl, 0]
    );

    return messageId;
  } catch (error) {
    logger.error('Save received message error:', error);
    throw error;
  }
};

const broadcastMessage = async (accountId, recipients, messageText, delayMs = 500) => {
  try {
    const results = [];

    for (const recipient of recipients) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      const result = await sendMessage(accountId, recipient, messageText);
      results.push(result);
    }

    logger.info(`Broadcast sent to ${recipients.length} recipients`);
    return { totalSent: results.length, results };
  } catch (error) {
    logger.error('Broadcast error:', error);
    throw error;
  }
};

const scheduleMessage = async (accountId, chatId, messageText, scheduledTime) => {
  try {
    const messageId = uuidv4();

    await runDatabase(
      `INSERT INTO scheduled_messages (id, account_id, chat_id, message_text, scheduled_time, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [messageId, accountId, chatId, messageText, scheduledTime, 'pending']
    );

    logger.info(`Message scheduled: ${messageId}`);
    return { id: messageId, chatId, messageText, scheduledTime, status: 'pending' };
  } catch (error) {
    logger.error('Schedule message error:', error);
    throw error;
  }
};

const getScheduledMessages = async (accountId) => {
  try {
    const messages = await queryDatabase(
      `SELECT * FROM scheduled_messages WHERE account_id = ? AND status = 'pending' ORDER BY scheduled_time ASC`,
      [accountId]
    );
    return messages;
  } catch (error) {
    logger.error('Get scheduled messages error:', error);
    throw error;
  }
};

const updateScheduledMessageStatus = async (messageId, status, sentAt = null) => {
  try {
    await runDatabase(
      `UPDATE scheduled_messages SET status = ?, is_sent = ?, sent_at = ? WHERE id = ?`,
      [status, status === 'sent' ? 1 : 0, sentAt || new Date(), messageId]
    );
  } catch (error) {
    logger.error('Update scheduled message status error:', error);
    throw error;
  }
};

export const MessageService = {
  sendMessage,
  getMessageHistory,
  saveReceivedMessage,
  broadcastMessage,
  scheduleMessage,
  getScheduledMessages,
  updateScheduledMessageStatus,
};
