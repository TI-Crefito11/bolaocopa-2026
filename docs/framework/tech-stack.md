# Tech Stack

- Runtime: Node.js 20+ recomendado.
- App: Next.js 16+ App Router com React 19 e TypeScript strict.
- Banco: MySQL via Prisma ORM.
- Estilo: Tailwind CSS.
- Testes: Vitest para regras de dominio.
- Auth admin: contas no MySQL, senha com `scrypt`, sessao assinada em cookie HTTP-only.

## Environment

- `DATABASE_URL`: conexao MySQL.
- `SESSION_SECRET`: segredo longo para assinar sessoes.
- `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`: admin inicial.
- `POOL_TITLE`, `ENTRY_FEE_CENTS`, `PIX_KEY`, `APP_TIMEZONE`: configuracao do bolao.
