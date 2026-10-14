import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthPayload {
  type: 'admin' | 'team';
  id: number;
  username?: string;
  role?: string;
  teamId?: string;
  teamName?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any
  });
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied: Authentication token required.' 
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired authentication token.' 
    });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Administrative privileges required.' 
    });
  }
  next();
}

export function requireTeam(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'team') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Valid participant team authentication required.' 
    });
  }
  next();
}
