"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { SignalBars, TierBadge } from "./SignalBars";
import type { PredictionResult } from "@/lib/onnx-inference";

const SUPPORT_TICKETS = [
  "Just checking if my payment went through.",
  "Can I add more seats to my current plan?",
  "I need to update my billing address.",
  "How do I change my password?",
  "When will the maintenance window end?",
  "Is there a tutorial for the new dashboard feature?",
  "The UI is too confusing. I can't find the export button.",
  "I'm very frustrated with the downtime. This is unacceptable.",
  "Your API documentation is outdated and full of errors.",
  "The app crashes every time I try to upload a CSV.",
  "Why did my subscription price increase without notice?",
  "I've been waiting for support for 3 days. I'm cancelling.",
  "Customer support was super helpful yesterday. Thanks!",
  "The integration with Slack works perfectly.",
  "Just upgraded to the Pro plan, excited to use it.",
  "This tool has saved my team so much time.",
  "Smooth experience so far, no complaints.",
  "I love the new analytics feature! Great job.",
];

const DEFAULTS = {
  Account_Age_Days: 45,
  Login_Frequency: "Rarely" as "Daily" | "Weekly" | "Rarely",
  Daily_Usage_Mins: 8,
  Last_Support_Ticket: "I've been waiting for support for 3 days. I'm cancelling.",
};

export function PredictForm() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Prediction failed");
      const data: PredictionResult = await res.json();
      setResult(data);
      setLatencyMs(performance.now() - start);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium">Real-time scoring</h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Hits the live ONNX endpoint — same model, single-customer latency.
          </p>
        </div>
        {latencyMs !== null && (
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            {latencyMs.toFixed(0)}ms
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Login frequency">
          <select
            value={form.Login_Frequency}
            onChange={(e) => set("Login_Frequency", e.target.value as typeof form.Login_Frequency)}
            className="select"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Rarely</option>
          </select>
        </Field>
        <Field label="Account age (days)">
          <input
            type="number"
            min={0}
            value={form.Account_Age_Days}
            onChange={(e) => set("Account_Age_Days", Number(e.target.value))}
            className="select"
          />
        </Field>
        <Field label="Daily usage (min)">
          <input
            type="number"
            min={0}
            value={form.Daily_Usage_Mins}
            onChange={(e) => set("Daily_Usage_Mins", Number(e.target.value))}
            className="select"
          />
        </Field>
        <Field label="Latest support ticket">
          <select
            value={form.Last_Support_Ticket}
            onChange={(e) => set("Last_Support_Ticket", e.target.value)}
            className="select"
          >
            {SUPPORT_TICKETS.map((t) => (
              <option key={t} value={t}>
                {t.length > 40 ? t.slice(0, 40) + "…" : t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] text-[#0B0E14] font-medium text-sm px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        <Zap size={14} />
        {loading ? "Scoring…" : "Score this account"}
      </button>

      {error && <p className="text-xs text-[var(--critical)] mt-3">{error}</p>}

      {result && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4">
          <SignalBars score={result.calibratedRiskScore} tier={result.riskTier} size="lg" />
          <TierBadge tier={result.riskTier} />
        </div>
      )}

      <style jsx>{`
        .select {
          width: 100%;
          background: var(--surface-raised);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 13px;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}
