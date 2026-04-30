'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Shipment, Vessel } from '@/types';
import AppHeader from '@/components/layout/AppHeader';

export default function CaptainPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    shipment_id: '',
    vessel_id: '',
    report_type: 'OPERATIONAL',
    severity: 'MEDIUM',
    title: '',
    description: '',
    current_lat: '',
    current_lng: '',
    fuel_remaining_percent: '',
    current_speed_knots: '',
    estimated_repair_hours: '',
    can_continue_under_power: true,
    requires_tow: false,
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'CAPTAIN' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    Promise.all([
      api.get<Shipment[]>('/api/shipments'),
    ]).then(([sRes]) => {
      setShipments(sRes.data);
    }).catch(console.error);
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/captain-reports', {
        ...form,
        current_lat: form.current_lat ? parseFloat(form.current_lat) : undefined,
        current_lng: form.current_lng ? parseFloat(form.current_lng) : undefined,
        fuel_remaining_percent: form.fuel_remaining_percent ? parseFloat(form.fuel_remaining_percent) : undefined,
        current_speed_knots: form.current_speed_knots ? parseFloat(form.current_speed_knots) : undefined,
        estimated_repair_hours: form.estimated_repair_hours ? parseInt(form.estimated_repair_hours) : undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setForm({ shipment_id: '', vessel_id: '', report_type: 'OPERATIONAL', severity: 'MEDIUM', title: '', description: '', current_lat: '', current_lng: '', fuel_remaining_percent: '', current_speed_knots: '', estimated_repair_hours: '', can_continue_under_power: true, requires_tow: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppHeader user={user} active="captain" onLogout={logout} />

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary mb-6">Captain Report</h1>
          <div className="glass-card rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Shipment</label>
                  <select
                    value={form.shipment_id}
                    onChange={(e) => setForm({ ...form, shipment_id: e.target.value })}
                    required
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  >
                    <option value="">Select shipment</option>
                    {shipments.map((s) => (
                      <option key={s.id} value={s.id}>{s.shipment_id_display} - {s.origin_port_name} → {s.destination_port_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Vessel ID</label>
                  <input
                    type="text"
                    value={form.vessel_id}
                    onChange={(e) => setForm({ ...form, vessel_id: e.target.value })}
                    required
                    placeholder="Vessel UUID"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Report Type</label>
                  <select
                    value={form.report_type}
                    onChange={(e) => setForm({ ...form, report_type: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  >
                    {['OPERATIONAL', 'MECHANICAL_FAILURE', 'WEATHER', 'FUEL_LOW', 'CREW_EMERGENCY', 'GEOPOLITICAL'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  >
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Brief description of the issue"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed description..."
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Current Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.current_lat}
                    onChange={(e) => setForm({ ...form, current_lat: e.target.value })}
                    placeholder="e.g. 31.2304"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Current Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.current_lng}
                    onChange={(e) => setForm({ ...form, current_lng: e.target.value })}
                    placeholder="e.g. 121.4737"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Fuel %</label>
                  <input
                    type="number"
                    min="0" max="100"
                    value={form.fuel_remaining_percent}
                    onChange={(e) => setForm({ ...form, fuel_remaining_percent: e.target.value })}
                    placeholder="75"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Speed (knots)</label>
                  <input
                    type="number"
                    value={form.current_speed_knots}
                    onChange={(e) => setForm({ ...form, current_speed_knots: e.target.value })}
                    placeholder="18"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Repair Hours</label>
                  <input
                    type="number"
                    value={form.estimated_repair_hours}
                    onChange={(e) => setForm({ ...form, estimated_repair_hours: e.target.value })}
                    placeholder="0"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.can_continue_under_power}
                    onChange={(e) => setForm({ ...form, can_continue_under_power: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">Can continue under power</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requires_tow}
                    onChange={(e) => setForm({ ...form, requires_tow: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">Requires tow</span>
                </label>
              </div>

              {error && (
                <div className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-success text-sm bg-success/10 border border-success/30 rounded-lg px-3 py-2">
                  ✓ Report submitted successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-primary text-bg font-semibold py-3 rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
