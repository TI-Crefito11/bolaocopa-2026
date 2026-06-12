import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireEnv } from '@/lib/config';

const COOKIE_NAME = 'bolao_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  adminId: number;
  email: string;
  expiresAt: number;
};

function encode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString();
}

function sign(payload: string): string {
  return createHmac('sha256', requireEnv('SESSION_SECRET')).update(payload).digest('base64url');
}

export function createSessionToken(payload: Omit<SessionPayload, 'expiresAt'>): string {
  const body = encode(
    JSON.stringify({
      ...payload,
      expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
    }),
  );
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  const payload = JSON.parse(decode(body)) as SessionPayload;
  if (payload.expiresAt < Date.now()) return null;
  return payload;
}

export async function setAdminSession(payload: Omit<SessionPayload, 'expiresAt'>): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
