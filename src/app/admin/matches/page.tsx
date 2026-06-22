import { AdminNav } from '@/components/AdminNav';
import { MatchEditModal } from '@/components/MatchEditModal';
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
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="shell">
          <AdminNav />
        </div>
      </div>

      <div className="shell admin-body">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Jogos</h1>
            <p className="admin-subtitle">Cadastre partidas, registre resultados e gerencie status</p>
          </div>
          <span className="admin-count-badge">{matches.length} jogo{matches.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="card match-add-card">
          <h2 className="bet-section-label">Cadastrar novo jogo</h2>
          {params.error ? <p className="notice error">Revise os dados do jogo.</p> : null}
          <form className="match-add-form" action={upsertMatch}>
            <div className="grid">
              <label>
                Adversário
                <input name="opponent" required placeholder="Ex: Argentina" />
              </label>
              <label>
                Início
                <input name="kickoffAt" type="datetime-local" required />
              </label>
              <label>
                Limite de aposta
                <input name="betDeadlineAt" type="datetime-local" required />
              </label>
            </div>
            <div className="match-add-actions">
              <button className="button primary" type="submit">
                + Cadastrar jogo
              </button>
            </div>
          </form>
        </div>

        <div className="card ranking-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Início</th>
                  <th>Limite</th>
                  <th>Status</th>
                  <th>Resultado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id}>
                    <td><strong>🇧🇷 Brasil × {match.opponent}</strong></td>
                    <td className="ranking-date">{formatDateTime(match.kickoffAt)}</td>
                    <td className="ranking-date">{formatDateTime(match.betDeadlineAt)}</td>
                    <td><StatusBadge status={match.status} /></td>
                    <td>
                      {match.brazilGoals === null || match.opponentGoals === null ? (
                        <span className="participant-no-bets">–</span>
                      ) : (
                        <span className="participant-bet-item">
                          {match.brazilGoals} × {match.opponentGoals}
                        </span>
                      )}
                    </td>
                    <td className="match-actions-cell">
                      <MatchEditModal title={`Brasil x ${match.opponent}`}>
                        <form className="match-inline-form" action={upsertMatch}>
                          <input name="id" type="hidden" value={match.id} />
                          <fieldset className="form-group">
                            <legend>Dados do jogo</legend>
                            <div className="form-row">
                              <label>
                                Adversário
                                <input name="opponent" defaultValue={match.opponent} required />
                              </label>
                              <label>
                                Início
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
                                Gols adversário
                                <input name="opponentGoals" type="number" min={0} max={99} defaultValue={match.opponentGoals ?? ''} />
                              </label>
                            </div>
                          </fieldset>
                          <button className="button primary" type="submit">Salvar alterações</button>
                        </form>
                      </MatchEditModal>
                      <form action={deleteMatch}>
                        <input name="id" type="hidden" value={match.id} />
                        <button className="button danger" type="submit">Excluir</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="ranking-empty">Nenhum jogo cadastrado.</td>
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

function toDateTimeLocal(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
