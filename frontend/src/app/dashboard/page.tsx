'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Shipment, Disruption } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import dynamic from 'next/dynamic';
import AppHeader from '@/components/layout/AppHeader';

const WorldMap = dynamic(() => import('@/components/map/WorldMap'), { ssr: false });

export default function DashboardPage() {
  const { user, logout, isAuthenticated, mounted } = useAuth();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Wait for hydration AND auth check before redirecting
  useEffect(() => {
    if (!mounted) return; // Still hydrating, don't redirect yet
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const [shipmentsRes, disruptionsRes] = await Promise.all([
          api.get<Shipment[]>('/api/shipments'),
          api.get<Disruption[]>('/api/disruptions'),
        ]);
        setShipments(shipmentsRes.data);
        setDisruptions(disruptionsRes.data);
      } catch (err) {
        console.error('[Dashboard] Failed to load data', err);
        setApiError('Unable to load dashboard data. Check backend connection and login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted, isAuthenticated, router]);

  // Show nothing while hydrating
  if (!mounted) {
    return null;
  }

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT').length,
    delayed: shipments.filter((s) => s.status === 'DELAYED').length,
    delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
    activeDisruptions: disruptions.filter(
      (d) => d.status !== 'RESOLVED' && d.status !== 'DISMISSED'
    ).length,
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Navbar */}
      <AppHeader user={user} active="dashboard" onLogout={logout} />

      <main className="flex-1 p-6 space-y-6">
        {apiError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-danger text-sm">
            {apiError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Shipments', value: stats.total, color: 'text-text-primary' },
            { label: 'In Transit', value: stats.inTransit, color: 'text-accent-primary' },
            { label: 'Delayed', value: stats.delayed, color: 'text-warning' },
            { label: 'Delivered', value: stats.delivered, color: 'text-success' },
            { label: 'Active Disruptions', value: stats.activeDisruptions, color: 'text-danger' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4"
            >
              <p className="text-text-secondary text-xs mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {loading ? '—' : stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl overflow-hidden"
          style={{ height: 420 }}
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-accent-primary text-sm font-medium">🌍 Live Fleet Map</span>
          </div>
          {/* Render map shell even while loading; WorldMap handles empty shipments gracefully */}
          <WorldMap shipments={shipments} />
        </motion.div>

        {/* Shipments & Disruptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Shipments */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-text-primary font-semibold">Recent Shipments</h2>
              <Link href="/shipments" className="text-accent-primary text-xs hover:underline">
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="text-text-secondary text-sm text-center py-8">Loading…</div>
            ) : shipments.length === 0 ? (
              <div className="text-text-secondary text-sm text-center py-8 space-y-1">
                <p>No shipments found</p>

              </div>
            ) : (
              <div className="space-y-3">
                {shipments.slice(0, 5).map((s) => (
                  <Link key={s.id} href={`/shipments/${s.shipment_id_display}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-bg hover:bg-surface/50 transition-colors cursor-pointer border border-border/50">
                      <div>
                        <p className="text-text-primary text-sm font-medium">
                          {s.shipment_id_display}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {s.origin_port_name} → {s.destination_port_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={s.status} />
                        <p className="text-text-secondary text-xs mt-1">{s.progress_percent}%</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active Disruptions */}
          <div className="glass-card rounded-xl p-4">
            <h2 className="text-text-primary font-semibold mb-4">Active Disruptions</h2>
            {loading ? (
              <div className="text-text-secondary text-sm text-center py-8">Loading…</div>
            ) : disruptions.filter((d) => d.status !== 'RESOLVED').length === 0 ? (
              <div className="text-success text-sm text-center py-8">✓ No active disruptions</div>
            ) : (
              <div className="space-y-3">
                {disruptions
                  .filter((d) => d.status !== 'RESOLVED')
                  .slice(0, 5)
                  .map((d) => (
                    <div key={d.id} className="p-3 rounded-lg bg-bg border border-border/50">
                      <div className="flex items-center justify-between">
                        <p className="text-text-primary text-sm font-medium">{d.title}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            d.severity === 'CRITICAL'
                              ? 'bg-danger/20 text-danger'
                              : d.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400'
                              : d.severity === 'MEDIUM'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-success/20 text-success'
                          }`}
                        >
                          {d.severity}
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs mt-1">
                        {d.type} · {d.status}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
