import prisma from './src/config/prisma';

async function main() {
  try {
    const bases = await prisma.base.findMany();
    console.log('Connected to Prisma successfully. Found bases:', bases.length);
  } catch (err) {
    console.error('Prisma connection failed', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
