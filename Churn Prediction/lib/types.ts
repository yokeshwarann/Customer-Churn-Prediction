export type RiskTier = "high" | "medium" | "low";

export interface TopFactor {
  feature: string;
  impact: number;
}

export type Sentiment = "negative" | "neutral" | "positive";

export interface CustomerScore {
  customer_id: string;
  /** Display-only. Never used as a model feature -- PII is excluded from scoring. */
  name: string;
  risk_score: number;
  risk_tier: RiskTier;
  churned_actual: number;
  account_age_days: number;
  login_frequency: "Daily" | "Weekly" | "Rarely";
  daily_usage_mins: number;
  last_support_ticket: string;
  ticket_sentiment: Sentiment;
  top_factors: TopFactor[];
}

export interface ModelMetrics {
  individual_models: {
    xgboost: { roc_auc: number; pr_auc: number };
    lightgbm: { roc_auc: number; pr_auc: number };
    logistic_regression: { roc_auc: number; pr_auc: number };
  };
  stacked_ensemble: {
    roc_auc: number;
    pr_auc: number;
    brier_score: number;
    log_loss: number;
    best_threshold: number;
    f1_at_best_threshold: number;
  };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}
