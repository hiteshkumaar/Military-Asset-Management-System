import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/prisma';

export const getEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: { category: true }
    });
    return res.json(equipment);
  } catch (error) {
    logger.error('Error fetching equipment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEquipmentById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const equipment = await prisma.equipment.findUnique({ 
      where: { id },
      include: { category: true }
    });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    return res.json(equipment);
  } catch (error) {
    logger.error('Error fetching equipment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, categoryId } = req.body;
    const equipment = await prisma.equipment.create({
      data: { name, description, categoryId },
    });

    await logAudit(req.user?.id || null, 'CREATE', 'Equipment', null, equipment, req.ip, req.originalUrl);

    return res.status(201).json(equipment);
  } catch (error) {
    logger.error('Error creating equipment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, description, categoryId } = req.body;
    
    const prevEq = await prisma.equipment.findUnique({ where: { id } });
    if (!prevEq) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: { name, description, categoryId },
    });

    await logAudit(req.user?.id || null, 'UPDATE', 'Equipment', prevEq, equipment, req.ip, req.originalUrl);

    return res.json(equipment);
  } catch (error) {
    logger.error('Error updating equipment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    const prevEq = await prisma.equipment.findUnique({ where: { id } });
    if (!prevEq) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await prisma.equipment.delete({ where: { id } });

    await logAudit(req.user?.id || null, 'DELETE', 'Equipment', prevEq, null, req.ip, req.originalUrl);

    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting equipment', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
