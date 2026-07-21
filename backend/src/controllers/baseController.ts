import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getBases = async (req: AuthRequest, res: Response) => {
  try {
    const bases = await prisma.base.findMany();
    return res.json(bases);
  } catch (error) {
    logger.error('Error fetching bases', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBaseById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const base = await prisma.base.findUnique({ where: { id } });
    if (!base) {
      return res.status(404).json({ message: 'Base not found' });
    }
    return res.json(base);
  } catch (error) {
    logger.error('Error fetching base', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBase = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location } = req.body;
    const base = await prisma.base.create({
      data: { name, location },
    });

    await logAudit(req.user?.id || null, 'CREATE', 'Base', null, base, req.ip, req.originalUrl);

    return res.status(201).json(base);
  } catch (error) {
    logger.error('Error creating base', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBase = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, location } = req.body;
    
    const prevBase = await prisma.base.findUnique({ where: { id } });
    if (!prevBase) {
      return res.status(404).json({ message: 'Base not found' });
    }

    const base = await prisma.base.update({
      where: { id },
      data: { name, location },
    });

    await logAudit(req.user?.id || null, 'UPDATE', 'Base', prevBase, base, req.ip, req.originalUrl);

    return res.json(base);
  } catch (error) {
    logger.error('Error updating base', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBase = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    const prevBase = await prisma.base.findUnique({ where: { id } });
    if (!prevBase) {
      return res.status(404).json({ message: 'Base not found' });
    }

    await prisma.base.delete({ where: { id } });

    await logAudit(req.user?.id || null, 'DELETE', 'Base', prevBase, null, req.ip, req.originalUrl);

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting base', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
