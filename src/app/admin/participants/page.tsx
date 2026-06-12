import { AdminNav } from '@/components/AdminNav';
import { StatusBadge, formatStatus } from '@/components/StatusBadge';
import { deleteParticipant, updatePaymentStatus } from '@/lib/admin-actions';
import { formatDateTime } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ParticipantsPage() {
  await requireAdminSession();
  const participants = await prisma.participant.findMany({
    include: {
      bets: {
        include: {
          match: true,
        },
        orderBy: {
          submittedAt: 'asc',
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

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
            <h1 className="admin-title">Participantes</h1>
            <p className="admin-subtitle">Gerencie pagamentos e acompanhe as apostas</p>
          </div>
          <span className="admin-count-badge">{participants.length} participante{participants.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="card ranking-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Pagamento</th>
                  <th>Apostas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>
                      <strong className="participant-name">{participant.name}</strong>
                    </td>
                    <td>
                      <div className="participant-contact">
                        <span className="participant-email">{participant.email}</span>
                        <span className="participant-phone">{participant.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-cell">
                        <StatusBadge status={participant.paymentStatus} />
                        <form className="payment-form" action={updatePaymentStatus}>
                          <input name="id" type="hidden" value={participant.id} />
                          <select name="paymentStatus" defaultValue={participant.paymentStatus}>
                            <option value="PENDING">{formatStatus('PENDING')}</option>
                            <option value="PAID">{formatStatus('PAID')}</option>
                            <option value="CANCELED">{formatStatus('CANCELED')}</option>
                          </select>
                          <button className="button payment-update-btn" type="submit">
                            Salvar
                          </button>
                        </form>
                        {participant.paidAt ? (
                          <span className="payment-date">Pago em {formatDateTime(participant.paidAt)}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="participant-bets">
                        {participant.bets.map((bet) => (
                          <span key={bet.id} className="participant-bet-item">
                            🇧🇷 {bet.brazilGoals} × {bet.opponentGoals} {bet.match.opponent}
                          </span>
                        ))}
                        {participant.bets.length === 0 ? (
                          <span className="participant-no-bets">Sem apostas</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <form action={deleteParticipant}>
                        <input name="id" type="hidden" value={participant.id} />
                        <button className="button danger" type="submit">
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="ranking-empty">Nenhum participante cadastrado.</td>
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
