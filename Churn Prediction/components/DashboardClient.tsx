"use client";

import { useState } from "react";
import { CustomerTable } from "./CustomerTable";
import { DrillDownPanel } from "./DrillDownPanel";
import type { CustomerScore } from "@/lib/types";

export function DashboardClient() {
  const [selected, setSelected] = useState<CustomerScore | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 h-[640px]">
      <CustomerTable onSelect={setSelected} selectedId={selected?.customer_id ?? null} />
      <DrillDownPanel customer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
