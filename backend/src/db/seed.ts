import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

export async function runSeed() {
  console.log('--- Running Initial Event Seed ---');

  // 1. Seed initial admin account if configured and not already existing
  const [existingAdmin]: any = await pool.execute(
    'SELECT id, username FROM admins WHERE username = ?',
    [env.INITIAL_ADMIN_USERNAME]
  );

  if (existingAdmin.length === 0) {
    if (env.INITIAL_ADMIN_PASSWORD && env.INITIAL_ADMIN_PASSWORD.length >= 8) {
      const salt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash(env.INITIAL_ADMIN_PASSWORD, salt);

      await pool.execute(
        'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
        [env.INITIAL_ADMIN_USERNAME, adminPasswordHash, 'admin']
      );
      console.log(`✓ Initial administrator '${env.INITIAL_ADMIN_USERNAME}' created.`);
    } else {
      console.log(
        `ℹ INITIAL_ADMIN_PASSWORD not set or < 8 chars in environment.\n` +
        `  Run 'npm run db:admin' to interactively create an organizer account.`
      );
    }
  } else {
    console.log(`ℹ Administrator '${env.INITIAL_ADMIN_USERNAME}' already exists. Existing credentials preserved.`);
  }

  // 2. Seed the 3 official event rounds (Configuration Constants)
  const rounds = [
    {
      key: 'ACCESS_DENIED',
      title: 'ACCESS DENIED',
      subtitle: 'Level 1: Entry Point Analysis & Credential Breach (Easy to Medium)',
      order: 1,
      duration: 45
    },
    {
      key: 'PHANTOM_TRACE',
      title: 'PHANTOM TRACE',
      subtitle: 'Level 2: Forensic Log Reconstruction & Network Artifacts (Medium to Hard)',
      order: 2,
      duration: 60
    },
    {
      key: 'SYSTEM_OVERRIDE',
      title: 'SYSTEM OVERRIDE',
      subtitle: 'Level 3: Grand Final Incident Investigation & Safe Exploit Mitigation (Hard)',
      order: 3,
      duration: 90
    }
  ];

  for (const round of rounds) {
    const [existingRound]: any = await pool.execute(
      'SELECT id, round_key FROM rounds WHERE round_key = ?',
      [round.key]
    );

    if (existingRound.length === 0) {
      await pool.execute(
        `INSERT INTO rounds (round_key, title, subtitle, round_order, status, duration_minutes) 
         VALUES (?, ?, ?, ?, 'LOCKED', ?)`,
        [round.key, round.title, round.subtitle, round.order, round.duration]
      );
      console.log(`✓ Round '${round.key}' initialized.`);
    } else {
      console.log(`ℹ Round '${round.key}' already registered.`);
    }
  }

  console.log('✓ Seeding complete. No demonstration teams or business records were inserted.');
}

// Execute directly if run as a script
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => {
      console.log('Seed process completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed process encountered an error:', err);
      process.exit(1);
    });
}
