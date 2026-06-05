import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const ANTI_LINK_PATTERNS = [
  /https?:\/\//gi,
  /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
];

const checkForLinks = (message) => {
  for (const pattern of ANTI_LINK_PATTERNS) {
    if (pattern.test(message)) {
      return true;
    }
  }
  return false;
};

const createAntiLinkRule = async (accountId, action = 'delete') => {
  try {
    const ruleId = uuidv4();

    await runDatabase(
      `INSERT INTO settings (id, account_id, setting_key, setting_value) VALUES (?, ?, ?, ?)`,
      [ruleId, accountId, 'anti_link_action', action]
    );

    logger.info(`Anti-link rule created: ${ruleId}`);
    return { id: ruleId, action };
  } catch (error) {
    logger.error('Create anti-link rule error:', error);
    throw error;
  }
};

const getAntiLinkRule = async (accountId) => {
  try {
    const rules = await queryDatabase(
      `SELECT setting_value FROM settings WHERE account_id = ? AND setting_key = 'anti_link_action'`,
      [accountId]
    );
    return rules.length > 0 ? rules[0].setting_value : null;
  } catch (error) {
    logger.error('Get anti-link rule error:', error);
    throw error;
  }
};

export const AntiLinkService = {
  checkForLinks,
  createAntiLinkRule,
  getAntiLinkRule,
};
