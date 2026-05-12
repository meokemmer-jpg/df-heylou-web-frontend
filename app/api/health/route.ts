import { NextResponse } from "next/server";
import { healthCheckHeyLouAPI } from "@/lib/heylou-api";

export async function GET() {
  const heylou = await healthCheckHeyLouAPI();
  const sandbox = process.env.HEYLOU_WEB_SANDBOX !== "false";

  const degradation =
    sandbox ? "full"
    : !heylou.ok ? "degraded_no_heylou"
    : "full";

  return NextResponse.json({
    status: heylou.ok ? "ok" : "degraded",
    degradation_mode: degradation,
    dependencies: {
      heylou_api: heylou.ok ? "up" : "down",
      latency_ms: heylou.latencyMs,
    },
    sandbox,
    timestamp: new Date().toISOString(),
  });
}
