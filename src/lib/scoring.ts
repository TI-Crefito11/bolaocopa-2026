export type ScoreInput = {
  actualBrazilGoals: number | null;
  actualOpponentGoals: number | null;
  betBrazilGoals: number;
  betOpponentGoals: number;
};

export type BetScore = {
  points: number;
  exactScoreHit: boolean;
  outcomeHit: boolean;
  brazilGoalsHit: boolean;
  opponentGoalsHit: boolean;
};

export type RankingBet = {
  submittedAt: Date;
  brazilGoals: number;
  opponentGoals: number;
  match: {
    brazilGoals: number | null;
    opponentGoals: number | null;
  };
};

export type RankingParticipant = {
  id: number;
  name: string;
  paymentStatus: string;
  bets: RankingBet[];
};

export type RankingRow = {
  participantId: number;
  name: string;
  paymentStatus: string;
  points: number;
  exactHits: number;
  outcomeHits: number;
  brazilGoalsHits: number;
  opponentGoalsHits: number;
  firstSubmittedAt: Date | null;
};

function outcome(goalsA: number, goalsB: number): 'A' | 'B' | 'D' {
  if (goalsA === goalsB) return 'D';
  return goalsA > goalsB ? 'A' : 'B';
}

export function scoreBet(input: ScoreInput): BetScore {
  const { actualBrazilGoals, actualOpponentGoals, betBrazilGoals, betOpponentGoals } = input;

  if (actualBrazilGoals === null || actualOpponentGoals === null) {
    return {
      points: 0,
      exactScoreHit: false,
      outcomeHit: false,
      brazilGoalsHit: false,
      opponentGoalsHit: false,
    };
  }

  const exactScoreHit =
    actualBrazilGoals === betBrazilGoals && actualOpponentGoals === betOpponentGoals;
  const outcomeHit =
    outcome(actualBrazilGoals, actualOpponentGoals) === outcome(betBrazilGoals, betOpponentGoals);
  const brazilGoalsHit = actualBrazilGoals === betBrazilGoals;
  const opponentGoalsHit = actualOpponentGoals === betOpponentGoals;

  // Precedence follows the provided examples: 3x0 vs 3x1 scores Brazil goals (3),
  // while 2x1 vs 3x1 scores winner (5).
  let points = 0;
  if (exactScoreHit) {
    points = 10;
  } else if (brazilGoalsHit) {
    points = 3;
  } else if (outcomeHit) {
    points = 5;
  } else if (opponentGoalsHit) {
    points = 3;
  }

  return { points, exactScoreHit, outcomeHit, brazilGoalsHit, opponentGoalsHit };
}

export function buildRanking(participants: RankingParticipant[]): RankingRow[] {
  return participants
    .map((participant) => {
      return participant.bets.reduce<RankingRow>(
        (row, bet) => {
          const score = scoreBet({
            actualBrazilGoals: bet.match.brazilGoals,
            actualOpponentGoals: bet.match.opponentGoals,
            betBrazilGoals: bet.brazilGoals,
            betOpponentGoals: bet.opponentGoals,
          });

          row.points += score.points;
          row.exactHits += score.exactScoreHit ? 1 : 0;
          row.outcomeHits += score.outcomeHit ? 1 : 0;
          row.brazilGoalsHits += score.brazilGoalsHit ? 1 : 0;
          row.opponentGoalsHits += score.opponentGoalsHit ? 1 : 0;
          row.firstSubmittedAt =
            row.firstSubmittedAt === null || bet.submittedAt < row.firstSubmittedAt
              ? bet.submittedAt
              : row.firstSubmittedAt;
          return row;
        },
        {
          participantId: participant.id,
          name: participant.name,
          paymentStatus: participant.paymentStatus,
          points: 0,
          exactHits: 0,
          outcomeHits: 0,
          brazilGoalsHits: 0,
          opponentGoalsHits: 0,
          firstSubmittedAt: null,
        },
      );
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
      if (b.outcomeHits !== a.outcomeHits) return b.outcomeHits - a.outcomeHits;
      if (a.firstSubmittedAt && b.firstSubmittedAt) {
        return a.firstSubmittedAt.getTime() - b.firstSubmittedAt.getTime();
      }
      if (a.firstSubmittedAt) return -1;
      if (b.firstSubmittedAt) return 1;
      return a.name.localeCompare(b.name, 'pt-BR');
    });
}

export function calculatePrizes(paidParticipants: number, entryFeeCents: number) {
  const total = paidParticipants * entryFeeCents;
  return {
    total,
    first: Math.floor(total * 0.7),
    second: Math.floor(total * 0.2),
    third: total - Math.floor(total * 0.7) - Math.floor(total * 0.2),
  };
}
