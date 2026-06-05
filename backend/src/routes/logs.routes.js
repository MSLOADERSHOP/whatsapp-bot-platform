import express from 'express';
import * as logsController from '../controllers/logs.controller.js';

const router = express.Router();

router.get('/activity', logsController.getActivityLogs);
router.get('/account/:accountId', logsController.getAccountLogs);

export default router;
