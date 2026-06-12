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

export async function submitBet(formData: FormData): Promise<void> {
  const participantData = betSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  const matches = await prisma.match.findMany({
    where: { status: { not: 'FINISHED' } },
    orderBy: { kickoffAt: 'asc' },
  });

  const now = new Date();
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

      return {
        matchId: match.id,
        brazilGoals: brazilGoals.data,
        opponentGoals: opponentGoals.data,
      };
    })
    .filter((bet): bet is { matchId: number; brazilGoals: number; opponentGoals: number } => bet !== null);

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
      await tx.bet.upsert({
        where: {
          participantId_matchId: {
            participantId: participant.id,
            matchId: bet.matchId,
          },
        },
        update: {
          brazilGoals: bet.brazilGoals,
          opponentGoals: bet.opponentGoals,
          submittedAt: new Date(),
        },
        create: {
          participantId: participant.id,
          ...bet,
        },
      });
    }
  });

  revalidatePath('/ranking');
  redirect('/bet?success=1');
}

function isBlank(value: FormDataEntryValue | null): boolean {
  return value === null || String(value).trim() === '';
}
