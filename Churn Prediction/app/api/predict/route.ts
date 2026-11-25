import { NextRequest, NextResponse } from "next/server";
import { predictChurnRisk } from "@/lib/onnx-inference";
import type { RawCustomerInput } from "@/lib/feature-engineering";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RawCustomerInput;
    const result = await predictChurnRisk(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Prediction error:", err);
    return NextResponse.json(
      { error: "Prediction failed. Check that all required fields were provided." },
      { status: 400 }
    );
  }
}
