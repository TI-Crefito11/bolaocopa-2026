import { AdminNav } from '@/components/AdminNav';
import { createAdminUser, deleteAdminUser, toggleAdminUser } from '@/lib/admin-actions';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type UsersPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requireAdminSession();
  const params = await searchParams;
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });

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
            <h1 className="admin-title">Administradores</h1>
            <p className="admin-subtitle">Gerencie quem tem acesso ao painel</p>
          </div>
          <span className="admin-count-badge">{users.length} admin{users.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="card match-add-card">
          <h2 className="bet-section-label">Criar novo admin</h2>
          {params.error ? (
            <p className="notice error">Informe nome, email e senha com pelo menos 8 caracteres.</p>
          ) : null}
          <form className="match-add-form" action={createAdminUser}>
            <div className="grid">
              <label>
                Nome
                <input name="name" required placeholder="Nome completo" />
              </label>
              <label>
                Email
                <input name="email" type="email" required placeholder="email@exemplo.com" />
              </label>
              <label>
                Senha
                <input name="password" type="password" minLength={8} required placeholder="Mínimo 8 caracteres" />
              </label>
            </div>
            <div className="match-add-actions">
              <button className="button primary" type="submit">+ Criar admin</button>
            </div>
          </form>
        </div>

        <div className="card ranking-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-name">
                        <span className="admin-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td className="participant-email">{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.active ? 'status-badge-green' : 'status-badge-yellow'}`}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      {user.id === session.adminId ? (
                        <span className="admin-current-user">● Você</span>
                      ) : (
                        <div className="admin-user-actions">
                          <form action={toggleAdminUser}>
                            <input name="id" type="hidden" value={user.id} />
                            <input name="active" type="hidden" value={String(!user.active)} />
                            <button className="button" type="submit">
                              {user.active ? 'Desativar' : 'Ativar'}
                            </button>
                          </form>
                          <form action={deleteAdminUser}>
                            <input name="id" type="hidden" value={user.id} />
                            <button className="button danger" type="submit">Excluir</button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="ranking-empty">Nenhum admin cadastrado.</td>
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
