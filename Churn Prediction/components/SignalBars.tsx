import clsx from "clsx";
import type { RiskTier } from "@/lib/types";

const TIER_COLOR: Record<RiskTier, string> = {
  low: "var(--stable)",
  medium: "var(--watch)",
  high: "var(--critical)",
};

const TIER_LABEL: Record<RiskTier, string> = {
  low: "Stable",
  medium: "Watch",
  high: "Critical",
};

/**
 * Renders churn risk as a 4-bar signal-strength indicator (telecom motif).
 * Bar count filled scales with risk_score; color encodes tier.
 * More bars filled = stronger churn signal = worse.
 */
export function SignalBars({
  score,
  tier,
  size = "md",
  showLabel = true,
}: {
  score: number;
  tier: RiskTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const filled = Math.max(1, Math.ceil(score * 4));
  const color = TIER_COLOR[tier];

  const heights =
    size === "lg" ? [10, 16, 22, 28] : size === "sm" ? [5, 8, 11, 14] : [7, 11, 15, 19];
  const barWidth = size === "lg" ? 6 : size === "sm" ? 3 : 4;
  const gap = size === "lg" ? "gap-1" : "gap-[3px]";

  return (
    <div className="inline-flex items-center gap-2" role="img" aria-label={`Churn risk ${TIER_LABEL[tier]}, score ${(score * 100).toFixed(0)} percent`}>
      <div className={clsx("flex items-end", gap)}>
        {heights.map((h, i) => (
          <span
            key={i}
            className="rounded-[1px] transition-colors"
            style={{
              width: barWidth,
              height: h,
              backgroundColor: i < filled ? color : "var(--border)",
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color }}
        >
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export function TierBadge({ tier }: { tier: RiskTier }) {
  const color = TIER_COLOR[tier];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {TIER_LABEL[tier]}
    </span>
  );
}
