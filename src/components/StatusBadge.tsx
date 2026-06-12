type StatusTone = 'green' | 'yellow' | 'blue';

const statusLabels: Record<string, { label: string; tone: StatusTone }> = {
  SCHEDULED: { label: 'Agendado', tone: 'yellow' },
  CLOSED: { label: 'Fechado', tone: 'blue' },
  FINISHED: { label: 'Terminado', tone: 'green' },
  PENDING: { label: 'Pendente', tone: 'yellow' },
  PAID: { label: 'Pago', tone: 'green' },
  CANCELED: { label: 'Cancelado', tone: 'blue' },
};

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusLabels[status] ?? { label: status, tone: 'blue' as const };

  return <span className={`status-badge status-badge-${config.tone}`}>{config.label}</span>;
}

export function formatStatus(status: string): string {
  return statusLabels[status]?.label ?? status;
}
