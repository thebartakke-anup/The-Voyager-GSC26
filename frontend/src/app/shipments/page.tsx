'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Shipment } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

export default function ShipmentsPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get<Shipment[]>('/api/shipments').then((res) => {
      setShipments(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const filtered = shipments.filter((s) =>
    !filter || s.status === filter ||
    s.shipment_id_display?.toLowerCase().includes(filter.toLowerCase()) ||
    s.origin_port_name?.toLowerCase().includes(filter.toLowerCase()) ||
    s.destination_port_name?.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚢</span>
          <span className="text-text-primary font-bold text-lg">Voyagers Tribute</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm">Dashboard</Link>
          <Link href="/shipments" className="text-accent-primary text-sm font-medium">Shipments</Link>
          {user?.role === 'CAPTAIN' && (
            <Link href="/captain" className="text-text-secondary hover:text-text-primary text-sm">Report</Link>
          )}
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">{user?.first_name || user?.email}</span>
            <button onClick={logout} className="text-xs text-danger hover:text-danger/80">Logout</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Shipment Ledger</h1>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter shipments..."
              className="bg-surface border border-border rounded-lg px-4 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary w-64"
            />
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            {loading ? (
              <div className="text-center py-16 text-text-secondary">Loading shipments...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Route', 'Cargo', 'Vessel', 'Progress', 'Status', 'Arrival', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-text-secondary text-xs font-medium uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-accent-primary text-sm font-mono">{s.shipment_id_display}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-primary text-sm">{s.origin_port_name}</p>
                        <p className="text-text-secondary text-xs">→ {s.destination_port_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-primary text-sm">{s.cargo_type}</p>
                        <p className="text-text-secondary text-xs">{s.cargo_weight_tons?.toLocaleString()} tons</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-primary text-sm">{s.vessel_name}</p>
                        <p className="text-text-secondary text-xs">{s.vessel_type}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-bg rounded-full h-1.5 w-20">
                            <div
                              className="h-1.5 rounded-full bg-accent-primary"
                              style={{ width: `${s.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-text-secondary text-xs">{s.progress_percent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-text-secondary text-xs">
                          {new Date(s.scheduled_arrival).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/shipments/${s.shipment_id_display}`}>
                          <button className="text-accent-primary text-xs hover:underline">View →</button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-text-secondary">
                        No shipments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
