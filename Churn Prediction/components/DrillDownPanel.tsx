"use client";

import { X, ArrowUp, ArrowDown } from "lucide-react";
import { SignalBars, TierBadge } from "./SignalBars";
import { humanizeFeature } from "@/lib/feature-labels";
import type { CustomerScore, Sentiment } from "@/lib/types";

export function DrillDownPanel({
  customer,
  onClose,
}: {
  customer: CustomerScore | null;
  onClose: () => void;
}) {
  if (!customer) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] h-full flex items-center justify-center text-center px-6">
        <p className="text-[var(--text-tertiary)] text-sm max-w-[220px]">
          Select an account from the table to see its risk breakdown.
        </p>
      </div>
    );
  }

  const maxAbs = Math.max(...customer.top_factors.map((f) => Math.abs(f.impact)), 0.01);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-start justify-between">
        <div>
          <div className="text-sm font-medium mb-0.5">{customer.name}</div>
          <div className="font-mono text-[10px] text-[var(--text-tertiary)] mb-2">
            {customer.customer_id}
          </div>
          <SignalBars score={customer.risk_score} tier={customer.risk_tier} size="lg" />
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 border-b border-[var(--border)]">
        <Stat label="Tier" node={<TierBadge tier={customer.risk_tier} />} />
        <Stat label="Login frequency" value={customer.login_frequency} />
        <Stat label="Account age" value={`${customer.account_age_days} days`} />
        <Stat label="Daily usage" value={`${customer.daily_usage_mins} min`} />
      </div>

      <div className="p-4 border-b border-[var(--border)]">
        <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1.5">
          Latest support ticket
        </div>
        <p className="text-sm text-[var(--text-primary)] italic mb-1.5">
          &ldquo;{customer.last_support_ticket}&rdquo;
        </p>
        <SentimentBadge sentiment={customer.ticket_sentiment} />
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <h3 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3">
          Top risk factors
        </h3>
        <div className="space-y-3">
          {customer.top_factors.map((f) => {
            const isRisk = f.impact > 0;
            const widthPct = (Math.abs(f.impact) / maxAbs) * 100;
            return (
              <div key={f.feature}>
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                  {isRisk ? (
                    <ArrowUp size={12} className="text-[var(--critical)]" />
                  ) : (
                    <ArrowDown size={12} className="text-[var(--stable)]" />
                  )}
                  <span className="text-[var(--text-primary)]">
                    {humanizeFeature(f.feature)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-raised)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: isRisk ? "var(--critical)" : "var(--stable)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-4">
          Factors above the line push risk up; factors below pull it down. Based on SHAP values
          from the deployed XGBoost model.
        </p>
      </div>
    </div>
  );
}

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  negative: "var(--critical)",
  neutral: "var(--text-secondary)",
  positive: "var(--stable)",
};

function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const color = SENTIMENT_COLOR[sentiment];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {sentiment} sentiment
    </span>
  );
}

function Stat({
  label,
  value,
  node,
}: {
  label: string;
  value?: string;
  node?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      {node ?? <div className="text-sm font-medium">{value}</div>}
    </div>
  );
}
