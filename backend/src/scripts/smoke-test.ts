import http from 'http';
import { AddressInfo } from 'net';
import bcrypt from 'bcryptjs';
import { app } from '../app.js';
import { pool, testDbConnection } from '../config/db.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runAssertion(name: string, assertionFn: () => Promise<void>) {
  const start = Date.now();
  try {
    await assertionFn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`  ✓ PASS: ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, error: err.message || String(err), durationMs });
    console.error(`  ✗ FAIL: ${name} (${durationMs}ms)`);
    console.error(`    Details: ${err.message || String(err)}`);
  }
}

async function runSmokeTests() {
  console.log('\n======================================================');
  console.log('   HACK THE SYSTEM — AUTOMATED SMOKE TEST SUITE');
  console.log('======================================================\n');

  // 1. Verify database readiness
  const dbOk = await testDbConnection();
  if (!dbOk) {
    console.error('CRITICAL: Cannot connect to MySQL database. Aborting smoke tests.');
    process.exit(1);
  }

  // 2. Start server on ephemeral port for tests
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`✓ Test HTTP server listening on ephemeral port ${port}\n`);

  // 3. Prepare dedicated smoke test credentials (isolated from real teams)
  const testAdminUser = `_smoke_admin_${Date.now()}`;
  const testAdminPass = `smoke_pwd_${Date.now()}_secure`;

  const testTeam1Id = `SMOKE-T1-${Date.now().toString().slice(-4)}`;
  const testTeam1Pass = `pwd_t1_${Date.now()}`;
  const testTeam2Id = `SMOKE-T2-${Date.now().toString().slice(-4)}`;
  const testTeam2Pass = `pwd_t2_${Date.now()}`;

  let adminToken = '';
  let team1Token = '';
  let createdDynamicTeamId = 0;

  try {
    // Seed temporary test admin
    const adminHash = await bcrypt.hash(testAdminPass, 10);
    await pool.execute(
      'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
      [testAdminUser, adminHash, 'admin']
    );

    // Seed temporary test teams with distinctive member counts
    const team1Hash = await bcrypt.hash(testTeam1Pass, 10);
    const team2Hash = await bcrypt.hash(testTeam2Pass, 10);
    await pool.execute(
      'INSERT INTO teams (team_id, team_name, password_hash, member_count, member_names) VALUES (?, ?, ?, 3, ?)',
      [testTeam1Id, 'Smoke Test Team Alpha', team1Hash, 'Tester A, Tester B, Tester C']
    );
    await pool.execute(
      'INSERT INTO teams (team_id, team_name, password_hash, member_count, member_names) VALUES (?, ?, ?, 4, ?)',
      [testTeam2Id, 'Smoke Test Team Beta', team2Hash, 'Dev 1, Dev 2, Dev 3, Dev 4']
    );

    console.log('--- Executing Test Cases ---');

    // Test 1: Backend Health
    await runAssertion('Backend Health Check (GET /api/health)', async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data: any = await res.json();
      if (data.status !== 'ok') throw new Error(`Expected status 'ok', got '${data.status}'`);
      if (!data.event) throw new Error('Missing event metadata in health response');
    });

    // Test 2: Invalid Admin Login
    await runAssertion('Invalid Admin Login Rejection (401)', async () => {
      const res = await fetch(`${baseUrl}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testAdminUser, password: 'wrong_password_999' })
      });
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
      const data: any = await res.json();
      if (data.success !== false) throw new Error('Expected success=false for invalid credentials');
    });

    // Test 3: Valid Admin Login
    await runAssertion('Valid Admin Login & JWT Issuance (200)', async () => {
      const res = await fetch(`${baseUrl}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testAdminUser, password: testAdminPass })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data: any = await res.json();
      if (!data.token) throw new Error('Response did not return JWT token');
      if (data.user?.type !== 'admin') throw new Error(`Expected user.type 'admin', got '${data.user?.type}'`);
      adminToken = data.token;
    });

    // Test 4: Invalid Team Login
    await runAssertion('Invalid Team Login Rejection (401)', async () => {
      const res = await fetch(`${baseUrl}/auth/team/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: testTeam1Id, password: 'incorrect_team_password' })
      });
      if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
      const data: any = await res.json();
      if (data.success !== false) throw new Error('Expected success=false for bad team login');
    });

    // Test 5: Valid Team Login
    await runAssertion('Valid Team Login & Scoped JWT (200)', async () => {
      const res = await fetch(`${baseUrl}/auth/team/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: testTeam1Id, password: testTeam1Pass })
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data: any = await res.json();
      if (!data.token) throw new Error('Response did not return team token');
      if (data.user?.type !== 'team') throw new Error(`Expected user.type 'team', got '${data.user?.type}'`);
      if (data.user?.teamId !== testTeam1Id) throw new Error(`Expected teamId '${testTeam1Id}', got '${data.user?.teamId}'`);
      team1Token = data.token;
    });

    // Test 6: Unauthenticated Access to Protected Endpoints
    await runAssertion('Unauthenticated Access Denied (401)', async () => {
      const resAdmin = await fetch(`${baseUrl}/admin/teams`);
      if (resAdmin.status !== 401) throw new Error(`Admin endpoint unauth expected 401, got ${resAdmin.status}`);

      const resTeam = await fetch(`${baseUrl}/team/dashboard`);
      if (resTeam.status !== 401) throw new Error(`Team endpoint unauth expected 401, got ${resTeam.status}`);
    });

    // Test 7: Admin / Participant Role Separation
    await runAssertion('Role Separation: Team Forbidden on Admin Endpoints (403)', async () => {
      const res = await fetch(`${baseUrl}/admin/teams`, {
        headers: { 'Authorization': `Bearer ${team1Token}` }
      });
      if (res.status !== 403) throw new Error(`Expected HTTP 403, got ${res.status}`);
      const data: any = await res.json();
      if (!data.message?.toLowerCase().includes('admin')) {
        throw new Error(`Unexpected message: ${data.message}`);
      }
    });

    await runAssertion('Role Separation: Admin Forbidden on Participant Endpoints (403)', async () => {
      const res = await fetch(`${baseUrl}/team/dashboard`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.status !== 403) throw new Error(`Expected HTTP 403, got ${res.status}`);
      const data: any = await res.json();
      if (!data.message?.toLowerCase().includes('team')) {
        throw new Error(`Unexpected message: ${data.message}`);
      }
    });

    // Test 8: Team-Specific Data Isolation & Dynamic Roster Count
    await runAssertion('Team Data Isolation & Dynamic Roster Count from MySQL', async () => {
      const res = await fetch(`${baseUrl}/team/dashboard`, {
        headers: { 'Authorization': `Bearer ${team1Token}` }
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const data: any = await res.json();

      if (data.team?.team_id !== testTeam1Id) {
        throw new Error(`Data leak: Expected team '${testTeam1Id}', got '${data.team?.team_id}'`);
      }
      if (data.team?.team_id === testTeam2Id) {
        throw new Error(`Critical Isolation Breach: Team 1 received Team 2 data!`);
      }
      if (data.teams) {
        throw new Error('Data leak: Roster of all teams was returned to participant');
      }

      // Verify dynamic member count from MySQL (inserted with 3 members)
      if (data.team?.member_count !== 3) {
        throw new Error(`Expected dynamic member_count 3 from MySQL, got ${data.team?.member_count}`);
      }
      if (!data.team?.member_names?.includes('Tester A')) {
        throw new Error(`Expected member_names containing 'Tester A', got '${data.team?.member_names}'`);
      }
    });

    // Test 9: Admin Dynamic Team Creation (POST /api/admin/teams)
    await runAssertion('Admin Dynamic Team Creation & Persistence (POST /api/admin/teams)', async () => {
      const dynamicTeamId = `DYN-${Date.now().toString().slice(-4)}`;
      const res = await fetch(`${baseUrl}/admin/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          teamId: dynamicTeamId,
          teamName: 'Dynamic Hackers Squad',
          password: 'secureTeamPassword123',
          memberCount: 2,
          memberNames: 'Alice Hacker, Bob Decoder'
        })
      });

      if (res.status !== 201) throw new Error(`Expected HTTP 201, got ${res.status}`);
      const data: any = await res.json();
      if (!data.success) throw new Error(`Failed to create team: ${data.message}`);
      createdDynamicTeamId = data.team.id;

      // Verify team exists in teams listing
      const listRes = await fetch(`${baseUrl}/admin/teams`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const listData: any = await listRes.json();
      const found = listData.teams.find((t: any) => t.team_id === dynamicTeamId);
      if (!found) throw new Error(`Dynamic team '${dynamicTeamId}' was not found in admin team list`);
      if (found.member_count !== 2) throw new Error(`Expected member_count 2, got ${found.member_count}`);
    });

    // Test 10: Admin Team Deletion (DELETE /api/admin/teams/:id)
    await runAssertion('Admin Team Deletion & Cleanup (DELETE /api/admin/teams/:id)', async () => {
      if (!createdDynamicTeamId) throw new Error('Dynamic team ID not set');

      const delRes = await fetch(`${baseUrl}/admin/teams/${createdDynamicTeamId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (delRes.status !== 200) throw new Error(`Expected HTTP 200, got ${delRes.status}`);
      const delData: any = await delRes.json();
      if (!delData.success) throw new Error(`Delete team failed: ${delData.message}`);

      // Confirm team is no longer returned
      const checkRes = await fetch(`${baseUrl}/admin/teams`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const checkData: any = await checkRes.json();
      const stillPresent = checkData.teams.find((t: any) => t.id === createdDynamicTeamId);
      if (stillPresent) throw new Error('Deleted team is still present in database query results');
    });

    // Test 11: Rate Limiting Enforcement
    await runAssertion('Rate Limiting (429 returned when burst limit exceeded)', async () => {
      const spamUser = `rate_test_${Date.now()}`;
      let rateLimited = false;

      for (let i = 0; i < 15; i++) {
        const res = await fetch(`${baseUrl}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: spamUser, password: 'password123' })
        });

        if (res.status === 429) {
          rateLimited = true;
          const retryHeader = res.headers.get('Retry-After');
          if (!retryHeader) throw new Error('429 response missing Retry-After header');
          break;
        }
      }

      if (!rateLimited) {
        throw new Error('Rate limiter did not trigger 429 within expected burst threshold');
      }
    });

  } finally {
    // Clean up temporary smoke test accounts from MySQL
    console.log('\n--- Cleaning Up Test Data ---');
    await pool.execute('DELETE FROM admins WHERE username = ?', [testAdminUser]);
    await pool.execute('DELETE FROM teams WHERE team_id IN (?, ?)', [testTeam1Id, testTeam2Id]);
    await pool.execute('DELETE FROM audit_logs WHERE actor_id IN (?, ?, ?)', [testAdminUser, testTeam1Id, testTeam2Id]);
    if (createdDynamicTeamId) {
      await pool.execute('DELETE FROM teams WHERE id = ?', [createdDynamicTeamId]);
    }
    console.log('✓ Temporary test data purged from database.');

    // Close test server and drain connection pool
    server.close();
    await pool.end();
  }

  // Print Summary
  console.log('\n======================================================');
  console.log('                 SMOKE TEST SUMMARY');
  console.log('======================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`Total Assertions: ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    console.error(`💥 Smoke test suite FAILED with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log('🎉 All automated smoke tests PASSED successfully.');
    process.exit(0);
  }
}

runSmokeTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
