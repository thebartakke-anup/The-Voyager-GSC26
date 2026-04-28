'use client';
import { ShipmentStatus } from '@/types';

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; bg: string; text: string }> = {
  PLANNED: { label: 'Planned', bg: 'bg-text-secondary/20', text: 'text-text-secondary' },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-accent-primary/20', text: 'text-accent-primary' },
  DELAYED: { label: 'Delayed', bg: 'bg-warning/20', text: 'text-warning' },
  AT_PORT: { label: 'At Port', bg: 'bg-success/20', text: 'text-success' },
  DELIVERED: { label: 'Delivered', bg: 'bg-success/20', text: 'text-success' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-danger/20', text: 'text-danger' },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as ShipmentStatus] || {
    label: status,
    bg: 'bg-text-secondary/20',
    text: 'text-text-secondary',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
