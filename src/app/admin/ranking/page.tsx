import { AdminNav } from '@/components/AdminNav';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { getRankingData } from '@/lib/ranking-data';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function AdminRankingPage() {
  await requireAdminSession();
  const { ranking, prizes, paidParticipants } = await getRankingData();

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="shell">
          <AdminNav />
        </div>
      </div>

      <div className="shell admin-body">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Ranking administrativo</h1>
            <p className="admin-subtitle">Visão completa com gols, acertos e status de pagamento</p>
          </div>
          <span className="admin-count-badge">{paidParticipants} pago{paidParticipants !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid admin-metrics">
          <div className="metric admin-metric">
            <span>Participantes pagos</span>
            <strong>{paidParticipants}</strong>
          </div>
          <div className="metric admin-metric metric-accent">
            <span>Premio total</span>
            <strong>{formatCurrency(prizes.total)}</strong>
          </div>
          <div className="metric admin-metric">
            <span>🥇 1º lugar</span>
            <strong>{formatCurrency(prizes.first)}</strong>
          </div>
          <div className="metric admin-metric">
            <span>🥈 2º lugar</span>
            <strong>{formatCurrency(prizes.second)}</strong>
          </div>
          <div className="metric admin-metric">
            <span>🥉 3º lugar</span>
            <strong>{formatCurrency(prizes.third)}</strong>
          </div>
        </div>

        <div className="card ranking-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participante</th>
                  <th>Pontos</th>
                  <th>Exatos</th>
                  <th>Vencedor/empate</th>
                  <th>Gols Brasil</th>
                  <th>Gols adv.</th>
                  <th>Pagamento</th>
                  <th>1ª Aposta</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => (
                  <tr key={row.participantId} className={index < 3 ? 'ranking-row-top' : ''}>
                    <td>
                      <span className="ranking-pos">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                    </td>
                    <td><strong>{row.name}</strong></td>
                    <td><span className="ranking-pts">{row.points}</span></td>
                    <td>{row.exactHits}</td>
                    <td>{row.outcomeHits}</td>
                    <td>{row.brazilGoalsHits}</td>
                    <td>{row.opponentGoalsHits}</td>
                    <td><StatusBadge status={row.paymentStatus} /></td>
                    <td className="ranking-date">
                      {row.firstSubmittedAt ? formatDateTime(row.firstSubmittedAt) : '-'}
                    </td>
                  </tr>
                ))}
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="ranking-empty">Nenhuma aposta registrada ainda.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
