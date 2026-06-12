import Link from 'next/link';
import { logoutAdmin } from '@/lib/admin-actions';

export function AdminNav() {
  return (
    <nav className="nav" aria-label="Administracao">
      <Link href="/admin">Resumo</Link>
      <Link href="/admin/matches">Jogos</Link>
      <Link href="/admin/participants">Participantes</Link>
      <Link href="/admin/ranking">Ranking</Link>
      <Link href="/admin/users">Admins</Link>
      <form action={logoutAdmin}>
        <button type="submit">Sair</button>
      </form>
    </nav>
  );
}
