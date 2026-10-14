import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function createAdmin() {
  const args = process.argv.slice(2);
  const username = args[0];
  const password = args[1];

  if (!username || !password) {
    console.error('Usage: npm run db:admin <username> <password>');
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    const [existing]: any = await pool.execute(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
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
    process.exit(0);
  }
}

createAdmin();
