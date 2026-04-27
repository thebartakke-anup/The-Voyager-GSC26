'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthUser, LoginResponse } from '@/types';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voyager_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
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
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('voyager_token');
    localStorage.removeItem('voyager_user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return { user, loading, error, login, logout, isAuthenticated };
}
