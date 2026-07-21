import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const roles = ['Admin', 'Logistics Officer', 'Base Commander'];
  const createdRoles: Record<string, number> = {};
  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    createdRoles[roleName] = role.id;
  }
  console.log('Roles seeded.');

  // 2. Seed Bases
  const baseAlpha = await prisma.base.upsert({
    where: { name: 'Base Alpha' },
    update: {},
    create: {
      name: 'Base Alpha',
      location: 'Sector 7G',
    },
  });
  console.log('Bases seeded.');

  // 3. Seed Users
  const adminEmail = 'admin@mams.mil';
  const adminPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: passwordHash, // Ensure password is correct
    },
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      roleId: createdRoles['Admin'],
      baseId: baseAlpha.id,
    },
  });

  console.log('Users seeded.');
  console.log('--------------------------------------------------');
  console.log('Here are your Login Credentials:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
