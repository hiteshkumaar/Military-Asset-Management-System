import { Response } from 'express';
import { logger } from '../config/logger';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateInventory } from '../services/inventoryService';
import prisma from '../config/prisma';

export const createExpenditure = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId, equipmentId, quantity, reason } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const userId = req.user!.id;

    const expenditure = await prisma.$transaction(async (tx) => {
      // Decrease inventory due to expenditure
      await updateInventory(tx, baseId, equipmentId, -quantity);

      const newExpenditure = await tx.expenditure.create({
        data: {
          baseId,
          equipmentId,
          quantity,
          reason,
          createdBy: userId
        }
      });

      return newExpenditure;
    });

    await logAudit(userId, 'CREATE', 'Expenditure', null, expenditure, req.ip, req.originalUrl);

    return res.status(201).json(expenditure);
  } catch (error: any) {
    logger.error('Error creating expenditure', error);
    return res.status(400).json({ message: error.message || 'Internal server error' });
  }
};

export const getExpenditures = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId, equipmentId } = req.query;
    
    const whereClause: any = {};
    if (baseId) whereClause.baseId = parseInt(baseId as string);
    if (equipmentId) whereClause.equipmentId = parseInt(equipmentId as string);

    const expenditures = await prisma.expenditure.findMany({
      where: whereClause,
      include: { base: true, equipment: true }
    });

    return res.json(expenditures);
  } catch (error) {
    logger.error('Error fetching expenditures', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
