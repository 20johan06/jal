import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'hack_the_system',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_dev_secret_replace_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  INITIAL_ADMIN_USERNAME: process.env.INITIAL_ADMIN_USERNAME || 'admin',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || 'admin123456'
};
