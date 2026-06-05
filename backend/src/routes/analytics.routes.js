import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/:accountId', analyticsController.getAnalytics);
router.get('/:accountId/messages', analyticsController.getMessageAnalytics);

export default router;
