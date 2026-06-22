'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/password';
import { canRemoveFromPool, getPoolFinancials } from '@/lib/pool-financials';
import { prisma } from '@/lib/prisma';
import { clearAdminSession, requireAdminSession, setAdminSession } from '@/lib/session';

const goalsSchema = z.coerce.number().int().min(0).max(99);
const matchStatusSchema = z.enum(['SCHEDULED', 'CLOSED', 'FINISHED']);
const paymentStatusSchema = z.enum(['PENDING', 'PAID', 'CANCELED']);
const poolTransactionKindSchema = z.enum(['ADD', 'REMOVE']);

export async function loginAdmin(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin || !admin.active || !verifyPassword(password, admin.passwordHash)) {
    redirect('/admin/login?error=1');
  }

  await setAdminSession({ adminId: admin.id, email: admin.email });
  redirect('/admin');
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect('/admin/login');
}

export async function upsertMatch(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = Number(formData.get('id') || 0);
  const data = {
    opponent: String(formData.get('opponent') ?? '').trim(),
    kickoffAt: new Date(String(formData.get('kickoffAt'))),
    betDeadlineAt: new Date(String(formData.get('betDeadlineAt'))),
    status: matchStatusSchema.parse(formData.get('status') ?? 'SCHEDULED'),
    brazilGoals: nullableGoals(formData.get('brazilGoals')),
    opponentGoals: nullableGoals(formData.get('opponentGoals')),
  };

  if (!data.opponent || Number.isNaN(data.kickoffAt.getTime()) || Number.isNaN(data.betDeadlineAt.getTime())) {
    redirect('/admin/matches?error=invalid');
  }

  if (id > 0) {
    await prisma.match.update({ where: { id }, data });
  } else {
    await prisma.match.create({ data });
  }

  revalidatePath('/');
  revalidatePath('/ranking');
  revalidatePath('/admin/matches');
  redirect('/admin/matches');
}

export async function deleteMatch(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = Number(formData.get('id'));
  if (id) await prisma.match.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/ranking');
  revalidatePath('/admin/matches');
}

export async function updatePaymentStatus(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = Number(formData.get('id'));
  const paymentStatus = paymentStatusSchema.parse(formData.get('paymentStatus'));
  await prisma.participant.update({
    where: { id },
    data: {
      paymentStatus,
      paidAt: paymentStatus === 'PAID' ? new Date() : null,
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/participants');
  revalidatePath('/admin/finance');
  revalidatePath('/admin/ranking');
  revalidatePath('/ranking');
}

export async function deleteParticipant(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = Number(formData.get('id'));
  if (id) await prisma.participant.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/finance');
  revalidatePath('/admin/participants');
  revalidatePath('/admin/ranking');
  revalidatePath('/ranking');
}

export async function createPoolTransaction(formData: FormData): Promise<void> {
  const current = await requireAdminSession();
  const kind = poolTransactionKindSchema.parse(formData.get('kind') ?? 'ADD');
  const amountCents = parseCurrencyCents(formData.get('amount'));
  const description = String(formData.get('description') ?? '').trim();

  if (amountCents <= 0 || !description) {
    redirect('/admin/finance?error=invalid');
  }

  if (kind === 'REMOVE') {
    const financials = await getPoolFinancials();
    if (!canRemoveFromPool(amountCents, financials.totalRevenueCents)) {
      redirect('/admin/finance?error=insufficient');
    }
  }

  await prisma.$executeRaw`
    INSERT INTO PoolTransaction (kind, amountCents, description, createdById)
    VALUES (${kind}, ${amountCents}, ${description}, ${current.adminId})
  `;

  revalidatePath('/');
  revalidatePath('/ranking');
  revalidatePath('/admin');
  revalidatePath('/admin/finance');
  revalidatePath('/admin/ranking');
  redirect('/admin/finance');
}

export async function createAdminUser(formData: FormData): Promise<void> {
  await requireAdminSession();
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!name || !email || password.length < 8) redirect('/admin/users?error=invalid');

  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      active: true,
    },
  });
  revalidatePath('/admin/users');
  redirect('/admin/users');
}

export async function toggleAdminUser(formData: FormData): Promise<void> {
  const current = await requireAdminSession();
  const id = Number(formData.get('id'));
  if (id === current.adminId) return;

  const active = String(formData.get('active')) === 'true';
  await prisma.adminUser.update({ where: { id }, data: { active } });
  revalidatePath('/admin/users');
}

export async function deleteAdminUser(formData: FormData): Promise<void> {
  const current = await requireAdminSession();
  const id = Number(formData.get('id'));
  if (id && id !== current.adminId) await prisma.adminUser.delete({ where: { id } });
  revalidatePath('/admin/users');
}

function nullableGoals(value: FormDataEntryValue | null): number | null {
  if (value === null || String(value).trim() === '') return null;
  return goalsSchema.parse(value);
}

function parseCurrencyCents(value: FormDataEntryValue | null): number {
  const raw = String(value ?? '').trim();
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw;
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}
