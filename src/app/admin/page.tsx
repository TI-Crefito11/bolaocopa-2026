import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';
import { poolConfig } from '@/lib/config';
import { formatCurrency } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { getRankingData } from '@/lib/ranking-data';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  await requireAdminSession();
  const [matchCount, participantCount, { prizes, paidParticipants }] = await Promise.all([
    prisma.match.count(),
    prisma.participant.count(),
    getRankingData(),
  ]);

  return (
    <div className="shell section">
      <AdminNav />
      <section className="section grid">
        <div className="metric">
          <span>Jogos</span>
          <strong>{matchCount}</strong>
        </div>
        <div className="metric">
          <span>Participantes</span>
          <strong>{participantCount}</strong>
        </div>
        <div className="metric">
          <span>Pagos</span>
          <strong>{paidParticipants}</strong>
        </div>
        <div className="metric">
          <span>Premio total</span>
          <strong>{formatCurrency(prizes.total)}</strong>
        </div>
      </section>
      <section className="section card">
        <h1>{poolConfig.title}</h1>
        <p>Use a administracao para cadastrar jogos, fechar resultados e validar pagamentos PIX.</p>
        <div className="nav">
          <Link className="button primary" href="/admin/matches">
            Gerenciar jogos
          </Link>
          <Link className="button" href="/admin/participants">
            Validar pagamentos
          </Link>
        </div>
      </section>
    </div>
  );
}
