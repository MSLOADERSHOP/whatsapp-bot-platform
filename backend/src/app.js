import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from './utils/logger.js';
import { initializeDatabase } from './config/database.js';
import { setupSocketIO } from './config/socket.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import messageRoutes from './routes/message.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import logsRoutes from './routes/logs.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Middleware
import { authenticateJWT } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate Limiting
app.use('/api/', rateLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/accounts', authenticateJWT, accountRoutes);
app.use('/api/messages', authenticateJWT, messageRoutes);
app.use('/api/analytics', authenticateJWT, analyticsRoutes);
app.use('/api/settings', authenticateJWT, settingsRoutes);
app.use('/api/logs', authenticateJWT, logsRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);

// Socket.IO Setup
setupSocketIO(io);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

// Initialize and Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Database
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Start HTTP Server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📡 WebSocket ready for connections`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();

export { app, httpServer, io };
