import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node"],
  outputFileTracingIncludes: {
    "/api/customers": ["./data/**"],
    "/api/predict": ["./data/**"],
    "/": ["./data/**"],
  },
};

export default nextConfig;
