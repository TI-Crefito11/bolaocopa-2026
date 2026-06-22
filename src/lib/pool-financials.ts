import { poolConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { calculatePrizeDistribution } from '@/lib/scoring';

export type PoolTransactionSummary = {
  kind: string;
  amountCents: number;
};

export type PoolFinancialsInput = {
  paidParticipants: number;
  entryFeeCents: number;
  transactions: PoolTransactionSummary[];
};

export function calculatePoolFinancials(input: PoolFinancialsInput) {
  const baseRevenueCents = input.paidParticipants * input.entryFeeCents;
  const manualAdditionsCents = input.transactions
    .filter((transaction) => transaction.kind === 'ADD')
    .reduce((total, transaction) => total + transaction.amountCents, 0);
  const manualRemovalsCents = input.transactions
    .filter((transaction) => transaction.kind === 'REMOVE')
    .reduce((total, transaction) => total + transaction.amountCents, 0);
  const totalRevenueCents = baseRevenueCents + manualAdditionsCents - manualRemovalsCents;

  return {
    paidParticipants: input.paidParticipants,
    entryFeeCents: input.entryFeeCents,
    baseRevenueCents,
    manualAdditionsCents,
    manualRemovalsCents,
    totalRevenueCents,
    prizes: calculatePrizeDistribution(totalRevenueCents),
  };
}

export function canRemoveFromPool(amountCents: number, totalRevenueCents: number): boolean {
  return amountCents > 0 && amountCents <= totalRevenueCents;
}

export async function getPoolFinancials() {
  const [paidParticipants, transactions] = await Promise.all([
    prisma.participant.count({
      where: {
        paymentStatus: 'PAID',
      },
    }),
    prisma.$queryRaw<PoolTransactionSummary[]>`
      SELECT kind, amountCents
      FROM PoolTransaction
    `,
  ]);

  return calculatePoolFinancials({
    paidParticipants,
    entryFeeCents: poolConfig.entryFeeCents,
    transactions,
  });
}
