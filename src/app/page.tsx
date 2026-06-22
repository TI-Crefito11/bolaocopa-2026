import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { poolConfig } from '@/lib/config';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { getPoolFinancials } from '@/lib/pool-financials';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [matches, financials] = await Promise.all([
    prisma.match.findMany({ orderBy: { kickoffAt: 'asc' } }),
    getPoolFinancials(),
  ]);

  return (
    <div className="shell">
      <section className="hero">
        <div className="hero-panel">
          <Image
            src="/LogoBolao.jpeg"
            alt="Logo Bolão"
            width={88}
            height={88}
            className="hero-logo"
            priority
          />
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
            <strong>{formatCurrency(financials.totalRevenueCents)}</strong>
          </div>
        </div>
      </section>

      <section className="section grid">
        <div className="card">
          <h2>Premiacao</h2>
          <ul className="info-list">
            <li><span className="info-medal">🥇</span> 1º lugar — 70%</li>
            <li><span className="info-medal">🥈</span> 2º lugar — 20%</li>
            <li><span className="info-medal">🥉</span> 3º lugar — 10%</li>
          </ul>
        </div>
        <div className="card">
          <h2>Pontuacao</h2>
          <ul className="info-list">
            <li><span className="info-pts">10</span> Placar exato</li>
            <li><span className="info-pts">5</span> Vencedor ou empate</li>
            <li><span className="info-pts">3</span> Apenas gols do Brasil</li>
            <li><span className="info-pts">3</span> Apenas gols do adversario</li>
            <li><span className="info-pts">4</span> Por goleador do Brasil acertado</li>
          </ul>
          <p className="info-note">Ex: acertou Neymar e Vinicius Jr como goleadores: +8 pontos extras.</p>
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
