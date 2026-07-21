import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateInventory } from '../services/inventoryService';

const prisma = new PrismaClient();

export const createTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const { fromBaseId, toBaseId, equipmentId, quantity, remarks } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }
    if (fromBaseId === toBaseId) {
      return res.status(400).json({ message: 'Cannot transfer to the same base' });
    }

    const userId = req.user!.id;

    const transfer = await prisma.$transaction(async (tx) => {
      // Decrease inventory from source
      await updateInventory(tx, fromBaseId, equipmentId, -quantity);

      // Increase inventory in destination
      await updateInventory(tx, toBaseId, equipmentId, quantity);

      const newTransfer = await tx.transfer.create({
        data: {
          fromBaseId,
          toBaseId,
          equipmentId,
          quantity,
          remarks,
          status: 'APPROVED', // Assume auto-approved for now, per requirements it just updates inventory
          createdBy: userId,
          approvedBy: userId
        }
      });

      return newTransfer;
    });

    await logAudit(userId, 'CREATE', 'Transfer', null, transfer, req.ip, req.originalUrl);

    return res.status(201).json(transfer);
  } catch (error: any) {
    logger.error('Error creating transfer', error);
    return res.status(400).json({ message: error.message || 'Internal server error' });
  }
};

export const getTransfers = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId } = req.query;
    
    const whereClause: any = {};
    if (baseId) {
      const parsedBaseId = parseInt(baseId as string);
      whereClause.OR = [
        { fromBaseId: parsedBaseId },
        { toBaseId: parsedBaseId }
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where: whereClause,
      include: { fromBase: true, toBase: true, equipment: true }
    });

    return res.json(transfers);
  } catch (error) {
    logger.error('Error fetching transfers', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
