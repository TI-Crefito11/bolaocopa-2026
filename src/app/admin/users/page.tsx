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
    <div className="shell section">
      <AdminNav />
      <section className="section card">
        <h1>Admins</h1>
        {params.error ? <p className="notice error">Informe nome, email e senha com pelo menos 8 caracteres.</p> : null}
        <form className="stack" action={createAdminUser}>
          <div className="grid">
            <label>
              Nome
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Senha
              <input name="password" type="password" minLength={8} required />
            </label>
          </div>
          <button className="button primary" type="submit">
            Criar admin
          </button>
        </form>
      </section>
      <section className="section card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.active ? 'Ativo' : 'Inativo'}</td>
                  <td>
                    {user.id === session.adminId ? (
                      'Usuario atual'
                    ) : (
                      <div className="inline-form">
                        <form action={toggleAdminUser}>
                          <input name="id" type="hidden" value={user.id} />
                          <input name="active" type="hidden" value={String(!user.active)} />
                          <button className="button" type="submit">
                            {user.active ? 'Desativar' : 'Ativar'}
                          </button>
                        </form>
                        <form action={deleteAdminUser}>
                          <input name="id" type="hidden" value={user.id} />
                          <button className="button danger" type="submit">
                            Excluir
                          </button>
                        </form>
                      </div>
                    )}
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
