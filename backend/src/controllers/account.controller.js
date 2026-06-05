import { AccountService } from '../services/account.service.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { logger } from '../utils/logger.js';

const createAccount = async (req, res, next) => {
  try {
    const { display_name, phone_number } = req.body;
    const account = await AccountService.createAccount(req.userId, { display_name, phone_number });
    res.status(201).json(account);
  } catch (error) {
    logger.error('Create account error:', error);
    next(error);
  }
};

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await AccountService.getAccounts(req.userId);
    res.json(accounts);
  } catch (error) {
    logger.error('Get accounts error:', error);
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const account = await AccountService.getAccountById(accountId, req.userId);
    res.json(account);
  } catch (error) {
    logger.error('Get account error:', error);
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { display_name } = req.body;
    const account = await AccountService.updateAccount(accountId, req.userId, { display_name });
    res.json(account);
  } catch (error) {
    logger.error('Update account error:', error);
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    await AccountService.deleteAccount(accountId, req.userId);
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
};

const connectAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    // WhatsApp connection is handled via WebSocket
    res.json({ message: 'Check WebSocket for QR code' });
  } catch (error) {
    logger.error('Connect account error:', error);
    next(error);
  }
};

const disconnectAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    await WhatsAppService.disconnectAccount(accountId);
    res.json({ success: true, message: 'Account disconnected' });
  } catch (error) {
    logger.error('Disconnect account error:', error);
    next(error);
  }
};

const getAccountStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const status = await WhatsAppService.getAccountStatus(accountId);
    res.json(status);
  } catch (error) {
    logger.error('Get account status error:', error);
    next(error);
  }
};

const generateQR = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const qr = await WhatsAppService.generateQR(accountId, req.userId);
    res.json(qr);
  } catch (error) {
    logger.error('Generate QR error:', error);
    next(error);
  }
};

export { createAccount, getAccounts, getAccountById, updateAccount, deleteAccount, connectAccount, disconnectAccount, getAccountStatus, generateQR };
