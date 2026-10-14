import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root or current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret || jwtSecret.length < 16) {
  throw new Error(
    'FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is required and must be at least 16 characters long.\n' +
    'Please configure a secure JWT_SECRET in backend/.env before starting the application.'
  );
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'hack_the_system',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  INITIAL_ADMIN_USERNAME: process.env.INITIAL_ADMIN_USERNAME?.trim() || 'admin',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || ''
};
