import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { logger } from '../config/logger';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn(`Forbidden action attempted by user ${req.user?.id || 'unknown'} on ${req.originalUrl}`);
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
