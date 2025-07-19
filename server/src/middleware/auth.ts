import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: { message: 'Access token required' } });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: { message: 'JWT secret not configured' } });
    return;
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      res.status(403).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    req.user = user as { id: string; email: string };
    next();
  });
};
