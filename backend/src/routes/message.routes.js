import express from 'express';
import * as messageController from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send', messageController.sendMessage);
router.get('/history/:chatId', messageController.getMessageHistory);
router.post('/schedule', messageController.scheduleMessage);
router.post('/broadcast', messageController.broadcastMessage);
router.get('/scheduled/:accountId', messageController.getScheduledMessages);
router.put('/scheduled/:messageId', messageController.updateScheduledMessage);

export default router;
