import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from '@hapi/joi';
import { queryDatabase, runDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { ActivityLogService } from '../services/activityLog.service.js';

const schema = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { error, value } = schema.register.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const { username, email, password } = value;

    // Check if user exists
    const existingUser = await queryDatabase(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await runDatabase(
      'INSERT INTO users (id, username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, 'user', 1]
    );

    const user = { id: userId, email, username, role: 'user' };
    const tokens = generateTokens(user);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      ...tokens,
    });
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = schema.login.validate(req.body);
    if (error) {
      error.isJoi = true;
      return next(error);
    }

    const { email, password } = value;

    // Get user
    const users = await queryDatabase('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    const tokens = generateTokens(user);

    // Log activity
    await ActivityLogService.logActivity(
      null,
      user.id,
      'LOGIN',
      `User logged in`,
      req.ip,
      'success'
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      
      // Get user
      const users = await queryDatabase('SELECT * FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = users[0];
      const tokens = generateTokens(user);

      res.json(tokens);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Log activity
    await ActivityLogService.logActivity(
      null,
      req.userId,
      'LOGOUT',
      'User logged out',
      req.ip,
      'success'
    );

    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const users = await queryDatabase('SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?', [
      req.userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

export { register, login, refreshToken, logout, getCurrentUser };
