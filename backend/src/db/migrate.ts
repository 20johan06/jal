import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export async function runMigrations() {
  console.log('--- Starting Database Migration ---');
  
  // Create single connection with multipleStatements enabled for initial DDL
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Executing schema definition from: ${schemaPath}`);
    await connection.query(schemaSql);
    console.log('✓ Database schema created and verified successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Execute directly if run as a script
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration encountered an error:', err);
      process.exit(1);
    });
}
