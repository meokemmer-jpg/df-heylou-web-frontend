/**
 * Stripe-Webhook HMAC-Verification.
 *
 * Port von _df_common/stripe_hmac_verifier.py nach TypeScript.
 *
 * Pflicht-Checks:
 *   - HMAC-SHA256 ueber timestamp + "." + payload mit STRIPE_WEBHOOK_SECRET.
 *   - Replay-Protection: timestamp innerhalb 5 Min Window.
 *   - Idempotency: event.id in seen-Set (max 1000 last).
 *
 * [CRUX-MK]
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const seenEventIds = new Set<string>();
const SEEN_CAP = 1000;

export interface StripeWebhookVerifyResult {
  ok: boolean;
  reason?: "missing_signature" | "bad_format" | "stale_timestamp" | "bad_signature" | "replay_detected" | "invalid_payload";
  eventId?: string;
  eventType?: string;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

export function verifyStripeWebhook(opts: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
  now?: number;
}): StripeWebhookVerifyResult {
  const { payload, signatureHeader, secret } = opts;
  const tolerance = opts.toleranceSeconds ?? 300; // 5 min default
  const now = opts.now ?? Math.floor(Date.now() / 1000);

  if (!signatureHeader) {
    return { ok: false, reason: "missing_signature" };
  }

  // Stripe format: "t=<timestamp>,v1=<sig>,v0=<old_sig>"
  const parts = signatureHeader.split(",").map((s) => s.trim());
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tPart || !v1Part) {
    return { ok: false, reason: "bad_format" };
  }
  const t = Number(tPart.slice(2));
  const v1 = v1Part.slice(3);
  if (!Number.isFinite(t)) {
    return { ok: false, reason: "bad_format" };
  }
  if (Math.abs(now - t) > tolerance) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const expected = createHmac("sha256", secret)
    .update(`${t}.${payload}`)
    .digest("hex");

  if (!constantTimeEqual(expected, v1)) {
    return { ok: false, reason: "bad_signature" };
  }

  // Replay-protection: parse event id from payload.
  let eventId: string | undefined;
  let eventType: string | undefined;
  try {
    const parsed = JSON.parse(payload) as { id?: string; type?: string };
    eventId = parsed.id;
    eventType = parsed.type;
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }

  if (!eventId) {
    return { ok: false, reason: "invalid_payload" };
  }

  if (seenEventIds.has(eventId)) {
    return { ok: false, reason: "replay_detected", eventId, eventType };
  }
  if (seenEventIds.size >= SEEN_CAP) {
    // Drop oldest by re-creating (Set iteration order = insertion order).
    const first = seenEventIds.values().next().value;
    if (first !== undefined) seenEventIds.delete(first);
  }
  seenEventIds.add(eventId);

  return { ok: true, eventId, eventType };
}

/** Test-only reset. */
export function _resetSeenEvents(): void {
  seenEventIds.clear();
}
