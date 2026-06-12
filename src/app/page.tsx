import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { poolConfig } from '@/lib/config';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [matches, paidParticipants] = await Promise.all([
    prisma.match.findMany({ orderBy: { kickoffAt: 'asc' } }),
    prisma.participant.count({ where: { paymentStatus: 'PAID' } }),
  ]);

  const totalCents = paidParticipants * poolConfig.entryFeeCents;

  return (
    <div className="shell">
      <section className="hero">
        <div className="hero-panel">
          <span className="eyebrow">Copa 2026 - jogos do Brasil</span>
          <h1>Rumo ao Hexa</h1>
          <p>
            Palpite nos placares do Brasil, pague via PIX e acompanhe a disputa no ranking.
            Toda a arrecadacao vira premiacao.
          </p>
        </div>
        <div className="summary">
          <div className="metric">
            <span>Valor</span>
            <strong>{formatCurrency(poolConfig.entryFeeCents)}</strong>
          </div>
          <div className="metric">
            <span>PIX</span>
            <strong>{poolConfig.pixKey}</strong>
          </div>
          <div className="metric">
            <span>Arrecadado confirmado</span>
            <strong>{formatCurrency(totalCents)}</strong>
          </div>
        </div>
      </section>

      <section className="section grid">
        <div className="card">
          <h2>Premiacao</h2>
          <p>1o lugar: 70%</p>
          <p>2o lugar: 20%</p>
          <p>3o lugar: 10%</p>
        </div>
        <div className="card">
          <h2>Pontuacao</h2>
          <p>Placar exato: 10 pontos</p>
          <p>Vencedor ou empate: 5 pontos</p>
          <p>Apenas gols do Brasil: 3 pontos</p>
          <p>Apenas gols do adversario: 3 pontos</p>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <h2>Jogos do Brasil</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Inicio</th>
                  <th>Limite de aposta</th>
                  <th>Status</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id}>
                    <td>Brasil x {match.opponent}</td>
                    <td>{formatDateTime(match.kickoffAt)}</td>
                    <td>{formatDateTime(match.betDeadlineAt)}</td>
                    <td>
                      <StatusBadge status={match.status} />
                    </td>
                    <td>
                      {match.brazilGoals === null || match.opponentGoals === null
                        ? '-'
                        : `${match.brazilGoals} x ${match.opponentGoals}`}
                    </td>
                  </tr>
                ))}
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Nenhum jogo cadastrado ainda.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section nav">
        <Link className="button primary" href="/bet">
          Fazer aposta
        </Link>
        <Link className="button" href="/ranking">
          Ver ranking
        </Link>
      </section>
    </div>
  );
}
