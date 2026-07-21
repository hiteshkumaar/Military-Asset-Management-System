import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.name, baseId: user.baseId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        baseId: user.baseId,
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to 100 recent logs
    });
    return res.json(logs);
  } catch (error) {
    logger.error('Error fetching audit logs', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
