import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CustomerScore, ModelMetrics, FeatureImportance } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

let customersCache: CustomerScore[] | null = null;

export function getAllCustomers(): CustomerScore[] {
  if (!customersCache) {
    const raw = fs.readFileSync(path.join(DATA_DIR, "customer_scores.json"), "utf-8");
    customersCache = JSON.parse(raw);
  }
  return customersCache!;
}

export function getMetrics(): ModelMetrics {
  const raw = fs.readFileSync(path.join(DATA_DIR, "metrics.json"), "utf-8");
  return JSON.parse(raw);
}

export function getFeatureImportance(): FeatureImportance[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "feature_importance.json"), "utf-8");
  return JSON.parse(raw);
}

export interface CustomerQuery {
  search?: string;
  tier?: "high" | "medium" | "low" | "all";
  sortBy?: "risk_score" | "account_age_days" | "daily_usage_mins";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function queryCustomers(q: CustomerQuery) {
  let rows = getAllCustomers();

  if (q.tier && q.tier !== "all") {
    rows = rows.filter((r) => r.risk_tier === q.tier);
  }
  if (q.search) {
    const s = q.search.toLowerCase();
    rows = rows.filter(
      (r) => r.customer_id.toLowerCase().includes(s) || r.name.toLowerCase().includes(s)
    );
  }

  const sortBy = q.sortBy ?? "risk_score";
  const sortDir = q.sortDir ?? "desc";
  rows = [...rows].sort((a, b) => {
    const diff = a[sortBy] - b[sortBy];
    return sortDir === "desc" ? -diff : diff;
  });

  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 25;
  const total = rows.length;
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);

  return { rows: paged, total, page, pageSize };
}

export function getKpis() {
  const rows = getAllCustomers();
  const total = rows.length;
  const high = rows.filter((r) => r.risk_tier === "high").length;
  const medium = rows.filter((r) => r.risk_tier === "medium").length;
  const avgRisk = rows.reduce((sum, r) => sum + r.risk_score, 0) / total;
  return {
    totalCustomers: total,
    highRiskCount: high,
    mediumRiskCount: medium,
    avgRiskScore: avgRisk,
    historicalChurnRate: rows.filter((r) => r.churned_actual === 1).length / total,
  };
}
