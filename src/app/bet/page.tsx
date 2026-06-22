import Image from 'next/image';
import { BetBrazilScorerFields } from '@/components/ScorerSelectors';
import { submitBet } from '@/lib/public-actions';
import { formatDateTime } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { PhoneInput } from '@/components/PhoneInput';

export const dynamic = 'force-dynamic';

type BetPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function BetPage({ searchParams }: BetPageProps) {
  const params = await searchParams;
  const matches = await prisma.match.findMany({
    where: { status: { not: 'FINISHED' } },
    orderBy: { kickoffAt: 'asc' },
  });
  const players = await prisma.player.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  const now = new Date();

  return (
    <div className="bet-page">
      <div className="bet-hero">
        <div className="shell hero-inner">
          <div>
            <p className="eyebrow">Copa 2026</p>
            <h1>Fazer aposta</h1>
            <p>Preencha seus dados e palpite nos placares dos jogos do Brasil.</p>
          </div>
          <Image src="/LogoBolao.jpeg" alt="Logo Bolão" width={72} height={72} className="subpage-hero-logo" />
        </div>
      </div>

      <div className="shell bet-body">
        {params.success ? (
          <p className="notice">Aposta registrada. O pagamento ficara pendente ate validacao do admin.</p>
        ) : null}
        {params.error ? (
          <p className="notice error">{getBetErrorMessage(params.error)}</p>
        ) : null}

        <form className="stack" action={submitBet}>
          <div className="bet-section-card">
            <h2 className="bet-section-label">Seus dados</h2>
            <div className="grid">
              <label>
                Nome
                <input name="name" minLength={2} required placeholder="Seu nome completo" />
              </label>
              <label>
                Email
                <input name="email" type="email" required placeholder="seu@email.com" />
              </label>
              <label>
                Telefone
                <PhoneInput />
              </label>
            </div>
          </div>

          <div className="bet-section-card">
            <h2 className="bet-section-label">Palpites</h2>
            <div className="stack">
              {matches.map((match) => {
                const closed = match.betDeadlineAt <= now;
                return (
                  <div className={`bet-match${closed ? ' bet-match--closed' : ''}`} key={match.id}>
                    <div className="bet-match-header">
                      <div>
                        <strong className="bet-match-title">🇧🇷 Brasil × {match.opponent}</strong>
                        <span className="bet-match-deadline">Limite: {formatDateTime(match.betDeadlineAt)}</span>
                      </div>
                      {closed ? <span className="status-badge status-badge-yellow">Encerrado</span> : null}
                    </div>
                    <div className="bet-score-row">
                      <BetBrazilScorerFields disabled={closed} matchId={match.id} players={players} />
                      <span className="score-sep">×</span>
                      <label className="score-col">
                        <span className="score-team">{match.opponent}</span>
                        <input
                          className="score-input"
                          name={`match-${match.id}-opponent`}
                          type="number"
                          min={0}
                          max={99}
                          disabled={closed}
                          placeholder="0"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
              {matches.length === 0 ? (
                <p className="bet-empty">Nenhum jogo disponivel para apostas no momento.</p>
              ) : null}
            </div>
          </div>

          <div className="bet-submit-row">
            <button className="button primary bet-submit-btn" type="submit">
              Enviar aposta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getBetErrorMessage(error: string): string {
  if (error === 'incomplete-bet') return 'Preencha os dois placares do jogo escolhido ou deixe o jogo em branco.';
  if (error === 'incomplete-scorers') return 'Selecione um goleador do Brasil para cada gol informado.';
  if (error === 'invalid-scorers') return 'Revise os goleadores selecionados.';
  if (error === 'invalid') return 'Revise os placares informados.';
  return 'Selecione pelo menos um jogo aberto para enviar a aposta.';
}
