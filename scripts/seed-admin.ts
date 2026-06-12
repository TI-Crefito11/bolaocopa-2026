import 'dotenv/config';
import { hashPassword } from '../src/lib/password';
import { prisma } from '../src/lib/prisma';

async function main() {
  const name = process.env.ADMIN_SEED_NAME ?? 'Administrador';
  const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password || password === 'change-me') {
    throw new Error('Set ADMIN_SEED_PASSWORD in .env before seeding the admin user.');
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash: hashPassword(password),
      active: true,
    },
    create: {
      name,
      email,
      passwordHash: hashPassword(password),
      active: true,
    },
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
