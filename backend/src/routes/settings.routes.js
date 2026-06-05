import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/:accountId', settingsController.getSettings);
router.put('/:accountId', settingsController.updateSettings);
router.post('/:accountId/auto-reply', settingsController.createAutoReplyRule);
router.get('/:accountId/auto-reply', settingsController.getAutoReplyRules);
router.delete('/auto-reply/:ruleId', settingsController.deleteAutoReplyRule);

export default router;
