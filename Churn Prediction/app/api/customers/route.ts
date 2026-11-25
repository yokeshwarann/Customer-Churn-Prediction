import { NextRequest, NextResponse } from "next/server";
import { queryCustomers } from "@/lib/data-server";
import type { RiskTier } from "@/lib/types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = queryCustomers({
    search: sp.get("search") ?? undefined,
    tier: (sp.get("tier") as RiskTier | "all") ?? "all",
    sortBy: (sp.get("sortBy") as "risk_score" | "account_age_days" | "daily_usage_mins") ?? "risk_score",
    sortDir: (sp.get("sortDir") as "asc" | "desc") ?? "desc",
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
  });
  return NextResponse.json(result);
}
