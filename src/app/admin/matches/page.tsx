import { AdminNav } from '@/components/AdminNav';
import { StatusBadge, formatStatus } from '@/components/StatusBadge';
import { deleteMatch, upsertMatch } from '@/lib/admin-actions';
import { formatDateTime } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type MatchesPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const matches = await prisma.match.findMany({ orderBy: { kickoffAt: 'asc' } });

  return (
    <div className="shell section">
      <AdminNav />
      <section className="section card">
        <h1>Jogos</h1>
        {params.error ? <p className="notice error">Revise os dados do jogo.</p> : null}
        <form className="stack" action={upsertMatch}>
          <div className="grid">
            <label>
              Adversario
              <input name="opponent" required />
            </label>
            <label>
              Inicio
              <input name="kickoffAt" type="datetime-local" required />
            </label>
            <label>
              Limite de aposta
              <input name="betDeadlineAt" type="datetime-local" required />
            </label>
          </div>
          <button className="button primary" type="submit">
            Cadastrar jogo
          </button>
        </form>
      </section>
      <section className="section card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Jogo</th>
                <th>Inicio</th>
                <th>Limite</th>
                <th>Status</th>
                <th>Resultado</th>
                <th>Editar</th>
                <th>Excluir</th>
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
                  <td>
                    <form className="match-edit-form" action={upsertMatch}>
                      <input name="id" type="hidden" value={match.id} />
                      <fieldset className="form-group">
                        <legend>Dados do jogo</legend>
                        <div className="form-row">
                          <label>
                            Adversario
                            <input name="opponent" defaultValue={match.opponent} required />
                          </label>
                          <label>
                            Inicio
                            <input name="kickoffAt" type="datetime-local" defaultValue={toDateTimeLocal(match.kickoffAt)} required />
                          </label>
                          <label>
                            Limite
                            <input name="betDeadlineAt" type="datetime-local" defaultValue={toDateTimeLocal(match.betDeadlineAt)} required />
                          </label>
                          <label>
                            Status
                            <select name="status" defaultValue={match.status}>
                              <option value="SCHEDULED">{formatStatus('SCHEDULED')}</option>
                              <option value="CLOSED">{formatStatus('CLOSED')}</option>
                              <option value="FINISHED">{formatStatus('FINISHED')}</option>
                            </select>
                          </label>
                        </div>
                      </fieldset>
                      <fieldset className="form-group">
                        <legend>Resultado</legend>
                        <div className="form-row">
                          <label>
                            Gols Brasil
                            <input name="brazilGoals" type="number" min={0} max={99} defaultValue={match.brazilGoals ?? ''} />
                          </label>
                          <label>
                            Gols adversario
                            <input name="opponentGoals" type="number" min={0} max={99} defaultValue={match.opponentGoals ?? ''} />
                          </label>
                        </div>
                      </fieldset>
                      <button className="button" type="submit">
                        Salvar
                      </button>
                    </form>
                  </td>
                  <td>
                    <form action={deleteMatch}>
                      <input name="id" type="hidden" value={match.id} />
                      <button className="button danger" type="submit">
                        Excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function toDateTimeLocal(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
