import { loginAdmin } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="shell section">
      <div className="card login-card">
        <h1>Admin</h1>
        {params.error ? <p className="notice error">Email ou senha invalidos.</p> : null}
        <form className="stack" action={loginAdmin}>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Senha
            <input name="password" type="password" required />
          </label>
          <button className="button primary" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
