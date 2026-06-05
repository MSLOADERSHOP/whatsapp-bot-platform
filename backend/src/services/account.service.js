import { v4 as uuidv4 } from 'uuid';
import Joi from '@hapi/joi';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { ActivityLogService } from './activityLog.service.js';

const schema = {
  create: Joi.object({
    display_name: Joi.string().max(100),
    phone_number: Joi.string(),
  }),
  update: Joi.object({
    display_name: Joi.string().max(100),
  }),
};

const createAccount = async (userId, data) => {
  try {
    const { error, value } = schema.create.validate(data);
    if (error) throw error;

    const accountId = uuidv4();
    
    await runDatabase(
      `INSERT INTO accounts (id, user_id, display_name, phone_number, status, connection_status, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [accountId, userId, value.display_name, value.phone_number, 'disconnected', 'offline', 1]
    );

    logger.info(`Account created: ${accountId}`);
    await ActivityLogService.logActivity(accountId, userId, 'CREATE_ACCOUNT', 'Account created', null, 'success');

    return { id: accountId, ...value, status: 'disconnected' };
  } catch (error) {
    logger.error('Create account error:', error);
    throw error;
  }
};

const getAccounts = async (userId) => {
  try {
    const accounts = await queryDatabase(
      `SELECT id, display_name, phone_number, status, connection_status, last_connection, created_at, updated_at
       FROM accounts WHERE user_id = ? AND is_active = 1`,
      [userId]
    );
    return accounts;
  } catch (error) {
    logger.error('Get accounts error:', error);
    throw error;
  }
};

const getAccountById = async (accountId, userId) => {
  try {
    const accounts = await queryDatabase(
      `SELECT * FROM accounts WHERE id = ? AND user_id = ?`,
      [accountId, userId]
    );
    
    if (accounts.length === 0) throw new Error('Account not found');
    return accounts[0];
  } catch (error) {
    logger.error('Get account error:', error);
    throw error;
  }
};

const updateAccount = async (accountId, userId, data) => {
  try {
    const { error, value } = schema.update.validate(data);
    if (error) throw error;

    // Verify account belongs to user
    await getAccountById(accountId, userId);

    await runDatabase(
      `UPDATE accounts SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [value.display_name, accountId]
    );

    logger.info(`Account updated: ${accountId}`);
    await ActivityLogService.logActivity(accountId, userId, 'UPDATE_ACCOUNT', 'Account updated', null, 'success');

    return { id: accountId, ...value };
  } catch (error) {
    logger.error('Update account error:', error);
    throw error;
  }
};

const deleteAccount = async (accountId, userId) => {
  try {
    // Verify account belongs to user
    await getAccountById(accountId, userId);

    await runDatabase(
      `UPDATE accounts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [accountId]
    );

    logger.info(`Account deleted: ${accountId}`);
    await ActivityLogService.logActivity(accountId, userId, 'DELETE_ACCOUNT', 'Account deleted', null, 'success');

    return { success: true };
  } catch (error) {
    logger.error('Delete account error:', error);
    throw error;
  }
};

const updateConnectionStatus = async (accountId, status, connectionStatus) => {
  try {
    await runDatabase(
      `UPDATE accounts SET status = ?, connection_status = ?, last_connection = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, connectionStatus, accountId]
    );
  } catch (error) {
    logger.error('Update connection status error:', error);
    throw error;
  }
};

const saveSessionData = async (accountId, sessionData) => {
  try {
    const data = JSON.stringify(sessionData);
    await runDatabase(
      `UPDATE accounts SET session_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [data, accountId]
    );
  } catch (error) {
    logger.error('Save session data error:', error);
    throw error;
  }
};

const saveQRCode = async (accountId, qrCode) => {
  try {
    await runDatabase(
      `UPDATE accounts SET qr_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [qrCode, accountId]
    );
  } catch (error) {
    logger.error('Save QR code error:', error);
    throw error;
  }
};

export const AccountService = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  updateConnectionStatus,
  saveSessionData,
  saveQRCode,
};
