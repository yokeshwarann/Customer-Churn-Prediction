import { AlertTriangle, Radio, TrendingDown, Users } from "lucide-react";

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex-1 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-wide mb-2">
        <Icon size={14} style={{ color: accent ?? "var(--text-secondary)" }} />
        {label}
      </div>
      <div
        className="font-mono text-2xl font-medium tabular-nums"
        style={{ color: accent ?? "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}

export function KpiStrip({
  totalCustomers,
  highRiskCount,
  mediumRiskCount,
  historicalChurnRate,
}: {
  totalCustomers: number;
  highRiskCount: number;
  mediumRiskCount: number;
  historicalChurnRate: number;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Kpi icon={Users} label="Total accounts" value={totalCustomers.toLocaleString()} />
      <Kpi
        icon={AlertTriangle}
        label="Critical signal"
        value={highRiskCount.toLocaleString()}
        accent="var(--critical)"
      />
      <Kpi
        icon={Radio}
        label="Watch signal"
        value={mediumRiskCount.toLocaleString()}
        accent="var(--watch)"
      />
      <Kpi
        icon={TrendingDown}
        label="Historical churn rate"
        value={`${(historicalChurnRate * 100).toFixed(1)}%`}
      />
    </div>
  );
}
