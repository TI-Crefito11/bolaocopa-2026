import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import '@/app/globals.css';
import { poolConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: poolConfig.title,
  description: 'Bolao dos jogos do Brasil na Copa de 2026.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <div className="shell topbar-inner">
            <Link className="brand" href="/">
              <Image
                src="/LogoBolao.jpeg"
                alt="Logo Bolão"
                width={36}
                height={36}
                className="brand-logo"
                priority
              />
              <span>{poolConfig.title}</span>
            </Link>
            <nav className="nav" aria-label="Navegacao principal">
              <Link href="/bet">Apostar</Link>
              <Link href="/ranking">Ranking</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
