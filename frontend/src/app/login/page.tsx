'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-bg grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-center p-16 border-r border-border/60 bg-surface/30">
        <h1 className="text-4xl font-bold text-text-primary leading-tight">Voyager Control Center</h1>
        <p className="text-text-secondary mt-4 max-w-md">
          Unified maritime operations, live shipment visibility, and incident response in one secure workspace.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-8 rounded-2xl w-full max-w-md"
        >
          <div className="mb-8">
            <div className="text-3xl mb-3">🚢</div>
            <h2 className="text-2xl font-bold text-text-primary">Sign in</h2>
            <p className="text-text-secondary mt-1 text-sm">Access your operations dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary text-bg font-semibold py-3 rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
