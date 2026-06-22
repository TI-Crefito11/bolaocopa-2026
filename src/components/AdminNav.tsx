import Link from 'next/link';
import { logoutAdmin } from '@/lib/admin-actions';

export function AdminNav() {
  return (
    <div className="admin-nav-wrap">
      <nav className="admin-nav" aria-label="Administracao">
        <Link href="/admin">Resumo</Link>
        <Link href="/admin/matches">Jogos</Link>
        <Link href="/admin/players">Jogadores</Link>
        <Link href="/admin/participants">Participantes</Link>
        <Link href="/admin/finance">Caixa</Link>
        <Link href="/admin/ranking">Ranking</Link>
        <Link href="/admin/users">Admins</Link>
      </nav>
      <form action={logoutAdmin}>
        <button type="submit" className="admin-logout-btn">Sair</button>
      </form>
    </div>
  );
}
