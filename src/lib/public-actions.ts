'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const betSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(8),
});

const goalsSchema = z.coerce.number().int().min(0).max(99);
const playerIdSchema = z.coerce.number().int().positive();

export async function submitBet(formData: FormData): Promise<void> {
  const participantData = betSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  const [matches, activePlayers] = await Promise.all([
    prisma.match.findMany({
      where: { status: { not: 'FINISHED' } },
      orderBy: { kickoffAt: 'asc' },
    }),
    prisma.player.findMany({
      where: { active: true },
      select: { id: true },
    }),
  ]);

  const now = new Date();
  const activePlayerIds = new Set(activePlayers.map((player) => player.id));
  const bets = matches
    .map((match) => {
      const brazilGoalsValue = formData.get(`match-${match.id}-brazil`);
      const opponentGoalsValue = formData.get(`match-${match.id}-opponent`);
      const brazilBlank = isBlank(brazilGoalsValue);
      const opponentBlank = isBlank(opponentGoalsValue);
      if (brazilBlank && opponentBlank) return null;
      if (brazilBlank || opponentBlank) redirect('/bet?error=incomplete-bet');
      if (match.betDeadlineAt <= now) return null;

      const brazilGoals = goalsSchema.safeParse(brazilGoalsValue);
      const opponentGoals = goalsSchema.safeParse(opponentGoalsValue);
      if (!brazilGoals.success || !opponentGoals.success) redirect('/bet?error=invalid');
      const scorerIds = parseScorerIds(formData, `match-${match.id}-scorer`, brazilGoals.data);
      if (scorerIds.some((playerId) => !activePlayerIds.has(playerId))) redirect('/bet?error=invalid-scorers');

      return {
        matchId: match.id,
        brazilGoals: brazilGoals.data,
        opponentGoals: opponentGoals.data,
        scorerIds,
      };
    })
    .filter(
      (bet): bet is { matchId: number; brazilGoals: number; opponentGoals: number; scorerIds: number[] } =>
        bet !== null,
    );

  if (bets.length === 0) redirect('/bet?error=no-open-matches');

  await prisma.$transaction(async (tx) => {
    const participant = await tx.participant.upsert({
      where: {
        email_phone: {
          email: participantData.email,
          phone: participantData.phone,
        },
      },
      update: {
        name: participantData.name,
      },
      create: participantData,
    });

    for (const bet of bets) {
      const { scorerIds, ...betData } = bet;
      const savedBet = await tx.bet.upsert({
        where: {
          participantId_matchId: {
            participantId: participant.id,
            matchId: betData.matchId,
          },
        },
        update: {
          brazilGoals: betData.brazilGoals,
          opponentGoals: betData.opponentGoals,
          submittedAt: new Date(),
        },
        create: {
          participantId: participant.id,
          ...betData,
        },
      });
      await tx.betScorer.deleteMany({ where: { betId: savedBet.id } });
      if (scorerIds.length > 0) {
        await tx.betScorer.createMany({
          data: scorerIds.map((playerId, position) => ({
            betId: savedBet.id,
            playerId,
            position,
          })),
        });
      }
    }
  });

  revalidatePath('/ranking');
  redirect('/bet?success=1');
}

function isBlank(value: FormDataEntryValue | null): boolean {
  return value === null || String(value).trim() === '';
}

function parseScorerIds(formData: FormData, fieldPrefix: string, totalGoals: number): number[] {
  const scorerIds: number[] = [];
  for (let position = 0; position < totalGoals; position++) {
    const parsed = playerIdSchema.safeParse(formData.get(`${fieldPrefix}-${position}`));
    if (!parsed.success) redirect('/bet?error=incomplete-scorers');
    scorerIds.push(parsed.data);
  }
  return scorerIds;
}
