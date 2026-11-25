"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { humanizeFeature } from "@/lib/feature-labels";
import type { ModelMetrics, FeatureImportance } from "@/lib/types";

export function ModelPerformancePanel({
  metrics,
  featureImportance,
}: {
  metrics: ModelMetrics;
  featureImportance: FeatureImportance[];
}) {
  const chartData = featureImportance
    .slice(0, 8)
    .map((f) => ({ name: humanizeFeature(f.feature), value: f.importance }))
    .reverse();

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-sm font-medium mb-4 text-[var(--text-primary)]">Model performance</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard label="ROC-AUC" value={metrics.stacked_ensemble.roc_auc.toFixed(3)} />
        <MetricCard label="PR-AUC" value={metrics.stacked_ensemble.pr_auc.toFixed(3)} />
        <MetricCard
          label="F1 @ optimal threshold"
          value={metrics.stacked_ensemble.f1_at_best_threshold.toFixed(3)}
        />
        <MetricCard
          label="Threshold used"
          value={metrics.stacked_ensemble.best_threshold.toFixed(3)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3">
            Model comparison (ROC-AUC, 5-fold CV)
          </h3>
          <div className="space-y-2">
            <ModelBar
              label="Stacked ensemble"
              value={metrics.stacked_ensemble.roc_auc}
              highlight
            />
            <ModelBar label="XGBoost (tuned)" value={metrics.individual_models.xgboost.roc_auc} />
            <ModelBar
              label="LightGBM (tuned)"
              value={metrics.individual_models.lightgbm.roc_auc}
            />
            <ModelBar
              label="Logistic regression"
              value={metrics.individual_models.logistic_regression.roc_auc}
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Real-time scoring uses the standalone tuned XGBoost model via ONNX — nearly
            identical accuracy to the full stack, with far lower cold-start weight. The
            stacked ensemble runs for batch/offline scoring.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-3">
            Top global risk drivers (mean |SHAP|)
          </h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v) => (typeof v === "number" ? v.toFixed(3) : String(v))}
                />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="var(--accent)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--surface-raised)] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      <div className="font-mono text-lg tabular-nums">{value}</div>
    </div>
  );
}

function ModelBar({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const pct = ((value - 0.5) / 0.5) * 100; // 0.5 = random baseline
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={highlight ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}>
          {label}
        </span>
        <span className="font-mono tabular-nums">{value.toFixed(4)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--surface-raised)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(pct, 4)}%`,
            backgroundColor: highlight ? "var(--accent)" : "var(--text-tertiary)",
          }}
        />
      </div>
    </div>
  );
}
