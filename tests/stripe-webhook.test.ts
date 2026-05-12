/**
 * Unit-Tests: Stripe-Webhook HMAC-Verification.
 *
 * [CRUX-MK]
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import { verifyStripeWebhook, _resetSeenEvents } from "@/lib/stripe-webhook";

const SECRET = "whsec_test_secret_DO_NOT_USE";

function signPayload(payload: string, ts: number, secret: string = SECRET): string {
  const sig = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  return `t=${ts},v1=${sig}`;
}

beforeEach(() => {
  _resetSeenEvents();
});

describe("Stripe-Webhook-Verifier", () => {
  it("accepts valid signature within tolerance", () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({ id: "evt_test_001", type: "payment_intent.succeeded" });
    const sig = signPayload(payload, now);
    const result = verifyStripeWebhook({ payload, signatureHeader: sig, secret: SECRET, now });
    expect(result.ok).toBe(true);
    expect(result.eventId).toBe("evt_test_001");
  });

  it("rejects missing signature header", () => {
    const result = verifyStripeWebhook({
      payload: "{}",
      signatureHeader: null,
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("missing_signature");
  });

  it("rejects malformed signature header", () => {
    const result = verifyStripeWebhook({
      payload: "{}",
      signatureHeader: "invalid-format",
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("bad_format");
  });

  it("rejects stale timestamp (>5 min old)", () => {
    const now = Math.floor(Date.now() / 1000);
    const oldTs = now - 600;
    const payload = JSON.stringify({ id: "evt_002", type: "test" });
    const sig = signPayload(payload, oldTs);
    const result = verifyStripeWebhook({
      payload,
      signatureHeader: sig,
      secret: SECRET,
      now,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("stale_timestamp");
  });

  it("rejects bad signature (wrong secret)", () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({ id: "evt_003", type: "test" });
    const sig = signPayload(payload, now, "wrong-secret");
    const result = verifyStripeWebhook({
      payload,
      signatureHeader: sig,
      secret: SECRET,
      now,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("bad_signature");
  });

  it("detects replay (same event_id twice)", () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({ id: "evt_replay", type: "test" });
    const sig = signPayload(payload, now);
    const first = verifyStripeWebhook({ payload, signatureHeader: sig, secret: SECRET, now });
    expect(first.ok).toBe(true);
    const second = verifyStripeWebhook({ payload, signatureHeader: sig, secret: SECRET, now });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("replay_detected");
  });
});
