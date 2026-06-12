export const poolConfig = {
  title: process.env.POOL_TITLE ?? 'Bolao Rumo ao Hexa',
  entryFeeCents: Number(process.env.ENTRY_FEE_CENTS ?? 1000),
  pixKey: process.env.PIX_KEY ?? '61993043994',
  timezone: process.env.APP_TIMEZONE ?? 'America/Sao_Paulo',
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
