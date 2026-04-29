'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthUser, LoginResponse } from '@/types';

// ─── DEMO BYPASS ──────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_BYPASS_AUTH=false in .env.local to disable demo mode.
// When enabled (default), skips backend authentication for MVP demos.
// The fake user is stored under the same keys the rest of the app expects.
const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'false';

const FAKE_USER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'import@globaltrade.com',
  role: 'BUYER',
  first_name: 'Demo',
  last_name: 'User',
  company_name: 'Global Trade Inc.',
};

// A JWT whose payload matches FAKE_USER (signature is intentionally invalid —
// only used to satisfy the axios interceptor header; the backend is not called
// in bypass mode).
const FAKE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiaW1wb3J0QGdsb2JhbHRyYWRlLmNvbSIsInJvbGUiOiJCVVlFUiJ9' +
  '.bypass';

function ensureBypassSession() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('voyager_user')) {
    localStorage.setItem('voyager_token', FAKE_TOKEN);
    localStorage.setItem('voyager_user', JSON.stringify(FAKE_USER));
  }
}
// ──────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const router = useRouter();

  // Initialize with null to avoid hydration mismatch
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage only on client after mount
  useEffect(() => {
    if (BYPASS_AUTH) {
      ensureBypassSession();
    }

    const stored = localStorage.getItem('voyager_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    
    setMounted(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (BYPASS_AUTH) {
        // In bypass mode just accept any credentials and go straight to dashboard
        ensureBypassSession();
        setUser(FAKE_USER);
        router.push('/dashboard');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
        localStorage.setItem('voyager_token', data.token);
        localStorage.setItem('voyager_user', JSON.stringify(data.user));
        setUser(data.user);
        router.push('/dashboard');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('voyager_token');
    localStorage.removeItem('voyager_user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return { user, loading, error, login, logout, isAuthenticated, mounted };
}