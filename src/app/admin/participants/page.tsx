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
    <div className="shell section">
      <AdminNav />
      <section className="section card">
        <h1>Participantes</h1>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Pagamento</th>
                <th>Apostas</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td>{participant.name}</td>
                  <td>
                    {participant.email}
                    <br />
                    {participant.phone}
                  </td>
                  <td>
                    <StatusBadge status={participant.paymentStatus} />
                    <form className="inline-form" action={updatePaymentStatus}>
                      <input name="id" type="hidden" value={participant.id} />
                      <select name="paymentStatus" defaultValue={participant.paymentStatus}>
                        <option value="PENDING">{formatStatus('PENDING')}</option>
                        <option value="PAID">{formatStatus('PAID')}</option>
                        <option value="CANCELED">{formatStatus('CANCELED')}</option>
                      </select>
                      <button className="button" type="submit">
                        Atualizar
                      </button>
                    </form>
                    {participant.paidAt ? <small>Pago em {formatDateTime(participant.paidAt)}</small> : null}
                  </td>
                  <td>
                    {participant.bets.map((bet) => (
                      <div key={bet.id}>
                        Brasil x {bet.match.opponent}: {bet.brazilGoals} x {bet.opponentGoals}
                      </div>
                    ))}
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
                  <td colSpan={5}>Nenhum participante cadastrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
