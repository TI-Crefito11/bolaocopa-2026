import { AdminNav } from '@/components/AdminNav';
import { createPlayer, togglePlayer } from '@/lib/admin-actions';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type PlayersPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const players = await prisma.player.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }] });

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
            <h1 className="admin-title">Jogadores</h1>
            <p className="admin-subtitle">Cadastre quem pode ser escolhido como goleador do Brasil</p>
          </div>
          <span className="admin-count-badge">{players.length} jogador{players.length !== 1 ? 'es' : ''}</span>
        </div>

        <div className="card match-add-card">
          <h2 className="bet-section-label">Cadastrar jogador</h2>
          {params.error ? <p className="notice error">Informe um nome valido e ainda nao cadastrado.</p> : null}
          <form className="match-add-form" action={createPlayer}>
            <div className="grid">
              <label>
                Nome
                <input name="name" minLength={2} required placeholder="Ex: Vinicius Jr" />
              </label>
            </div>
            <div className="match-add-actions">
              <button className="button primary" type="submit">
                + Cadastrar jogador
              </button>
            </div>
          </form>
        </div>

        <div className="card ranking-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td><strong>{player.name}</strong></td>
                    <td>
                      <span className={`status-badge ${player.active ? 'status-badge-green' : 'status-badge-blue'}`}>
                        {player.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <form action={togglePlayer}>
                        <input name="id" type="hidden" value={player.id} />
                        <input name="active" type="hidden" value={String(!player.active)} />
                        <button className="button" type="submit">
                          {player.active ? 'Inativar' : 'Ativar'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="ranking-empty">Nenhum jogador cadastrado.</td>
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
