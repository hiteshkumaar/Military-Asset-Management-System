import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/prisma';

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId, equipmentId } = req.query;
    
    const whereClause: any = {};
    
    // Base Commanders and Logistics Officers can only view their own base inventory
    if (req.user!.role !== 'Admin') {
      whereClause.baseId = req.user!.baseId;
    } else if (baseId) {
      whereClause.baseId = parseInt(baseId as string);
    }

    if (equipmentId) {
      whereClause.equipmentId = parseInt(equipmentId as string);
    }

    const inventory = await prisma.inventory.findMany({
      where: whereClause,
      include: { base: true, equipment: { include: { category: true } } }
    });

    return res.json(inventory);
  } catch (error) {
    logger.error('Error fetching inventory', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
