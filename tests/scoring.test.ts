import { describe, expect, it } from 'vitest';
import { buildRanking, calculatePrizes, scoreBet } from '@/lib/scoring';

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
      }).points,
    ).toBe(0);
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
            match: { brazilGoals: 3, opponentGoals: 1 },
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
            match: { brazilGoals: 3, opponentGoals: 1 },
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
            match: { brazilGoals: 3, opponentGoals: 1 },
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
});
