import { app } from './app.js';
import { env } from './config/env.js';
import { testDbConnection, pool } from './config/db.js';

async function startServer() {
  console.log('--- Starting HACK THE SYSTEM Server ---');

  // Verify database connectivity
  const dbConnected = await testDbConnection();
  if (!dbConnected) {
    console.error('CRITICAL: Cannot connect to MySQL/MariaDB database.');
    console.error(`Host: ${env.DB_HOST}:${env.DB_PORT}, Database: ${env.DB_NAME}, User: ${env.DB_USER}`);
    console.error('Please verify XAMPP MySQL is active.');
    process.exit(1);
  }

  console.log(`✓ Connected to MySQL database '${env.DB_NAME}' at ${env.DB_HOST}:${env.DB_PORT}`);

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`✓ Server running at http://localhost:${env.PORT}`);
    console.log(`✓ Event: HACK THE SYSTEM — Think. Decode. Breach.`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await pool.end();
      console.log('MySQL connection pool drained.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

startServer();
