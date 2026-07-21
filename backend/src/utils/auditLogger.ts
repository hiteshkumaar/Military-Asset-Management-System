import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export const logAudit = async (
  userId: number | null,
  action: string,
  resource: string,
  prevValues: any = null,
  newValues: any = null,
  ipAddress: string | null = null,
  endpoint: string | null = null
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        prevValues: prevValues ? JSON.stringify(prevValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        endpoint,
      },
    });
  } catch (error) {
    logger.error('Failed to create audit log', error);
  }
};
