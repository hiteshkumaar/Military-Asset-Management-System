import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { baseId, equipmentId, startDate, endDate } = req.query;

    let baseFilter = {};
    // Base Commanders and Logistics Officers can only view their own base data
    if (req.user!.role !== 'Admin') {
      baseFilter = { baseId: req.user!.baseId };
    } else if (baseId) {
      baseFilter = { baseId: parseInt(baseId as string) };
    }

    let equipmentFilter = {};
    if (equipmentId) {
      equipmentFilter = { equipmentId: parseInt(equipmentId as string) };
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      };
    }

    const commonFilters = {
      ...baseFilter,
      ...equipmentFilter,
      ...dateFilter
    };

    // Calculate aggregated Purchases
    const purchasesAgg = await prisma.purchase.aggregate({
      where: commonFilters,
      _sum: { quantity: true }
    });
    const totalPurchases = purchasesAgg._sum.quantity || 0;

    // Calculate aggregated Assignments
    const assignmentsAgg = await prisma.assignment.aggregate({
      where: {
        ...equipmentFilter,
        ...dateFilter
      },
      _sum: { quantity: true }
    });
    const totalAssignments = assignmentsAgg._sum.quantity || 0;

    // Calculate aggregated Expenditures
    const expendituresAgg = await prisma.expenditure.aggregate({
      where: commonFilters,
      _sum: { quantity: true }
    });
    const totalExpenditures = expendituresAgg._sum.quantity || 0;

    // Transfers IN to the filtered base
    let transfersInWhere = { ...equipmentFilter, ...dateFilter };
    if (baseFilter && (baseFilter as any).baseId) {
       (transfersInWhere as any).toBaseId = (baseFilter as any).baseId;
    }
    const transfersInAgg = await prisma.transfer.aggregate({
      where: transfersInWhere,
      _sum: { quantity: true }
    });
    const totalTransferIn = transfersInAgg._sum.quantity || 0;

    // Transfers OUT from the filtered base
    let transfersOutWhere = { ...equipmentFilter, ...dateFilter };
    if (baseFilter && (baseFilter as any).baseId) {
       (transfersOutWhere as any).fromBaseId = (baseFilter as any).baseId;
    }
    const transfersOutAgg = await prisma.transfer.aggregate({
      where: transfersOutWhere,
      _sum: { quantity: true }
    });
    const totalTransferOut = transfersOutAgg._sum.quantity || 0;

    // Inventory Aggregations
    const inventoryAgg = await prisma.inventory.aggregate({
      where: {
        ...baseFilter,
        ...equipmentFilter
      },
      _sum: {
        openingBalance: true,
        closingBalance: true
      }
    });

    const openingBalance = inventoryAgg._sum.openingBalance || 0;
    const closingBalance = inventoryAgg._sum.closingBalance || 0;

    // Net Movement = Purchases + Transfer In − Transfer Out
    const netMovement = totalPurchases + totalTransferIn - totalTransferOut;

    return res.json({
      openingBalance,
      closingBalance,
      netMovement,
      breakdown: {
        purchases: totalPurchases,
        transfersIn: totalTransferIn,
        transfersOut: totalTransferOut,
        assignments: totalAssignments,
        expenditures: totalExpenditures
      }
    });

  } catch (error) {
    logger.error('Error fetching dashboard analytics', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
