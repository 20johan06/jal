import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

/**
 * Dedicated script to create or verify the single temporary development test team.
 * This is NEVER executed automatically on server start or migration.
 * It must be invoked explicitly: npm run db:test-team
 */
async function createTemporaryTestTeam() {
  console.log('--- Creating Temporary Development Test Team ---');

  const teamId = (process.env.TEST_TEAM_ID || 'TEST-TEAM-01').trim();
  const teamName = (process.env.TEST_TEAM_NAME || '[DEV-TEST] Alpha Squad').trim();
  const password = process.env.TEST_TEAM_PASSWORD || 'cyber2026';
  const memberCount = parseInt(process.env.TEST_TEAM_MEMBER_COUNT || '4', 10);
  const memberNames = process.env.TEST_TEAM_MEMBERS || 'Dev Tester 1, Dev Tester 2, Dev Tester 3, Dev Tester 4';

  if (password.length < 6) {
    console.error('Error: Team password must be at least 6 characters.');
    process.exit(1);
  }

  try {
    const [existing]: any = await pool.execute(
      'SELECT id, team_id, team_name FROM teams WHERE LOWER(team_id) = LOWER(?)',
      [teamId]
    );

    if (existing.length > 0) {
      console.log(`ℹ Temporary test team '${teamId}' already exists in database.`);
      console.log('  You can log in with this team in the participant portal.');
      console.log('  Organizers can delete this team from the Admin Dashboard at any time.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result]: any = await pool.execute(
      `INSERT INTO teams (team_id, team_name, password_hash, member_count, member_names)
       VALUES (?, ?, ?, ?, ?)`,
      [teamId, teamName, passwordHash, memberCount, memberNames]
    );

    console.log(`✓ Temporary development test team created successfully:`);
    console.log(`  Team ID:      ${teamId}`);
    console.log(`  Team Name:    ${teamName}`);
    console.log(`  Member Count: ${memberCount}`);
    console.log(`  Database ID:  ${result.insertId}`);
    console.log('\n[NOTICE] This team is intended solely for local verification.');
    console.log('Delete it through the Organizer Dashboard before the live competition.');
  } catch (error) {
    console.error('Failed to create temporary test team:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTemporaryTestTeam();
