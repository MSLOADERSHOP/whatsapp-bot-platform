import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const getAllUsers = async (req, res, next) => {
  try {
    const users = await queryDatabase('SELECT id, username, email, role, is_active, created_at FROM users');
    res.json(users);
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    await runDatabase('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, userId]);
    res.json({ success: true, message: 'User role updated' });
  } catch (error) {
    logger.error('Update user role error:', error);
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await runDatabase('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    next(error);
  }
};

const getSystemLogs = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await queryDatabase(
      'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(logs);
  } catch (error) {
    logger.error('Get system logs error:', error);
    next(error);
  }
};

export { getAllUsers, updateUserRole, deactivateUser, getSystemLogs };
