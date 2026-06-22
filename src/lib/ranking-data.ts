import { getPoolFinancials } from '@/lib/pool-financials';
import { prisma } from '@/lib/prisma';
import { buildRanking } from '@/lib/scoring';

export async function getRankingData() {
  const [participants, financials] = await Promise.all([
    prisma.participant.findMany({
      include: {
        bets: {
          include: {
            scorers: {
              orderBy: { position: 'asc' },
            },
            match: {
              include: {
                scorers: {
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
    }),
    getPoolFinancials(),
  ]);

  return {
    ranking: buildRanking(participants),
    prizes: financials.prizes,
    paidParticipants: financials.paidParticipants,
    financials,
  };
}
