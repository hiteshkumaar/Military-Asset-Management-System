import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateInventory } from '../services/inventoryService';

const prisma = new PrismaClient();

export const createPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId, equipmentId, quantity, remarks } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const userId = req.user!.id;

    // Run within a transaction for ACID compliance
    const purchase = await prisma.$transaction(async (tx) => {
      const newPurchase = await tx.purchase.create({
        data: {
          baseId,
          equipmentId,
          quantity,
          remarks,
          createdBy: userId
        }
      });

      // Increase inventory
      await updateInventory(tx, baseId, equipmentId, quantity);

      return newPurchase;
    });

    await logAudit(userId, 'CREATE', 'Purchase', null, purchase, req.ip, req.originalUrl);

    return res.status(201).json(purchase);
  } catch (error: any) {
    logger.error('Error creating purchase', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const getPurchases = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId, equipmentId } = req.query;
    
    const whereClause: any = {};
    if (baseId) whereClause.baseId = parseInt(baseId as string);
    if (equipmentId) whereClause.equipmentId = parseInt(equipmentId as string);

    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      include: { base: true, equipment: true }
    });

    return res.json(purchases);
  } catch (error) {
    logger.error('Error fetching purchases', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
