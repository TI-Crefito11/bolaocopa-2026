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
    <div className="shell section">
      <AdminNav />
      <section className="section card">
        <h1>Ranking administrativo</h1>
        <p>
          Pagos: {paidParticipants}. Premio total: {formatCurrency(prizes.total)}. 1o{' '}
          {formatCurrency(prizes.first)}, 2o {formatCurrency(prizes.second)}, 3o{' '}
          {formatCurrency(prizes.third)}.
        </p>
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
                <th>Gols adversario</th>
                <th>Pagamento</th>
                <th>Primeira aposta</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row, index) => (
                <tr key={row.participantId}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.points}</td>
                  <td>{row.exactHits}</td>
                  <td>{row.outcomeHits}</td>
                  <td>{row.brazilGoalsHits}</td>
                  <td>{row.opponentGoalsHits}</td>
                  <td>
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                  <td>{row.firstSubmittedAt ? formatDateTime(row.firstSubmittedAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
