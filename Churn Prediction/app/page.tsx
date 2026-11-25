import { Radio } from "lucide-react";
import { KpiStrip } from "@/components/KpiStrip";
import { DashboardClient } from "@/components/DashboardClient";
import { ModelPerformancePanel } from "@/components/ModelPerformancePanel";
import { PredictForm } from "@/components/PredictForm";
import { getKpis, getMetrics, getFeatureImportance } from "@/lib/data-server";

export default function Home() {
  const kpis = getKpis();
  const metrics = getMetrics();
  const featureImportance = getFeatureImportance();

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center">
          <Radio size={18} className="text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Churn Signal</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Customer retention risk monitoring
          </p>
        </div>
      </header>

      <KpiStrip
        totalCustomers={kpis.totalCustomers}
        highRiskCount={kpis.highRiskCount}
        mediumRiskCount={kpis.mediumRiskCount}
        historicalChurnRate={kpis.historicalChurnRate}
      />

      <DashboardClient />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <ModelPerformancePanel metrics={metrics} featureImportance={featureImportance} />
        <PredictForm />
      </div>

      <footer className="text-xs text-[var(--text-tertiary)] py-4">
        Trained on your uploaded customer dataset (2,000 accounts). Stacked ensemble
        (XGBoost + LightGBM + logistic regression, meta-learned) for batch scoring; standalone
        calibrated XGBoost via ONNX for real-time single-account scoring. Customer names shown
        for CS actionability only — never used as a model feature.
      </footer>
    </div>
  );
}
