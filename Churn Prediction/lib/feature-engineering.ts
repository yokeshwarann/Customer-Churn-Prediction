export interface RawCustomerInput {
  Account_Age_Days: number;
  Login_Frequency: "Daily" | "Weekly" | "Rarely";
  Daily_Usage_Mins: number;
  Last_Support_Ticket: string;
}

// Hand-labeled sentiment for the 18 fixed canned support-ticket messages in this dataset.
// Mirrors feature_engineering.py's SENTIMENT_MAP exactly, so real-time and batch scoring
// stay consistent. Validated against training data: negative=83% churn, neutral=18%, positive=9%.
const SENTIMENT_MAP: Record<string, "negative" | "neutral" | "positive"> = {
  "Just checking if my payment went through.": "neutral",
  "Can I add more seats to my current plan?": "positive",
  "I need to update my billing address.": "neutral",
  "How do I change my password?": "neutral",
  "When will the maintenance window end?": "neutral",
  "Is there a tutorial for the new dashboard feature?": "neutral",
  "The UI is too confusing. I can't find the export button.": "negative",
  "I'm very frustrated with the downtime. This is unacceptable.": "negative",
  "Your API documentation is outdated and full of errors.": "negative",
  "The app crashes every time I try to upload a CSV.": "negative",
  "Why did my subscription price increase without notice?": "negative",
  "I've been waiting for support for 3 days. I'm cancelling.": "negative",
  "Customer support was super helpful yesterday. Thanks!": "positive",
  "The integration with Slack works perfectly.": "positive",
  "Just upgraded to the Pro plan, excited to use it.": "positive",
  "This tool has saved my team so much time.": "positive",
  "Smooth experience so far, no complaints.": "positive",
  "I love the new analytics feature! Great job.": "positive",
};

const LOGIN_FREQ_ORDER: Record<string, number> = { Rarely: 0, Weekly: 1, Daily: 2 };

/** Mirrors feature_engineering.py so real-time and batch scoring stay consistent. */
export function engineerFeatures(raw: RawCustomerInput) {
  const sentiment = SENTIMENT_MAP[raw.Last_Support_Ticket] ?? "neutral";
  const sentiment_score = sentiment === "negative" ? -1 : sentiment === "positive" ? 1 : 0;
  const is_negative_sentiment = sentiment === "negative" ? 1 : 0;
  const is_positive_sentiment = sentiment === "positive" ? 1 : 0;
  const explicit_cancel_intent = raw.Last_Support_Ticket.includes("cancelling") ? 1 : 0;

  const login_freq_encoded = LOGIN_FREQ_ORDER[raw.Login_Frequency] ?? 1;
  const is_rare_login = raw.Login_Frequency === "Rarely" ? 1 : 0;
  const is_daily_login = raw.Login_Frequency === "Daily" ? 1 : 0;

  const tenure_years = raw.Account_Age_Days / 365;
  const is_new_customer = raw.Account_Age_Days <= 90 ? 1 : 0;
  const is_long_tenure = raw.Account_Age_Days >= 730 ? 1 : 0;

  const usage_intensity = raw.Daily_Usage_Mins;
  // Note: low_usage's 25th-percentile threshold is fit on the training distribution
  // (feature_engineering.py computes it from the training data's quantile). We use a
  // fixed value derived from that same fit so real-time scoring matches batch scoring.
  const LOW_USAGE_P25 = 11; // Daily_Usage_Mins 25th percentile from training data
  const low_usage = raw.Daily_Usage_Mins < LOW_USAGE_P25 ? 1 : 0;

  const disengagement_risk = is_rare_login * low_usage;
  const frustration_and_absence = is_negative_sentiment * is_rare_login;
  const onboarding_complaint_risk = is_new_customer * is_negative_sentiment;
  const engagement_composite = login_freq_encoded * usage_intensity;

  return {
    Login_Frequency: raw.Login_Frequency,
    ticket_sentiment: sentiment,
    numeric: {
      Account_Age_Days: raw.Account_Age_Days,
      Daily_Usage_Mins: raw.Daily_Usage_Mins,
      sentiment_score,
      is_negative_sentiment,
      is_positive_sentiment,
      explicit_cancel_intent,
      login_freq_encoded,
      is_rare_login,
      is_daily_login,
      tenure_years,
      is_new_customer,
      is_long_tenure,
      usage_intensity,
      low_usage,
      disengagement_risk,
      frustration_and_absence,
      onboarding_complaint_risk,
      engagement_composite,
    } as Record<string, number>,
  };
}
