import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';
import { poolConfig } from '@/lib/config';
import { formatCurrency } from '@/lib/money';
import { getPoolFinancials } from '@/lib/pool-financials';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  await requireAdminSession();
  const [matchCount, participantCount, playerCount, financials] = await Promise.all([
    prisma.match.count(),
    prisma.participant.count(),
    prisma.player.count({ where: { active: true } }),
    getPoolFinancials(),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="shell">
          <AdminNav />
        </div>
      </div>

      <div className="shell admin-body">
        <div className="admin-welcome">
          <div>
            <h1 className="admin-title">{poolConfig.title}</h1>
            <p className="admin-subtitle">Painel de administração · Copa 2026</p>
          </div>
          <span className="admin-badge">Admin</span>
        </div>

        <div className="grid admin-metrics">
          <div className="metric admin-metric">
            <span>Jogos</span>
            <strong>{matchCount}</strong>
          </div>
          <div className="metric admin-metric">
            <span>Participantes</span>
            <strong>{participantCount}</strong>
          </div>
          <div className="metric admin-metric">
            <span>Jogadores ativos</span>
            <strong>{playerCount}</strong>
          </div>
          <div className="metric admin-metric">
            <span>Pagos</span>
            <strong>{financials.paidParticipants}</strong>
          </div>
          <div className="metric admin-metric metric-accent">
            <span>Premio total</span>
            <strong>{formatCurrency(financials.prizes.total)}</strong>
          </div>
        </div>

        <div className="admin-actions">
          <Link className="admin-action-card" href="/admin/matches">
            <span className="admin-action-icon">⚽</span>
            <div className="admin-action-body">
              <strong>Gerenciar jogos</strong>
              <p>Cadastre partidas e registre os resultados</p>
            </div>
            <span className="admin-action-arrow">→</span>
          </Link>
          <Link className="admin-action-card" href="/admin/participants">
            <span className="admin-action-icon">💳</span>
            <div className="admin-action-body">
              <strong>Validar pagamentos</strong>
              <p>Confirme os pagamentos PIX dos participantes</p>
            </div>
            <span className="admin-action-arrow">→</span>
          </Link>
          <Link className="admin-action-card" href="/admin/players">
            <span className="admin-action-icon">⚽</span>
            <div className="admin-action-body">
              <strong>Gerenciar jogadores</strong>
              <p>Cadastre os goleadores selecionáveis nos palpites</p>
            </div>
            <span className="admin-action-arrow">→</span>
          </Link>
          <Link className="admin-action-card" href="/admin/finance">
            <span className="admin-action-icon">R$</span>
            <div className="admin-action-body">
              <strong>Controlar caixa</strong>
              <p>Registre entradas e retiradas manuais do bolão</p>
            </div>
            <span className="admin-action-arrow">→</span>
          </Link>
          <Link className="admin-action-card" href="/admin/ranking">
            <span className="admin-action-icon">🏆</span>
            <div className="admin-action-body">
              <strong>Ver ranking</strong>
              <p>Classificação completa com pontos e status</p>
            </div>
            <span className="admin-action-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
