import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');

const logger = pino(
  {
    level: logLevel,
    transport: {
      targets: [
        {
          level: logLevel,
          target: 'pino/file',
          options: { destination: path.join(logDir, 'app.log') },
        },
        {
          level: 'error',
          target: 'pino/file',
          options: { destination: path.join(logDir, 'error.log') },
        },
        {
          level: logLevel,
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'SYS:standard',
          },
        },
      ],
    },
  }
);

export { logger };
