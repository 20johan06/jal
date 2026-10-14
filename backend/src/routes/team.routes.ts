import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken, requireTeam } from '../middleware/auth.js';

const router = Router();

// Apply participant team authentication to all routes in this router
router.use(authenticateToken);
router.use(requireTeam);

// GET /api/team/profile - Get profile of authenticated team only
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const teamId = req.user?.id;
    if (!teamId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated team request' });
    }

    const [rows]: any = await pool.execute(
      `SELECT id, team_id, team_name, member_count, member_names, is_active, is_qualified, created_at 
       FROM teams WHERE id = ?`,
      [teamId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Team profile not found' });
    }

    return res.json({
      success: true,
      team: rows[0]
    });
  } catch (error) {
    console.error('Failed to fetch team profile:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving team profile' });
  }
});

// GET /api/team/dashboard - Dashboard view with server time synchronization
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const teamDbId = req.user?.id;
    if (!teamDbId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated team request' });
    }

    // Fetch team summary with real member details
    const [teamRows]: any = await pool.execute(
      `SELECT id, team_id, team_name, member_count, member_names, is_active, is_qualified FROM teams WHERE id = ?`,
      [teamDbId]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Calculate team's total points awarded so far
    const [[scoreRow]]: any = await pool.execute(
      `SELECT COALESCE(SUM(points_awarded), 0) AS total_score, COUNT(*) as submission_count 
       FROM submissions WHERE team_id = ?`,
      [teamDbId]
    );

    // Fetch public status of official rounds (no answers or hidden clues)
    const [rounds]: any = await pool.execute(`
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

    // Official server time (ISO 8601) to prevent client clock drift
    const serverTime = new Date().toISOString();

    return res.json({
      success: true,
      serverTime,
      team: teamRows[0],
      stats: {
        score: scoreRow.total_score,
        submissions: scoreRow.submission_count
      },
      rounds
    });
  } catch (error) {
    console.error('Failed to fetch team dashboard:', error);
    return res.status(500).json({ success: false, message: 'Error loading team dashboard' });
  }
});

export default router;
