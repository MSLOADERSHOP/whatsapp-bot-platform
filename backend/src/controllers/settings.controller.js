import { SettingsService } from '../services/settings.service.js';
import { AutoReplyService } from '../services/autoReply.service.js';
import { logger } from '../utils/logger.js';

const getSettings = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const settings = await SettingsService.getSettings(accountId);
    res.json(settings);
  } catch (error) {
    logger.error('Get settings error:', error);
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await SettingsService.saveSetting(accountId, key, value);
    }

    const updatedSettings = await SettingsService.getSettings(accountId);
    res.json(updatedSettings);
  } catch (error) {
    logger.error('Update settings error:', error);
    next(error);
  }
};

const createAutoReplyRule = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { keyword, replyText, matchType = 'exact' } = req.body;
    const rule = await AutoReplyService.createAutoReplyRule(accountId, keyword, replyText, matchType);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Create auto reply rule error:', error);
    next(error);
  }
};

const getAutoReplyRules = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const rules = await AutoReplyService.getAutoReplyRules(accountId);
    res.json(rules);
  } catch (error) {
    logger.error('Get auto reply rules error:', error);
    next(error);
  }
};

const deleteAutoReplyRule = async (req, res, next) => {
  try {
    const { ruleId } = req.params;
    await AutoReplyService.deleteAutoReplyRule(ruleId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete auto reply rule error:', error);
    next(error);
  }
};

export { getSettings, updateSettings, createAutoReplyRule, getAutoReplyRules, deleteAutoReplyRule };
