'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Shipment, Disruption, Recommendation } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import DisruptionList from '@/components/disruptions/DisruptionList';
import AppHeader from '@/components/layout/AppHeader';

export default function ShipmentDetailPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [sRes, dRes, rRes] = await Promise.all([
          api.get<Shipment>(`/api/shipments/${id}`),
          api.get<Disruption[]>(`/api/disruptions?shipment_id=${id}`),
          api.get<Recommendation[]>(`/api/recommendations?shipment_id=${id}`),
        ]);
        setShipment(sRes.data);
        setDisruptions(dRes.data);
        setRecommendations(rRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated, router, id]);

  const handleApprove = async (recId: string) => {
    await api.put(`/api/recommendations/${recId}/approve`);
    const rRes = await api.get<Recommendation[]>(`/api/recommendations?shipment_id=${id}`);
    setRecommendations(rRes.data);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader user={user} active="shipments" onLogout={logout} />

      <main className="flex-1 p-6">
        {loading ? (
          <div className="text-center py-20 text-text-secondary">Loading shipment details...</div>
        ) : !shipment ? (
          <div className="text-center py-20 text-danger">Shipment not found</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary font-mono">{shipment.shipment_id_display}</h1>
                  <StatusBadge status={shipment.status} />
                </div>
                <p className="text-text-secondary mt-1">
                  {shipment.origin_port_name} → {shipment.destination_port_name}
                </p>
              </div>
              <Link href="/shipments">
                <button className="text-text-secondary text-sm hover:text-text-primary">← Back</button>
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-sm">Voyage Progress</span>
                <span className="text-accent-primary font-bold">{shipment.progress_percent}%</span>
              </div>
              <div className="w-full bg-bg rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${shipment.progress_percent}%`,
                    background: 'linear-gradient(90deg, #00d4ff, #00ff41)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-secondary">{shipment.origin_port_name}</span>
                <span className="text-xs text-text-secondary">Day {shipment.simulation_day}</span>
                <span className="text-xs text-text-secondary">{shipment.destination_port_name}</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cargo */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">Cargo Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Type</span>
                    <span className="text-text-primary text-sm">{shipment.cargo_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Weight</span>
                    <span className="text-text-primary text-sm">{shipment.cargo_weight_tons?.toLocaleString()} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Containers</span>
                    <span className="text-text-primary text-sm">{shipment.cargo_containers || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Value</span>
                    <span className="text-accent-primary text-sm">${((shipment.cargo_value_usd || 0) / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              </div>

              {/* Vessel */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">Vessel</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Name</span>
                    <span className="text-text-primary text-sm">{shipment.vessel_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Type</span>
                    <span className="text-text-primary text-sm">{shipment.vessel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Speed</span>
                    <span className="text-text-primary text-sm">{shipment.current_speed_knots || '—'} kts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Position</span>
                    <span className="text-text-secondary text-xs">
                      {shipment.current_lat?.toFixed(2)}, {shipment.current_lng?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Departed</span>
                    <span className="text-text-primary text-sm">{new Date(shipment.departure_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Scheduled</span>
                    <span className="text-text-primary text-sm">{new Date(shipment.scheduled_arrival).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">Current ETA</span>
                    <span className={`text-sm ${shipment.current_eta && new Date(shipment.current_eta) > new Date(shipment.scheduled_arrival) ? 'text-warning' : 'text-success'}`}>
                      {shipment.current_eta ? new Date(shipment.current_eta).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disruptions */}
            <DisruptionList disruptions={disruptions} />

            {/* Recommendations */}
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-text-primary font-semibold mb-4">AI Recommendations</h3>
              {recommendations.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-6">No recommendations</p>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((r) => (
                    <div key={r.id} className="bg-bg border border-border/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded">{r.type}</span>
                            <span className="text-xs text-text-secondary">{r.recommendation_id_display}</span>
                          </div>
                          <p className="text-text-primary text-sm mt-2">{r.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                            {r.cost_delta_usd !== undefined && (
                              <span className={r.cost_delta_usd > 0 ? 'text-warning' : 'text-success'}>
                                {r.cost_delta_usd > 0 ? '+' : ''}{(r.cost_delta_usd / 1000).toFixed(0)}K USD
                              </span>
                            )}
                            {r.time_delta_days !== undefined && (
                              <span className={r.time_delta_days > 0 ? 'text-warning' : 'text-success'}>
                                {r.time_delta_days > 0 ? '+' : ''}{r.time_delta_days} days
                              </span>
                            )}
                            {r.risk_reduction_percent && (
                              <span className="text-success">-{r.risk_reduction_percent}% risk</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            r.status === 'APPROVED' ? 'bg-success/20 text-success' :
                            r.status === 'REJECTED' ? 'bg-danger/20 text-danger' :
                            r.status === 'AUTO_EXECUTED' ? 'bg-accent-primary/20 text-accent-primary' :
                            'bg-warning/20 text-warning'
                          }`}>{r.status}</span>
                          {r.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => handleApprove(r.id)}
                              className="text-xs bg-success/20 text-success border border-success/30 px-3 py-1 rounded hover:bg-success/30 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
