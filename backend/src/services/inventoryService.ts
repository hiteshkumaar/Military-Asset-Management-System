import { Prisma, PrismaClient } from '@prisma/client';

export const updateInventory = async (
  tx: Prisma.TransactionClient,
  baseId: number,
  equipmentId: number,
  quantityChange: number
) => {
  const inventory = await tx.inventory.findUnique({
    where: { baseId_equipmentId: { baseId, equipmentId } }
  });

  if (!inventory) {
    if (quantityChange < 0) {
      throw new Error('Insufficient inventory');
    }
    await tx.inventory.create({
      data: {
        baseId,
        equipmentId,
        quantity: quantityChange,
        openingBalance: 0,
        closingBalance: quantityChange,
      }
    });
  } else {
    if (inventory.quantity + quantityChange < 0) {
      throw new Error('Insufficient inventory');
    }
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: { increment: quantityChange },
        closingBalance: { increment: quantityChange }
      }
    });
  }
};
