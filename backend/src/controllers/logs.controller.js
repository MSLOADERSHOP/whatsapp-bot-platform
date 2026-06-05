import { ActivityLogService } from '../services/activityLog.service.js';
import { logger } from '../utils/logger.js';

const getActivityLogs = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await ActivityLogService.getActivityLogs(req.userId, parseInt(limit), parseInt(offset));
    res.json(logs);
  } catch (error) {
    logger.error('Get activity logs error:', error);
    next(error);
  }
};

const getAccountLogs = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    const logs = await ActivityLogService.getAccountLogs(accountId, parseInt(limit), parseInt(offset));
    res.json(logs);
  } catch (error) {
    logger.error('Get account logs error:', error);
    next(error);
  }
};

export { getActivityLogs, getAccountLogs };
