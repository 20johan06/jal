import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function promptCredentials(): Promise<{ username: string; password: string; forceUpdate: boolean }> {
  const args = process.argv.slice(2);
  const forceUpdate = args.includes('--update') || args.includes('--force');
  const cleanArgs = args.filter(a => !a.startsWith('--'));

  // 1. Passed via CLI arguments (e.g. for non-interactive automation)
  if (cleanArgs.length >= 2) {
    return { username: cleanArgs[0].trim(), password: cleanArgs[1], forceUpdate };
  }

  // 2. Passed via environment variables
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    return {
      username: process.env.ADMIN_USERNAME.trim(),
      password: process.env.ADMIN_PASSWORD,
      forceUpdate
    };
  }

  // 3. Fallback to safe interactive prompt
  console.log('--- HACK THE SYSTEM: Admin Account Creation ---');
  console.log('Enter administrator credentials (password must be at least 8 characters):');

  const rl = readline.createInterface({ input, output });
  try {
    const username = (await rl.question('Admin Username: ')).trim();
    const password = (await rl.question('Admin Password: ')).trim();
    return { username, password, forceUpdate };
  } finally {
    rl.close();
  }
}

async function createAdmin() {
  try {
    const { username, password, forceUpdate } = await promptCredentials();

    if (!username) {
      console.error('Error: Username cannot be empty.');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('Error: Admin password must be at least 8 characters long.');
      process.exit(1);
    }

    const [existing]: any = await pool.execute(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existing.length > 0) {
      if (!forceUpdate) {
        console.error(`Admin user '${username}' already exists. Password was NOT changed.`);
        console.error('To intentionally update an existing admin password, pass the --update flag.');
        process.exit(1);
      }

      await pool.execute(
        'UPDATE admins SET password_hash = ? WHERE username = ?',
        [passwordHash, username]
      );
      console.log(`✓ Admin user '${username}' password successfully updated.`);
    } else {
      await pool.execute(
        'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
        [username, passwordHash, 'admin']
      );
      console.log(`✓ New admin user '${username}' successfully created.`);
    }
  } catch (error) {
    console.error('Failed to create/update admin:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
