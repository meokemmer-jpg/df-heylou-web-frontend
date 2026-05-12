import { NextRequest, NextResponse } from "next/server";
import { activate9OSCoupling } from "@/lib/9os-coupling";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const actorId = req.headers.get("x-actor-id") ?? "anonymous";
  const result = await activate9OSCoupling(body, actorId);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
