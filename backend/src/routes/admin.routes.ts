import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply admin protection to all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

// Validation for creating a team
const createTeamSchema = z.object({
  teamId: z.string().min(2, 'Team ID must be at least 2 characters').max(32),
  teamName: z.string().min(2, 'Team name is required').max(128),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  memberCount: z.number().int().min(1).max(10).default(4),
  memberNames: z.string().optional()
});

// GET /api/admin/teams - List all teams
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT 
        id, 
        team_id, 
        team_name, 
        member_count, 
        member_names, 
        is_active, 
        is_qualified, 
        created_at 
      FROM teams 
      ORDER BY id ASC
    `);

    return res.json({
      success: true,
      teams: rows
    });
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve teams.' });
  }
});

// POST /api/admin/teams - Create a new team
router.post('/teams', async (req: Request, res: Response) => {
  try {
    const parseResult = createTeamSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid team data'
      });
    }

    const { teamId, teamName, password, memberCount, memberNames } = parseResult.data;

    // Check uniqueness
    const [existing]: any = await pool.execute(
      'SELECT id FROM teams WHERE LOWER(team_id) = LOWER(?)',
      [teamId.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Team ID '${teamId}' is already taken.`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result]: any = await pool.execute(
      `INSERT INTO teams (team_id, team_name, password_hash, member_count, member_names) 
       VALUES (?, ?, ?, ?, ?)`,
      [teamId.trim(), teamName.trim(), passwordHash, memberCount, memberNames || null]
    );

    // Audit log
    await pool.execute(
      'INSERT INTO audit_logs (actor_type, actor_id, action, details) VALUES (?, ?, ?, ?)',
      ['ADMIN', req.user?.username || 'admin', 'CREATE_TEAM', `Created team '${teamId.trim()}' (${teamName.trim()})`]
    );

    return res.status(201).json({
      success: true,
      message: `Team '${teamId}' registered successfully.`,
      team: {
        id: result.insertId,
        teamId: teamId.trim(),
        teamName: teamName.trim(),
        memberCount,
        memberNames
      }
    });
  } catch (error) {
    console.error('Failed to create team:', error);
    return res.status(500).json({ success: false, message: 'Failed to register team.' });
  }
});

// DELETE /api/admin/teams/:id - Delete a team
router.delete('/teams/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid team ID parameter.' });
    }

    const [rows]: any = await pool.execute(
      'SELECT id, team_id, team_name FROM teams WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const team = rows[0];

    // Delete team (dependent records in submissions are CASCADE deleted)
    await pool.execute('DELETE FROM teams WHERE id = ?', [id]);

    // Record audit log
    await pool.execute(
      'INSERT INTO audit_logs (actor_type, actor_id, action, details) VALUES (?, ?, ?, ?)',
      ['ADMIN', req.user?.username || 'admin', 'DELETE_TEAM', `Deleted team '${team.team_id}' (${team.team_name})`]
    );

    return res.json({
      success: true,
      message: `Team '${team.team_id}' deleted successfully.`
    });
  } catch (error) {
    console.error('Failed to delete team:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete team.' });
  }
});

// GET /api/admin/rounds - Get all event rounds status
router.get('/rounds', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT 
        id, 
        round_key, 
        title, 
        subtitle, 
        round_order, 
        status, 
        duration_minutes, 
        start_time, 
        end_time 
      FROM rounds 
      ORDER BY round_order ASC
    `);

    return res.json({
      success: true,
      rounds: rows
    });
  } catch (error) {
    console.error('Failed to fetch rounds:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve rounds.' });
  }
});

// GET /api/admin/stats - High level event dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [[teamCount]]: any = await pool.execute('SELECT COUNT(*) as total FROM teams');
    const [[activeRounds]]: any = await pool.execute("SELECT COUNT(*) as total FROM rounds WHERE status = 'ACTIVE'");
    const [[submissionCount]]: any = await pool.execute('SELECT COUNT(*) as total FROM submissions');
    const [[qualifiedTeams]]: any = await pool.execute('SELECT COUNT(*) as total FROM teams WHERE is_qualified = TRUE');

    return res.json({
      success: true,
      stats: {
        totalTeams: teamCount.total,
        activeRounds: activeRounds.total,
        totalSubmissions: submissionCount.total,
        qualifiedTeams: qualifiedTeams.total
      }
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to load stats.' });
  }
});

// GET /api/admin/audit-logs - Security audit trail
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(`
      SELECT id, actor_type, actor_id, action, details, ip_address, created_at 
      FROM audit_logs 
      ORDER BY id DESC 
      LIMIT 50
    `);

    return res.json({
      success: true,
      logs: rows
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return res.status(500).json({ success: false, message: 'Failed to load audit logs.' });
  }
});

export default router;
