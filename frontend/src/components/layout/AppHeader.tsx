'use client';

import Link from 'next/link';
import { User } from '@/types';

interface AppHeaderProps {
  user?: User | null;
  active: 'dashboard' | 'shipments' | 'captain';
  onLogout: () => void;
}

export default function AppHeader({ user, active, onLogout }: AppHeaderProps) {
  return (
    <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚢</span>
        <span className="text-text-primary font-bold text-lg">Voyager Control</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className={active === 'dashboard' ? 'text-accent-primary text-sm font-medium' : 'text-text-secondary hover:text-text-primary text-sm'}>Dashboard</Link>
        <Link href="/shipments" className={active === 'shipments' ? 'text-accent-primary text-sm font-medium' : 'text-text-secondary hover:text-text-primary text-sm'}>Shipments</Link>
        {user?.role === 'CAPTAIN' && (
          <Link href="/captain" className={active === 'captain' ? 'text-accent-primary text-sm font-medium' : 'text-text-secondary hover:text-text-primary text-sm'}>Report</Link>
        )}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">{user?.first_name || user?.email}</span>
          <button onClick={onLogout} className="text-xs text-danger hover:text-danger/80">Logout</button>
        </div>
      </div>
    </nav>
  );
}
