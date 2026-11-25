const LABELS: Record<string, string> = {
  ticket_sentiment_negative: "Negative sentiment in latest support ticket",
  ticket_sentiment_neutral: "Neutral latest support ticket",
  ticket_sentiment_positive: "Positive sentiment in latest support ticket",
  sentiment_score: "Support ticket sentiment score",
  is_negative_sentiment: "Negative-sentiment support ticket",
  is_positive_sentiment: "Positive-sentiment support ticket",
  explicit_cancel_intent: "Explicitly mentioned cancelling",
  Login_Frequency_Daily: "Logs in daily",
  Login_Frequency_Weekly: "Logs in weekly",
  Login_Frequency_Rarely: "Rarely logs in",
  login_freq_encoded: "Login frequency",
  is_rare_login: "Rarely logs in",
  is_daily_login: "Logs in daily",
  Account_Age_Days: "Account age",
  tenure_years: "Account age (years)",
  is_new_customer: "New account (under 90 days)",
  is_long_tenure: "Long-tenure account (2+ years)",
  Daily_Usage_Mins: "Daily usage time",
  usage_intensity: "Usage intensity",
  low_usage: "Low daily usage",
  disengagement_risk: "Rare login + low usage",
  frustration_and_absence: "Negative ticket + rarely logs in",
  onboarding_complaint_risk: "New account with a complaint",
  engagement_composite: "Overall engagement (frequency \u00d7 usage)",
};

export function humanizeFeature(feature: string): string {
  return LABELS[feature] ?? feature.replace(/_/g, " ");
}
