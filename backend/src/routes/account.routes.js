import express from 'express';
import * as accountController from '../controllers/account.controller.js';

const router = express.Router();

router.post('/', accountController.createAccount);
router.get('/', accountController.getAccounts);
router.get('/:accountId', accountController.getAccountById);
router.put('/:accountId', accountController.updateAccount);
router.delete('/:accountId', accountController.deleteAccount);
router.post('/:accountId/connect', accountController.connectAccount);
router.post('/:accountId/disconnect', accountController.disconnectAccount);
router.get('/:accountId/status', accountController.getAccountStatus);
router.get('/:accountId/qr', accountController.generateQR);

export default router;
