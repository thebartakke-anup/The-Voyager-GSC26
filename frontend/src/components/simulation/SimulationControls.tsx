'use client';
import { motion } from 'framer-motion';

interface SimulationControlsProps {
  shipmentId: string;
  simulationDay: number;
  onAdvance: () => Promise<void>;
  onReset: () => Promise<void>;
}

export default function SimulationControls({
  simulationDay,
  onAdvance,
  onReset,
}: SimulationControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-primary font-semibold">Simulation Controls</h3>
          <p className="text-text-secondary text-sm mt-0.5">Current Day: <span className="text-accent-primary font-bold">{simulationDay}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg text-sm border border-border text-text-secondary hover:border-accent-primary hover:text-text-primary transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onAdvance}
            className="px-4 py-2 rounded-lg text-sm bg-accent-primary text-bg font-medium hover:bg-accent-primary/90 transition-colors"
          >
            Advance 1 Day →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
