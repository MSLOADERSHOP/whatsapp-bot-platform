import { MessageService } from '../services/message.service.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { logger } from '../utils/logger.js';

const sendMessage = async (req, res, next) => {
  try {
    const { accountId, chatId, messageText } = req.body;
    const result = await WhatsAppService.sendMessage(accountId, chatId, messageText);
    res.json(result);
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

const getMessageHistory = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { accountId, limit = 50, offset = 0 } = req.query;
    const messages = await MessageService.getMessageHistory(accountId, chatId, parseInt(limit), parseInt(offset));
    res.json(messages);
  } catch (error) {
    logger.error('Get message history error:', error);
    next(error);
  }
};

const scheduleMessage = async (req, res, next) => {
  try {
    const { accountId, chatId, messageText, scheduledTime } = req.body;
    const result = await MessageService.scheduleMessage(accountId, chatId, messageText, scheduledTime);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Schedule message error:', error);
    next(error);
  }
};

const broadcastMessage = async (req, res, next) => {
  try {
    const { accountId, recipients, messageText, delayMs = 500 } = req.body;
    const result = await MessageService.broadcastMessage(accountId, recipients, messageText, delayMs);
    res.json(result);
  } catch (error) {
    logger.error('Broadcast message error:', error);
    next(error);
  }
};

const getScheduledMessages = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const messages = await MessageService.getScheduledMessages(accountId);
    res.json(messages);
  } catch (error) {
    logger.error('Get scheduled messages error:', error);
    next(error);
  }
};

const updateScheduledMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    await MessageService.updateScheduledMessageStatus(messageId, status);
    res.json({ success: true });
  } catch (error) {
    logger.error('Update scheduled message error:', error);
    next(error);
  }
};

export { sendMessage, getMessageHistory, scheduleMessage, broadcastMessage, getScheduledMessages, updateScheduledMessage };
