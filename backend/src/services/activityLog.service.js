import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const logActivity = async (accountId, userId, action, description, ipAddress, status = 'success') => {
  try {
    const logId = uuidv4();

    await runDatabase(
      `INSERT INTO activity_logs (id, account_id, user_id, action, description, ip_address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logId, accountId, userId, action, description, ipAddress, status]
    );

    return logId;
  } catch (error) {
    logger.error('Log activity error:', error);
    throw error;
  }
};

const getActivityLogs = async (userId, limit = 100, offset = 0) => {
  try {
    const logs = await queryDatabase(
      `SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return logs;
  } catch (error) {
    logger.error('Get activity logs error:', error);
    throw error;
  }
};

const getAccountLogs = async (accountId, limit = 100, offset = 0) => {
  try {
    const logs = await queryDatabase(
      `SELECT * FROM activity_logs WHERE account_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [accountId, limit, offset]
    );
    return logs;
  } catch (error) {
    logger.error('Get account logs error:', error);
    throw error;
  }
};

export const ActivityLogService = {
  logActivity,
  getActivityLogs,
  getAccountLogs,
};
