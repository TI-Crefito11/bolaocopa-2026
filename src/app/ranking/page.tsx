import { StatusBadge } from '@/components/StatusBadge';
import { poolConfig } from '@/lib/config';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { getRankingData } from '@/lib/ranking-data';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
  const { ranking, prizes, paidParticipants } = await getRankingData();

  return (
    <div className="shell section">
      <div className="grid">
        <div className="metric">
          <span>Participantes pagos</span>
          <strong>{paidParticipants}</strong>
        </div>
        <div className="metric">
          <span>Premio total</span>
          <strong>{formatCurrency(prizes.total)}</strong>
        </div>
        <div className="metric">
          <span>Entrada</span>
          <strong>{formatCurrency(poolConfig.entryFeeCents)}</strong>
        </div>
      </div>

      <section className="section card">
        <h1>Ranking</h1>
        <p className="ranking-description">
          Premios: 1o {formatCurrency(prizes.first)}, 2o {formatCurrency(prizes.second)}, 3o{' '}
          {formatCurrency(prizes.third)}.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Posicao</th>
                <th>Participante</th>
                <th>Pontos</th>
                <th>Exatos</th>
                <th>Vencedor/empate</th>
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
                  <td>
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                  <td>{row.firstSubmittedAt ? formatDateTime(row.firstSubmittedAt) : '-'}</td>
                </tr>
              ))}
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan={7}>Nenhuma aposta registrada ainda.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
