import Image from 'next/image';
import { StatusBadge } from '@/components/StatusBadge';
import { poolConfig } from '@/lib/config';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { getRankingData } from '@/lib/ranking-data';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
  const { ranking, prizes, paidParticipants } = await getRankingData();

  return (
    <div className="ranking-page">
      <div className="ranking-hero">
        <div className="shell hero-inner">
          <div>
            <p className="eyebrow">Copa 2026</p>
            <h1>Ranking</h1>
            <p>Classificação dos participantes com base nos palpites enviados.</p>
          </div>
          <Image src="/LogoBolao.jpeg" alt="Logo Bolão" width={72} height={72} className="subpage-hero-logo" />
        </div>
      </div>

      <div className="shell ranking-body">
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

        <div className="ranking-prizes">
          <div className="prize-card prize-gold">
            <span className="prize-medal">🥇</span>
            <span className="prize-label">1º lugar</span>
            <strong className="prize-value">{formatCurrency(prizes.first)}</strong>
          </div>
          <div className="prize-card prize-silver">
            <span className="prize-medal">🥈</span>
            <span className="prize-label">2º lugar</span>
            <strong className="prize-value">{formatCurrency(prizes.second)}</strong>
          </div>
          <div className="prize-card prize-bronze">
            <span className="prize-medal">🥉</span>
            <span className="prize-label">3º lugar</span>
            <strong className="prize-value">{formatCurrency(prizes.third)}</strong>
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
                    <td><StatusBadge status={row.paymentStatus} /></td>
                    <td className="ranking-date">
                      {row.firstSubmittedAt ? formatDateTime(row.firstSubmittedAt) : '-'}
                    </td>
                  </tr>
                ))}
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="ranking-empty">
                      Nenhuma aposta registrada ainda.
                    </td>
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
