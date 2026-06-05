import { v4 as uuidv4 } from 'uuid';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const createAutoReplyRule = async (accountId, keyword, replyText, matchType = 'exact') => {
  try {
    const ruleId = uuidv4();

    await runDatabase(
      `INSERT INTO auto_reply_rules (id, account_id, keyword, reply_text, match_type, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ruleId, accountId, keyword, replyText, matchType, 1]
    );

    logger.info(`Auto reply rule created: ${ruleId}`);
    return { id: ruleId, keyword, replyText, matchType, isActive: true };
  } catch (error) {
    logger.error('Create auto reply rule error:', error);
    throw error;
  }
};

const getAutoReplyRules = async (accountId) => {
  try {
    const rules = await queryDatabase(
      `SELECT id, keyword, reply_text, match_type, is_active FROM auto_reply_rules WHERE account_id = ?`,
      [accountId]
    );
    return rules;
  } catch (error) {
    logger.error('Get auto reply rules error:', error);
    throw error;
  }
};

const deleteAutoReplyRule = async (ruleId) => {
  try {
    await runDatabase(`DELETE FROM auto_reply_rules WHERE id = ?`, [ruleId]);
    logger.info(`Auto reply rule deleted: ${ruleId}`);
  } catch (error) {
    logger.error('Delete auto reply rule error:', error);
    throw error;
  }
};

const matchAutoReply = async (accountId, messageText) => {
  try {
    const rules = await getAutoReplyRules(accountId);

    for (const rule of rules) {
      if (!rule.is_active) continue;

      let matched = false;
      if (rule.match_type === 'exact') {
        matched = messageText.toLowerCase() === rule.keyword.toLowerCase();
      } else if (rule.match_type === 'contains') {
        matched = messageText.toLowerCase().includes(rule.keyword.toLowerCase());
      } else if (rule.match_type === 'regex') {
        try {
          const regex = new RegExp(rule.keyword, 'i');
          matched = regex.test(messageText);
        } catch (e) {
          logger.warn(`Invalid regex pattern: ${rule.keyword}`);
        }
      }

      if (matched) {
        return rule.reply_text;
      }
    }

    return null;
  } catch (error) {
    logger.error('Match auto reply error:', error);
    throw error;
  }
};

export const AutoReplyService = {
  createAutoReplyRule,
  getAutoReplyRules,
  deleteAutoReplyRule,
  matchAutoReply,
};
