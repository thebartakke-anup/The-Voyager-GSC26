'use client';
import { Disruption } from '@/types';

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  LOW: { bg: 'bg-success/20', text: 'text-success' },
  MEDIUM: { bg: 'bg-warning/20', text: 'text-warning' },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  CRITICAL: { bg: 'bg-danger/20', text: 'text-danger' },
};

const STATUS_ICON: Record<string, string> = {
  OPEN: '🔴',
  INVESTIGATING: '🟡',
  RESOLVED: '🟢',
  DISMISSED: '⚫',
};

interface DisruptionListProps {
  disruptions: Disruption[];
}

export default function DisruptionList({ disruptions }: DisruptionListProps) {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-text-primary font-semibold mb-4">
        Disruptions
        {disruptions.length > 0 && (
          <span className="ml-2 text-xs bg-surface px-2 py-0.5 rounded-full text-text-secondary">
            {disruptions.length}
          </span>
        )}
      </h3>
      {disruptions.length === 0 ? (
        <p className="text-success text-sm text-center py-6">✓ No disruptions reported</p>
      ) : (
        <div className="space-y-3">
          {disruptions.map((d) => {
            const sev = SEVERITY_COLORS[d.severity] || SEVERITY_COLORS.MEDIUM;
            return (
              <div key={d.id} className="bg-bg border border-border/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{STATUS_ICON[d.status] || '⚪'}</span>
                      <span className="text-text-primary text-sm font-medium">{d.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs mt-1">{d.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                      <span>{d.type}</span>
                      <span>·</span>
                      <span>Detected: {new Date(d.detected_at).toLocaleDateString()}</span>
                      {d.estimated_delay_hours && (
                        <>
                          <span>·</span>
                          <span className="text-warning">+{d.estimated_delay_hours}h delay</span>
                        </>
                      )}
                      {d.cost_impact_usd && (
                        <>
                          <span>·</span>
                          <span className="text-danger">${(d.cost_impact_usd / 1000).toFixed(0)}K impact</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`ml-3 text-xs px-2 py-0.5 rounded ${
                    d.status === 'RESOLVED' ? 'bg-success/20 text-success' :
                    d.status === 'OPEN' ? 'bg-danger/20 text-danger' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {d.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
