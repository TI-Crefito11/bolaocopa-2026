import { AdminNav } from '@/components/AdminNav';
import { createPoolTransaction } from '@/lib/admin-actions';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { getPoolFinancials } from '@/lib/pool-financials';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type FinancePageProps = {
  searchParams: Promise<{ error?: string }>;
};

type FinanceTransactionRow = {
  id: number;
  kind: 'ADD' | 'REMOVE';
  amountCents: number;
  description: string;
  createdAt: Date;
  createdByEmail: string;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const [financials, transactions] = await Promise.all([
    getPoolFinancials(),
    prisma.$queryRaw<FinanceTransactionRow[]>`
      SELECT
        PoolTransaction.id,
        PoolTransaction.kind,
        PoolTransaction.amountCents,
        PoolTransaction.description,
        PoolTransaction.createdAt,
        AdminUser.email AS createdByEmail
      FROM PoolTransaction
      INNER JOIN AdminUser ON AdminUser.id = PoolTransaction.createdById
      ORDER BY PoolTransaction.createdAt DESC
    `,
  ]);

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
            <h1 className="admin-title">Caixa</h1>
            <p className="admin-subtitle">Controle entradas e retiradas manuais do bolão</p>
          </div>
          <span className="admin-count-badge">{transactions.length} lançamento{transactions.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid admin-metrics">
          <div className="metric admin-metric">
            <span>Base de pagamentos</span>
            <strong>{formatCurrency(financials.baseRevenueCents)}</strong>
          </div>
          <div className="metric admin-metric">
            <span>Entradas manuais</span>
            <strong>{formatCurrency(financials.manualAdditionsCents)}</strong>
          </div>
          <div className="metric admin-metric">
            <span>Retiradas manuais</span>
            <strong>{formatCurrency(financials.manualRemovalsCents)}</strong>
          </div>
          <div className="metric admin-metric metric-accent">
            <span>Premio total</span>
            <strong>{formatCurrency(financials.totalRevenueCents)}</strong>
          </div>
        </div>

        <div className="card match-add-card">
          <h2 className="bet-section-label">Novo lançamento</h2>
          {params.error === 'invalid' ? (
            <p className="notice error">Informe tipo, valor positivo e descrição.</p>
          ) : null}
          {params.error === 'insufficient' ? (
            <p className="notice error">A retirada não pode deixar o caixa negativo.</p>
          ) : null}
          <form className="match-add-form" action={createPoolTransaction}>
            <div className="grid">
              <label>
                Tipo
                <select name="kind" defaultValue="ADD">
                  <option value="ADD">Adicionar ao caixa</option>
                  <option value="REMOVE">Retirar do caixa</option>
                </select>
              </label>
              <label>
                Valor
                <input name="amount" inputMode="decimal" required placeholder="5,00" />
              </label>
              <label>
                Descrição
                <input name="description" required placeholder="Ex: adicional por colaborador" />
              </label>
            </div>
            <div className="match-add-actions">
              <button className="button primary" type="submit">Registrar lançamento</button>
            </div>
          </form>
        </div>

        <div className="card ranking-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="ranking-date">{formatDateTime(transaction.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${transaction.kind === 'ADD' ? 'status-badge-green' : 'status-badge-yellow'}`}>
                        {transaction.kind === 'ADD' ? 'Entrada' : 'Retirada'}
                      </span>
                    </td>
                    <td><strong>{transaction.description}</strong></td>
                    <td className={transaction.kind === 'ADD' ? 'finance-positive' : 'finance-negative'}>
                      {transaction.kind === 'ADD' ? '+' : '-'} {formatCurrency(transaction.amountCents)}
                    </td>
                    <td className="participant-email">{transaction.createdByEmail}</td>
                  </tr>
                ))}
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="ranking-empty">Nenhum lançamento registrado.</td>
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
