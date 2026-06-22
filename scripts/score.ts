import 'dotenv/config';
import { getPoolFinancials } from '../src/lib/pool-financials';
import { prisma } from '../src/lib/prisma';
import { buildRanking } from '../src/lib/scoring';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

async function main() {
  const [participants, financials] = await Promise.all([
    prisma.participant.findMany({
      include: {
        bets: {
          include: {
            match: true,
          },
        },
      },
    }),
    getPoolFinancials(),
  ]);
  const ranking = buildRanking(participants);
  const { prizes } = financials;

  console.log(`Participantes pagos: ${financials.paidParticipants}`);
  console.log(`Base pagamentos: ${formatCurrency(financials.baseRevenueCents)}`);
  console.log(`Entradas manuais: ${formatCurrency(financials.manualAdditionsCents)}`);
  console.log(`Retiradas manuais: ${formatCurrency(financials.manualRemovalsCents)}`);
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
