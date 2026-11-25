"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { SignalBars, TierBadge } from "./SignalBars";
import type { CustomerScore, RiskTier } from "@/lib/types";

type SortKey = "risk_score" | "account_age_days" | "daily_usage_mins";

export function CustomerTable({
  onSelect,
  selectedId,
}: {
  onSelect: (customer: CustomerScore) => void;
  selectedId: string | null;
}) {
  const [rows, setRows] = useState<CustomerScore[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<RiskTier | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("risk_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      tier,
      sortBy,
      sortDir,
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    setRows(data.rows);
    setTotal(data.total);
    setLoading(false);
  }, [search, tier, sortBy, sortDir, page]);

  useEffect(() => {
    const t = setTimeout(fetchRows, 200); // debounce search
    return () => clearTimeout(t);
  }, [fetchRows]);

  useEffect(() => {
    setPage(1);
  }, [search, tier]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="text"
            placeholder="Search name or customer ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "high", "medium", "low"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors",
                tier === t
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--surface)] text-[var(--text-secondary)] text-xs uppercase tracking-wide">
            <tr className="border-b border-[var(--border)]">
              <th className="text-left font-medium px-4 py-3">Customer</th>
              <th className="text-left font-medium px-4 py-3">Login freq.</th>
              <th
                className="text-left font-medium px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("account_age_days")}
              >
                Account age {sortBy === "account_age_days" && (sortDir === "desc" ? "↓" : "↑")}
              </th>
              <th
                className="text-left font-medium px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("daily_usage_mins")}
              >
                Daily usage {sortBy === "daily_usage_mins" && (sortDir === "desc" ? "↓" : "↑")}
              </th>
              <th
                className="text-left font-medium px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("risk_score")}
              >
                Signal {sortBy === "risk_score" && (sortDir === "desc" ? "↓" : "↑")}
              </th>
              <th className="text-left font-medium px-4 py-3">Tier</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.customer_id}
                onClick={() => onSelect(r)}
                className={clsx(
                  "border-b border-[var(--border)] cursor-pointer transition-colors hover:bg-[var(--surface-raised)]",
                  selectedId === r.customer_id && "bg-[var(--accent-dim)]"
                )}
              >
                <td className="px-4 py-3">
                  <div className="text-[var(--text-primary)]">{r.name}</div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    {r.customer_id.slice(0, 8)}…
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{r.login_frequency}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{r.account_age_days}d</td>
                <td className="px-4 py-3 font-mono tabular-nums">{r.daily_usage_mins}min</td>
                <td className="px-4 py-3">
                  <SignalBars score={r.risk_score} tier={r.risk_tier} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={r.risk_tier} />
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--text-tertiary)]">
                  No accounts match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>
          {total.toLocaleString()} account{total !== 1 && "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 rounded hover:bg-[var(--surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="font-mono">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded hover:bg-[var(--surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
