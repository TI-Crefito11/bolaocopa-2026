import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const defaultMatches = [
  {
    opponent: 'Escocia',
    kickoffAt: new Date('2026-06-13T19:00:00-03:00'),
    betDeadlineAt: new Date('2026-06-13T18:59:00-03:00'),
  },
];

async function main() {
  for (const match of defaultMatches) {
    await prisma.match.create({
      data: match,
    });
  }

  console.log(`Seeded ${defaultMatches.length} Brazil match(es).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
