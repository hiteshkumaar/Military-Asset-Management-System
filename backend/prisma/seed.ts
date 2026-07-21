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

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: passwordHash },
    create: { email: adminEmail, passwordHash: passwordHash, roleId: createdRoles['Admin'], baseId: baseAlpha.id },
  });

  const logisticsEmail = 'logistics@mams.mil';
  await prisma.user.upsert({
    where: { email: logisticsEmail },
    update: { passwordHash: passwordHash },
    create: { email: logisticsEmail, passwordHash: passwordHash, roleId: createdRoles['Logistics Officer'], baseId: baseAlpha.id },
  });

  const commanderEmail = 'commander@mams.mil';
  await prisma.user.upsert({
    where: { email: commanderEmail },
    update: { passwordHash: passwordHash },
    create: { email: commanderEmail, passwordHash: passwordHash, roleId: createdRoles['Base Commander'], baseId: baseAlpha.id },
  });

  console.log('Users seeded.');

  // 4. Equipment Categories & Equipment
  const weaponCat = await prisma.equipmentCategory.upsert({
    where: { name: 'Weapons' },
    update: {},
    create: { name: 'Weapons' },
  });
  const vehicleCat = await prisma.equipmentCategory.upsert({
    where: { name: 'Vehicles' },
    update: {},
    create: { name: 'Vehicles' },
  });

  // We use findFirst to avoid crashing if it already exists (since Equipment name is not unique in schema)
  let m4 = await prisma.equipment.findFirst({ where: { name: 'M4 Carbine' } });
  if (!m4) {
    m4 = await prisma.equipment.create({
      data: { name: 'M4 Carbine', description: 'Standard issue rifle', categoryId: weaponCat.id }
    });
  }

  let humvee = await prisma.equipment.findFirst({ where: { name: 'Humvee' } });
  if (!humvee) {
    humvee = await prisma.equipment.create({
      data: { name: 'Humvee', description: 'Light tactical vehicle', categoryId: vehicleCat.id }
    });
  }
  console.log('Equipment seeded.');

  // 5. Purchases & Inventory
  const purchaseExists = await prisma.purchase.findFirst();
  if (!purchaseExists) {
    await prisma.purchase.create({
      data: { baseId: baseAlpha.id, equipmentId: m4.id, quantity: 500, remarks: 'Initial stock', createdBy: adminUser.id }
    });
    await prisma.purchase.create({
      data: { baseId: baseAlpha.id, equipmentId: humvee.id, quantity: 20, remarks: 'Convoy fleet', createdBy: adminUser.id }
    });

    await prisma.inventory.upsert({
      where: { baseId_equipmentId: { baseId: baseAlpha.id, equipmentId: m4.id } },
      update: { quantity: 450, openingBalance: 0, closingBalance: 450 },
      create: { baseId: baseAlpha.id, equipmentId: m4.id, quantity: 450, openingBalance: 0, closingBalance: 450 }
    });
    
    await prisma.inventory.upsert({
      where: { baseId_equipmentId: { baseId: baseAlpha.id, equipmentId: humvee.id } },
      update: { quantity: 18, openingBalance: 0, closingBalance: 18 },
      create: { baseId: baseAlpha.id, equipmentId: humvee.id, quantity: 18, openingBalance: 0, closingBalance: 18 }
    });

    // 6. Assignments
    await prisma.assignment.create({
      data: {
        personnelName: 'John Doe',
        rank: 'Sergeant',
        unit: 'Alpha Company',
        equipmentId: m4.id,
        quantity: 50,
        status: 'ASSIGNED',
        createdBy: adminUser.id
      }
    });

    // 7. Expenditures
    await prisma.expenditure.create({
      data: {
        baseId: baseAlpha.id,
        equipmentId: humvee.id,
        quantity: 2,
        reason: 'Decommissioned due to damage',
        createdBy: adminUser.id
      }
    });
    
    // 8. Base Bravo & Transfers
    const baseBravo = await prisma.base.upsert({
      where: { name: 'Base Bravo' },
      update: {},
      create: { name: 'Base Bravo', location: 'Sector 8H' },
    });
    
    await prisma.transfer.create({
      data: {
        fromBaseId: baseAlpha.id,
        toBaseId: baseBravo.id,
        equipmentId: m4.id,
        quantity: 100,
        remarks: 'Reallocation to Bravo',
        status: 'APPROVED',
        createdBy: adminUser.id,
        approvedBy: adminUser.id
      }
    });
    
    await prisma.inventory.upsert({
      where: { baseId_equipmentId: { baseId: baseBravo.id, equipmentId: m4.id } },
      update: { quantity: 100, openingBalance: 0, closingBalance: 100 },
      create: { baseId: baseBravo.id, equipmentId: m4.id, quantity: 100, openingBalance: 0, closingBalance: 100 }
    });
    console.log('Transactions & Analytics seeded.');
  }
  console.log('--------------------------------------------------');
  console.log('Here are your Login Credentials:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`\nEmail: logistics@mams.mil`);
  console.log(`Password: ${adminPassword}`);
  console.log(`\nEmail: commander@mams.mil`);
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
