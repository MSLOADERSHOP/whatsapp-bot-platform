import { AnalyticsService } from '../services/analytics.service.js';
import { logger } from '../utils/logger.js';

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getDashboardStats(req.userId);
    res.json(stats);
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { period = '7d' } = req.query;
    const analytics = await AnalyticsService.getAnalytics(accountId, period);
    res.json(analytics);
  } catch (error) {
    logger.error('Get analytics error:', error);
    next(error);
  }
};

const getMessageAnalytics = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { period = '7d' } = req.query;
    const analytics = await AnalyticsService.getAnalytics(accountId, period);
    res.json({
      totalMessages: analytics.messageCount,
      sentMessages: analytics.sentMessages,
      receivedMessages: analytics.receivedMessages,
      messageTypes: analytics.messageTypes,
      dailyStats: analytics.dailyStats,
    });
  } catch (error) {
    logger.error('Get message analytics error:', error);
    next(error);
  }
};

export { getDashboardStats, getAnalytics, getMessageAnalytics };
