import { poolConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { buildRanking, calculatePrizes } from '@/lib/scoring';

export async function getRankingData() {
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

  return {
    ranking: buildRanking(participants),
    prizes: calculatePrizes(paidParticipants, poolConfig.entryFeeCents),
    paidParticipants,
  };
}
