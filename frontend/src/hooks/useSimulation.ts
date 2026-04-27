'use client';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { SimulationState } from '@/types';

export function useSimulation(shipmentId: string) {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentState = useCallback(async () => {
    if (!shipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<SimulationState>(`/api/simulation/${shipmentId}/current-state`);
      setState(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch simulation state');
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  const advance = useCallback(async (days = 1) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/simulation/${shipmentId}/advance`, { days });
      await fetchCurrentState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to advance simulation');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, fetchCurrentState]);

  const reset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/simulation/${shipmentId}/reset`);
      await fetchCurrentState();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset simulation');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, fetchCurrentState]);

  return { state, loading, error, fetchCurrentState, advance, reset };
}
