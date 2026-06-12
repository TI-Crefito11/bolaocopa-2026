import { submitBet } from '@/lib/public-actions';
import { formatDateTime } from '@/lib/money';
import { prisma } from '@/lib/prisma';

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
  const now = new Date();

  return (
    <div className="shell section">
      <div className="card">
        <h1>Fazer aposta</h1>
        {params.success ? <p className="notice">Aposta registrada. O pagamento ficara pendente ate validacao do admin.</p> : null}
        {params.error ? <p className="notice error">{getBetErrorMessage(params.error)}</p> : null}
        <form className="stack" action={submitBet}>
          <div className="grid">
            <label>
              Nome
              <input name="name" minLength={2} required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Telefone
              <input name="phone" minLength={8} required />
            </label>
          </div>

          <h2>Palpites</h2>
          {matches.map((match) => {
            const closed = match.betDeadlineAt <= now;
            return (
              <div className="bet-match" key={match.id}>
                <div className="score-inputs">
                  <div>
                    <strong>Brasil x {match.opponent}</strong>
                    <p>Limite: {formatDateTime(match.betDeadlineAt)}</p>
                    {closed ? <p className="notice error">Apostas encerradas para este jogo.</p> : null}
                  </div>
                  <label>
                    Brasil
                    <input name={`match-${match.id}-brazil`} type="number" min={0} max={99} disabled={closed} />
                  </label>
                  <label>
                    {match.opponent}
                    <input name={`match-${match.id}-opponent`} type="number" min={0} max={99} disabled={closed} />
                  </label>
                </div>
              </div>
            );
          })}
          {matches.length === 0 ? <p>Nenhum jogo disponivel.</p> : null}
          <button className="button primary" type="submit">
            Enviar aposta
          </button>
        </form>
      </div>
    </div>
  );
}

function getBetErrorMessage(error: string): string {
  if (error === 'incomplete-bet') return 'Preencha os dois placares do jogo escolhido ou deixe o jogo em branco.';
  if (error === 'invalid') return 'Revise os placares informados.';
  return 'Selecione pelo menos um jogo aberto para enviar a aposta.';
}
