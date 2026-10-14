import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { adminLoginRateLimiter, teamLoginRateLimiter } from '../middleware/rate-limiter.js';

const router = Router();

// Validation Schemas
const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

const teamLoginSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  password: z.string().min(1, 'Password is required')
});

// Admin Login
router.post('/admin/login', adminLoginRateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = adminLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid input data'
      });
    }

    const { username, password } = parseResult.data;

    const [rows]: any = await pool.execute(
      'SELECT id, username, password_hash, role FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    // Generate Admin Token
    const token = generateToken({
      type: 'admin',
      id: admin.id,
      username: admin.username,
      role: admin.role
    });

    // Record Audit Log
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    await pool.execute(
      'INSERT INTO audit_logs (actor_type, actor_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['ADMIN', admin.username, 'ADMIN_LOGIN', 'Successful administrator authentication', ip]
    );

    return res.json({
      success: true,
      token,
      user: {
        type: 'admin',
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
});

// Participant Team Login
router.post('/team/login', teamLoginRateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = teamLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid input data'
      });
    }

    const { teamId, password } = parseResult.data;

    // Strict lookup: match team_id (case-insensitive trim) and ensure active
    const cleanTeamId = teamId.trim();
    const [rows]: any = await pool.execute(
      'SELECT id, team_id, team_name, password_hash, is_active, is_qualified FROM teams WHERE LOWER(team_id) = LOWER(?)',
      [cleanTeamId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Team ID or password.'
      });
    }

    const team = rows[0];

    if (!team.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This team account is currently deactivated. Contact the event organizer.'
      });
    }

    const passwordMatch = await bcrypt.compare(password, team.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Team ID or password.'
      });
    }

    // Generate Team Token
    const token = generateToken({
      type: 'team',
      id: team.id,
      teamId: team.team_id,
      teamName: team.team_name
    });

    // Record Audit Log
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    await pool.execute(
      'INSERT INTO audit_logs (actor_type, actor_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      ['TEAM', team.team_id, 'TEAM_LOGIN', `Team '${team.team_name}' authenticated`, ip]
    );

    return res.json({
      success: true,
      token,
      user: {
        type: 'team',
        id: team.id,
        teamId: team.team_id,
        teamName: team.team_name,
        isQualified: Boolean(team.is_qualified)
      }
    });
  } catch (error) {
    console.error('Team login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
});

// Authenticated User Inspection
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    if (req.user.type === 'admin') {
      const [rows]: any = await pool.execute(
        'SELECT id, username, role, created_at FROM admins WHERE id = ?',
        [req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      return res.json({
        success: true,
        user: {
          type: 'admin',
          ...rows[0]
        }
      });
    } else if (req.user?.type === 'team') {
      const [rows]: any = await pool.execute(
        'SELECT id, team_id, team_name, member_count, member_names, is_active, is_qualified FROM teams WHERE id = ?',
        [req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }
      return res.json({
        success: true,
        user: {
          type: 'team',
          ...rows[0]
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown actor type' });
  } catch (error) {
    console.error('Auth /me error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user state.' });
  }
});

export default router;
