import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const getAnalytics = async (accountId, period = '7d') => {
  try {
    const daysMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
    };

    const days = daysMap[period] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Message count
    const messageCount = await queryDatabase(
      `SELECT COUNT(*) as count FROM messages WHERE account_id = ? AND timestamp > ?`,
      [accountId, startDate]
    );

    // Sent vs Received
    const sentVsReceived = await queryDatabase(
      `SELECT 
        SUM(CASE WHEN is_from_me = 1 THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN is_from_me = 0 THEN 1 ELSE 0 END) as received
       FROM messages WHERE account_id = ? AND timestamp > ?`,
      [accountId, startDate]
    );

    // Active chats
    const activeChats = await queryDatabase(
      `SELECT COUNT(DISTINCT chat_id) as count FROM messages WHERE account_id = ? AND timestamp > ?`,
      [accountId, startDate]
    );

    // Message types
    const messageTypes = await queryDatabase(
      `SELECT message_type, COUNT(*) as count FROM messages WHERE account_id = ? AND timestamp > ? GROUP BY message_type`,
      [accountId, startDate]
    );

    // Daily stats
    const dailyStats = await queryDatabase(
      `SELECT DATE(timestamp) as date, COUNT(*) as count FROM messages WHERE account_id = ? AND timestamp > ? GROUP BY DATE(timestamp)`,
      [accountId, startDate]
    );

    return {
      period,
      messageCount: messageCount[0]?.count || 0,
      sentMessages: sentVsReceived[0]?.sent || 0,
      receivedMessages: sentVsReceived[0]?.received || 0,
      activeChats: activeChats[0]?.count || 0,
      messageTypes,
      dailyStats,
    };
  } catch (error) {
    logger.error('Get analytics error:', error);
    throw error;
  }
};

const getDashboardStats = async (userId) => {
  try {
    // Total accounts
    const accounts = await queryDatabase(
      `SELECT COUNT(*) as count FROM accounts WHERE user_id = ? AND is_active = 1`,
      [userId]
    );

    // Connected accounts
    const connectedAccounts = await queryDatabase(
      `SELECT COUNT(*) as count FROM accounts WHERE user_id = ? AND is_active = 1 AND status = 'connected'`,
      [userId]
    );

    // Total messages
    const totalMessages = await queryDatabase(
      `SELECT COUNT(*) as count FROM messages WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ?)`,
      [userId]
    );

    // Activity in last 24 hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityToday = await queryDatabase(
      `SELECT COUNT(*) as count FROM activity_logs WHERE user_id = ? AND timestamp > ?`,
      [userId, today]
    );

    return {
      totalAccounts: accounts[0]?.count || 0,
      connectedAccounts: connectedAccounts[0]?.count || 0,
      totalMessages: totalMessages[0]?.count || 0,
      activityToday: activityToday[0]?.count || 0,
    };
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    throw error;
  }
};

export const AnalyticsService = {
  getAnalytics,
  getDashboardStats,
};
