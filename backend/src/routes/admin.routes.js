import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(requireRole(['admin']));

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deactivateUser);
router.get('/activity-logs', adminController.getSystemLogs);

export default router;
