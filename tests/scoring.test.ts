import { describe, expect, it } from 'vitest';
import { canRemoveFromPool, calculatePoolFinancials } from '@/lib/pool-financials';
import { buildRanking, calculatePrizeDistribution, calculatePrizes, scoreBet } from '@/lib/scoring';

describe('scoreBet', () => {
  const actual = {
    actualBrazilGoals: 3,
    actualOpponentGoals: 1,
  };

  it('scores exact score with 10 points', () => {
    expect(scoreBet({ ...actual, betBrazilGoals: 3, betOpponentGoals: 1 }).points).toBe(10);
  });

  it('scores correct winner with 5 points', () => {
    expect(scoreBet({ ...actual, betBrazilGoals: 2, betOpponentGoals: 1 }).points).toBe(5);
  });

  it('scores only Brazil goals with 3 points', () => {
    expect(scoreBet({ ...actual, betBrazilGoals: 3, betOpponentGoals: 0 }).points).toBe(3);
  });

  it('scores only opponent goals with 3 points', () => {
    expect(scoreBet({ ...actual, betBrazilGoals: 0, betOpponentGoals: 1 }).points).toBe(3);
  });

  it('scores no hit with 0 points', () => {
    expect(scoreBet({ ...actual, betBrazilGoals: 1, betOpponentGoals: 2 }).points).toBe(0);
  });

  it('does not score unfinished matches', () => {
    expect(
      scoreBet({
        actualBrazilGoals: null,
        actualOpponentGoals: null,
        betBrazilGoals: 2,
        betOpponentGoals: 1,
        actualBrazilScorerIds: [1, 2],
        betBrazilScorerIds: [1, 2],
      }).points,
    ).toBe(0);
  });

  it('adds 4 points per Brazil scorer hit', () => {
    expect(
      scoreBet({
        ...actual,
        betBrazilGoals: 3,
        betOpponentGoals: 1,
        actualBrazilScorerIds: [1, 2, 3],
        betBrazilScorerIds: [1, 2, 4],
      }).points,
    ).toBe(18);
  });

  it('scores repeated scorers by occurrence', () => {
    expect(
      scoreBet({
        ...actual,
        betBrazilGoals: 3,
        betOpponentGoals: 1,
        actualBrazilScorerIds: [1, 1, 2],
        betBrazilScorerIds: [1, 1, 3],
      }).points,
    ).toBe(18);
  });

  it('does not require scorer order to match', () => {
    expect(
      scoreBet({
        ...actual,
        betBrazilGoals: 2,
        betOpponentGoals: 1,
        actualBrazilScorerIds: [1, 2, 3],
        betBrazilScorerIds: [3, 1],
      }).points,
    ).toBe(13);
  });
});

describe('buildRanking', () => {
  it('sorts by points, exact hits, outcome hits, and earliest submission', () => {
    const submittedEarly = new Date('2026-06-01T10:00:00Z');
    const submittedLate = new Date('2026-06-01T11:00:00Z');
    const ranking = buildRanking([
      {
        id: 1,
        name: 'Late',
        paymentStatus: 'PAID',
        bets: [
          {
            submittedAt: submittedLate,
            brazilGoals: 3,
            opponentGoals: 1,
            scorers: [],
            match: { brazilGoals: 3, opponentGoals: 1, scorers: [] },
          },
        ],
      },
      {
        id: 2,
        name: 'Early',
        paymentStatus: 'PAID',
        bets: [
          {
            submittedAt: submittedEarly,
            brazilGoals: 3,
            opponentGoals: 1,
            scorers: [],
            match: { brazilGoals: 3, opponentGoals: 1, scorers: [] },
          },
        ],
      },
      {
        id: 3,
        name: 'Winner',
        paymentStatus: 'PENDING',
        bets: [
          {
            submittedAt: submittedEarly,
            brazilGoals: 2,
            opponentGoals: 1,
            scorers: [],
            match: { brazilGoals: 3, opponentGoals: 1, scorers: [] },
          },
        ],
      },
    ]);

    expect(ranking.map((row) => row.name)).toEqual(['Early', 'Late', 'Winner']);
  });
});

describe('calculatePrizes', () => {
  it('splits all confirmed revenue into 70, 20 and 10 percent prizes', () => {
    expect(calculatePrizes(10, 1000)).toEqual({
      total: 10000,
      first: 7000,
      second: 2000,
      third: 1000,
    });
  });

  it('splits a dynamic revenue total into 70, 20 and 10 percent prizes', () => {
    expect(calculatePrizeDistribution(10500)).toEqual({
      total: 10500,
      first: 7350,
      second: 2100,
      third: 1050,
    });
  });
});

describe('calculatePoolFinancials', () => {
  it('adds manual entries to paid participant revenue', () => {
    const financials = calculatePoolFinancials({
      paidParticipants: 10,
      entryFeeCents: 1000,
      transactions: [{ kind: 'ADD', amountCents: 500 }],
    });

    expect(financials.totalRevenueCents).toBe(10500);
    expect(financials.manualAdditionsCents).toBe(500);
    expect(financials.prizes.total).toBe(10500);
  });

  it('subtracts manual removals from paid participant revenue', () => {
    const financials = calculatePoolFinancials({
      paidParticipants: 10,
      entryFeeCents: 1000,
      transactions: [{ kind: 'REMOVE', amountCents: 300 }],
    });

    expect(financials.totalRevenueCents).toBe(9700);
    expect(financials.manualRemovalsCents).toBe(300);
    expect(financials.prizes.total).toBe(9700);
  });

  it('blocks removals greater than the available pool total', () => {
    expect(canRemoveFromPool(10001, 10000)).toBe(false);
    expect(canRemoveFromPool(10000, 10000)).toBe(true);
  });
});
