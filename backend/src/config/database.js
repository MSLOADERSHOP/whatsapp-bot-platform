import sqlite3 from 'sqlite3';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pkg;

let dbConnection = null;
let isPostgres = false;

const initializeDatabase = async () => {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';

  if (dbType === 'postgres') {
    await initializePostgres();
    isPostgres = true;
  } else {
    await initializeSQLite();
    isPostgres = false;
  }

  await createTables();
};

const initializeSQLite = () => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/whatsapp.db');
    
    dbConnection = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('SQLite connection error:', err);
        reject(err);
      } else {
        logger.info('✅ SQLite connected');
        // Enable foreign keys
        dbConnection.run('PRAGMA foreign_keys = ON');
        resolve();
      }
    });
  });
};

const initializePostgres = async () => {
  try {
    dbConnection = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      user: process.env.DATABASE_USER || 'whatsapp',
      password: process.env.DATABASE_PASSWORD || 'whatsapp123',
      database: process.env.DATABASE_NAME || 'whatsapp_bot',
    });

    await dbConnection.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected');
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    if (isPostgres) {
      await createPostgresTables();
    } else {
      await createSQLiteTables();
    }
    logger.info('✅ Database tables created/verified');
  } catch (error) {
    logger.error('Failed to create tables:', error);
    throw error;
  }
};

const createSQLiteTables = () => {
  return new Promise((resolve, reject) => {
    dbConnection.serialize(() => {
      // Users Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Accounts Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          phone_number TEXT UNIQUE,
          display_name TEXT,
          status TEXT DEFAULT 'disconnected',
          connection_status TEXT DEFAULT 'offline',
          session_data TEXT,
          qr_code TEXT,
          is_active INTEGER DEFAULT 1,
          last_connection DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Messages Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          chat_id TEXT NOT NULL,
          sender TEXT NOT NULL,
          message_text TEXT,
          message_type TEXT DEFAULT 'text',
          media_url TEXT,
          is_from_me INTEGER DEFAULT 0,
          is_read INTEGER DEFAULT 0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
      `);

      // Auto Reply Rules Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS auto_reply_rules (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          keyword TEXT NOT NULL,
          reply_text TEXT NOT NULL,
          match_type TEXT DEFAULT 'exact',
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
      `);

      // Scheduled Messages Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS scheduled_messages (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          chat_id TEXT NOT NULL,
          message_text TEXT NOT NULL,
          scheduled_time DATETIME NOT NULL,
          is_sent INTEGER DEFAULT 0,
          sent_at DATETIME,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
      `);

      // Group Members Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS group_members (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          group_id TEXT NOT NULL,
          member_jid TEXT NOT NULL,
          member_name TEXT,
          role TEXT DEFAULT 'member',
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
      `);

      // Settings Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          setting_key TEXT NOT NULL,
          setting_value TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(account_id, setting_key),
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
      `);

      // Activity Logs Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          account_id TEXT,
          user_id TEXT,
          action TEXT NOT NULL,
          description TEXT,
          ip_address TEXT,
          status TEXT DEFAULT 'success',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Spam Reports Table
      dbConnection.run(`
        CREATE TABLE IF NOT EXISTS spam_reports (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          sender_jid TEXT NOT NULL,
          message_text TEXT,
          report_reason TEXT,
          is_blocked INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

const createPostgresTables = async () => {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      phone_number TEXT UNIQUE,
      display_name TEXT,
      status TEXT DEFAULT 'disconnected',
      connection_status TEXT DEFAULT 'offline',
      session_data TEXT,
      qr_code TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      last_connection TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message_text TEXT,
      message_type TEXT DEFAULT 'text',
      media_url TEXT,
      is_from_me BOOLEAN DEFAULT FALSE,
      is_read BOOLEAN DEFAULT FALSE,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auto_reply_rules (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      keyword TEXT NOT NULL,
      reply_text TEXT NOT NULL,
      match_type TEXT DEFAULT 'exact',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scheduled_messages (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      message_text TEXT NOT NULL,
      scheduled_time TIMESTAMP NOT NULL,
      is_sent BOOLEAN DEFAULT FALSE,
      sent_at TIMESTAMP,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      member_jid TEXT NOT NULL,
      member_name TEXT,
      role TEXT DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      setting_key TEXT NOT NULL,
      setting_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(account_id, setting_key),
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      account_id TEXT,
      user_id TEXT,
      action TEXT NOT NULL,
      description TEXT,
      ip_address TEXT,
      status TEXT DEFAULT 'success',
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS spam_reports (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      sender_jid TEXT NOT NULL,
      message_text TEXT,
      report_reason TEXT,
      is_blocked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_account_id ON messages(account_id);
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
    CREATE INDEX IF NOT EXISTS idx_scheduled_messages_account_id ON scheduled_messages(account_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
  `;

  const statements = createTablesSQL.split(';').filter(s => s.trim());
  for (const statement of statements) {
    await dbConnection.query(statement);
  }
};

const getDatabase = () => dbConnection;
const isPostgresDB = () => isPostgres;

const queryDatabase = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      dbConnection.query(query, params, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      });
    } else {
      dbConnection.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
};

const runDatabase = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      dbConnection.query(query, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    } else {
      dbConnection.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

export { initializeDatabase, getDatabase, isPostgresDB, queryDatabase, runDatabase };
