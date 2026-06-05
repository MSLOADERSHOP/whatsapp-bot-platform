import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const SPAM_THRESHOLD = 5;
const SPAM_WINDOW_MS = 60000;

const messageTimestamps = new Map();

const isSpam = (sender) => {
  const now = Date.now();
  if (!messageTimestamps.has(sender)) {
    messageTimestamps.set(sender, []);
  }

  const timestamps = messageTimestamps.get(sender);
  timestamps.push(now);

  const recentMessages = timestamps.filter(t => now - t < SPAM_WINDOW_MS);
  messageTimestamps.set(sender, recentMessages);

  return recentMessages.length > SPAM_THRESHOLD;
};

const reportSpam = async (accountId, senderJid, messageText, reason) => {
  try {
    const reportId = uuidv4();

    await runDatabase(
      `INSERT INTO spam_reports (id, account_id, sender_jid, message_text, report_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [reportId, accountId, senderJid, messageText, reason]
    );

    logger.info(`Spam reported: ${reportId}`);
    return reportId;
  } catch (error) {
    logger.error('Report spam error:', error);
    throw error;
  }
};

const blockSpammer = async (reportId, accountId) => {
  try {
    await runDatabase(
      `UPDATE spam_reports SET is_blocked = 1 WHERE id = ?`,
      [reportId]
    );

    logger.info(`Spammer blocked: ${reportId}`);
  } catch (error) {
    logger.error('Block spammer error:', error);
    throw error;
  }
};

const getSpamReports = async (accountId) => {
  try {
    const reports = await queryDatabase(
      `SELECT * FROM spam_reports WHERE account_id = ? ORDER BY created_at DESC`,
      [accountId]
    );
    return reports;
  } catch (error) {
    logger.error('Get spam reports error:', error);
    throw error;
  }
};

export const AntiSpamService = {
  isSpam,
  reportSpam,
  blockSpammer,
  getSpamReports,
};
