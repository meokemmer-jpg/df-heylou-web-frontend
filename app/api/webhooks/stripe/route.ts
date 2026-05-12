import { NextRequest, NextResponse } from "next/server";
import { verifyStripeWebhook } from "@/lib/stripe-webhook";
import { appendEvent } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "sandbox-stripe-secret";

  const result = verifyStripeWebhook({ payload, signatureHeader: signature, secret });
  if (!result.ok) {
    await appendEvent({
      actorId: "stripe-webhook",
      eventType: "stripe.webhook.rejected",
      payload: { reason: result.reason },
    });
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }

  await appendEvent({
    actorId: "stripe-webhook",
    eventType: result.eventType ?? "stripe.webhook.received",
    targetId: result.eventId ?? null,
    payload: { eventId: result.eventId },
  });

  return NextResponse.json({ ok: true, eventId: result.eventId });
}
