import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { calculatePrizes, buildRanking } from '../src/lib/scoring';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

async function main() {
  const entryFeeCents = Number(process.env.ENTRY_FEE_CENTS ?? 1000);
  const [participants, paidParticipants] = await Promise.all([
    prisma.participant.findMany({
      include: {
        bets: {
          include: {
            match: true,
          },
        },
      },
    }),
    prisma.participant.count({
      where: {
        paymentStatus: 'PAID',
      },
    }),
  ]);
  const ranking = buildRanking(participants);
  const prizes = calculatePrizes(paidParticipants, entryFeeCents);

  console.log(`Participantes pagos: ${paidParticipants}`);
  console.log(`Premio total: ${formatCurrency(prizes.total)}`);
  console.log(`1o: ${formatCurrency(prizes.first)} | 2o: ${formatCurrency(prizes.second)} | 3o: ${formatCurrency(prizes.third)}`);
  console.table(
    ranking.map((row, index) => ({
      posicao: index + 1,
      participante: row.name,
      pontos: row.points,
      exatos: row.exactHits,
      vencedor_empate: row.outcomeHits,
      pagamento: row.paymentStatus,
    })),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
