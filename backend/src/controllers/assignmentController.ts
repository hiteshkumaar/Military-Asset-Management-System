import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateInventory } from '../services/inventoryService';

const prisma = new PrismaClient();

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { personnelName, rank, unit, equipmentId, quantity, baseId } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }
    if (!baseId) {
      return res.status(400).json({ message: 'Base ID is required to decrement inventory' });
    }

    const userId = req.user!.id;

    const assignment = await prisma.$transaction(async (tx) => {
      // Decrease inventory from the base assigning the equipment
      await updateInventory(tx, baseId, equipmentId, -quantity);

      const newAssignment = await tx.assignment.create({
        data: {
          personnelName,
          rank,
          unit,
          equipmentId,
          quantity,
          createdBy: userId
        }
      });

      return newAssignment;
    });

    await logAudit(userId, 'CREATE', 'Assignment', null, assignment, req.ip, req.originalUrl);

    return res.status(201).json(assignment);
  } catch (error: any) {
    logger.error('Error creating assignment', error);
    return res.status(400).json({ message: error.message || 'Internal server error' });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: { equipment: true }
    });

    return res.json(assignments);
  } catch (error) {
    logger.error('Error fetching assignments', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
