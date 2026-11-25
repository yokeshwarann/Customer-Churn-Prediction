import "server-only";
import fs from "node:fs";
import path from "node:path";
import * as ort from "onnxruntime-node";
import { engineerFeatures, type RawCustomerInput } from "./feature-engineering";

const DATA_DIR = path.join(process.cwd(), "data");

let session: ort.InferenceSession | null = null;
let calibration: { x_thresholds: number[]; y_thresholds: number[] } | null = null;
let preprocessingMeta: {
  cat_cols: string[];
  num_cols: string[];
  cat_categories: Record<string, string[]>;
  feature_names: string[];
  threshold: number;
  watch_cutoff: number;
} | null = null;

async function getSession() {
  if (!session) {
    session = await ort.InferenceSession.create(path.join(DATA_DIR, "churn_model.onnx"));
  }
  return session;
}

function getCalibration() {
  if (!calibration) {
    calibration = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "calibration_curve.json"), "utf-8")
    );
  }
  return calibration!;
}

function getPreprocessingMeta() {
  if (!preprocessingMeta) {
    preprocessingMeta = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "preprocessing_meta.json"), "utf-8")
    );
  }
  return preprocessingMeta!;
}

/** Linear interpolation over isotonic regression's monotonic step breakpoints. */
function applyCalibration(rawProb: number): number {
  const { x_thresholds, y_thresholds } = getCalibration();
  if (rawProb <= x_thresholds[0]) return y_thresholds[0];
  if (rawProb >= x_thresholds[x_thresholds.length - 1]) {
    return y_thresholds[y_thresholds.length - 1];
  }
  for (let i = 0; i < x_thresholds.length - 1; i++) {
    if (rawProb >= x_thresholds[i] && rawProb <= x_thresholds[i + 1]) {
      const x0 = x_thresholds[i];
      const x1 = x_thresholds[i + 1];
      const y0 = y_thresholds[i];
      const y1 = y_thresholds[i + 1];
      if (x1 === x0) return y0;
      const t = (rawProb - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return rawProb;
}

function buildFeatureVector(raw: RawCustomerInput): Float32Array {
  const meta = getPreprocessingMeta();
  const engineered = engineerFeatures(raw);
  const vec: number[] = [];

  // one-hot categorical columns, in the exact fitted category order.
  // Note: cat_cols in preprocessing_meta.json use the raw dataset's column names
  // (e.g. "Login_Frequency"), but the engineered sentiment field is exposed as
  // "ticket_sentiment" -- map that one explicitly, the rest pass through directly.
  for (const col of meta.cat_cols) {
    const key = col === "ticket_sentiment" ? "ticket_sentiment" : col;
    const value = (engineered as unknown as Record<string, string>)[key];
    for (const category of meta.cat_categories[col]) {
      vec.push(value === category ? 1 : 0);
    }
  }
  // numeric passthrough columns, in fitted order
  for (const col of meta.num_cols) {
    vec.push(engineered.numeric[col] ?? 0);
  }

  return Float32Array.from(vec);
}

export interface PredictionResult {
  rawProbability: number;
  calibratedRiskScore: number;
  riskTier: "high" | "medium" | "low";
  threshold: number;
}

export async function predictChurnRisk(raw: RawCustomerInput): Promise<PredictionResult> {
  const vec = buildFeatureVector(raw);
  const meta = getPreprocessingMeta();
  const sess = await getSession();

  const tensor = new ort.Tensor("float32", vec, [1, vec.length]);
  const output = await sess.run({ float_input: tensor });

  // onnxmltools XGBoost export -> outputs: [label, probabilities]
  const probsTensor = output["probabilities"] ?? output[sess.outputNames[1]];
  const probs = probsTensor.data as Float32Array;
  const rawProb = probs[1]; // P(churn=1)

  const calibratedRiskScore = applyCalibration(rawProb);
  const riskTier =
    calibratedRiskScore >= meta.threshold
      ? "high"
      : calibratedRiskScore >= meta.watch_cutoff
        ? "medium"
        : "low";

  return {
    rawProbability: rawProb,
    calibratedRiskScore,
    riskTier,
    threshold: meta.threshold,
  };
}
