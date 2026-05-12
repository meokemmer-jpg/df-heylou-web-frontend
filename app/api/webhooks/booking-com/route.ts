import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { appendEvent } from "@/lib/audit-log";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-booking-signature");
  const payload = await req.text();
  const secret = process.env.BOOKING_COM_WEBHOOK_SECRET ?? "sandbox-booking-secret";

  if (!signature) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (!constantTimeEqual(expected, signature)) {
    await appendEvent({
      actorId: "booking-com-webhook",
      eventType: "booking.webhook.rejected",
      payload: { reason: "bad_signature" },
    });
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  await appendEvent({
    actorId: "booking-com-webhook",
    eventType: "booking.webhook.received",
    payload: { raw: parsed },
  });

  return NextResponse.json({ ok: true });
}
