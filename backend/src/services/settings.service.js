import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const saveSetting = async (accountId, key, value) => {
  try {
    const settingId = uuidv4();

    await runDatabase(
      `INSERT INTO settings (id, account_id, setting_key, setting_value) VALUES (?, ?, ?, ?)
       ON CONFLICT(account_id, setting_key) DO UPDATE SET setting_value = ?`,
      [settingId, accountId, key, value, value]
    );
  } catch (error) {
    logger.error('Save setting error:', error);
    throw error;
  }
};

const getSetting = async (accountId, key) => {
  try {
    const settings = await queryDatabase(
      `SELECT setting_value FROM settings WHERE account_id = ? AND setting_key = ?`,
      [accountId, key]
    );
    return settings.length > 0 ? settings[0].setting_value : null;
  } catch (error) {
    logger.error('Get setting error:', error);
    throw error;
  }
};

const getSettings = async (accountId) => {
  try {
    const settings = await queryDatabase(
      `SELECT setting_key, setting_value FROM settings WHERE account_id = ?`,
      [accountId]
    );

    const result = {};
    settings.forEach(s => {
      result[s.setting_key] = s.setting_value;
    });
    return result;
  } catch (error) {
    logger.error('Get settings error:', error);
    throw error;
  }
};

export const SettingsService = {
  saveSetting,
  getSetting,
  getSettings,
};
