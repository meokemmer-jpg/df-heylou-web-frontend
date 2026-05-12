/**
 * Unit-Tests: Audit-Log mit HMAC-SHA256 + Hash-Chain (W30-G Port).
 *
 * [CRUX-MK]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  appendEvent,
  verifyChain,
  getAllEvents,
  _resetAuditLog,
} from "@/lib/audit-log";

beforeEach(() => {
  _resetAuditLog();
});

describe("Audit-Log · Hash-Chain", () => {
  it("appendEvent creates entry with HMAC + sequence_no=0", async () => {
    const entry = await appendEvent({
      actorId: "test-user",
      eventType: "test.event",
      payload: { foo: "bar" },
    });
    expect(entry.sequenceNo).toBe(0);
    expect(entry.hmac).toMatch(/^[0-9a-f]{64}$/);
    expect(entry.prevHmac).toBeNull();
  });

  it("appendEvent links subsequent entry via prevHmac", async () => {
    const e1 = await appendEvent({ actorId: "u", eventType: "a" });
    const e2 = await appendEvent({ actorId: "u", eventType: "b" });
    expect(e2.sequenceNo).toBe(1);
    expect(e2.prevHmac).toBe(e1.hmac);
  });

  it("verifyChain returns valid for clean chain", async () => {
    await appendEvent({ actorId: "u", eventType: "a" });
    await appendEvent({ actorId: "u", eventType: "b" });
    await appendEvent({ actorId: "u", eventType: "c" });
    const result = await verifyChain();
    expect(result.valid).toBe(true);
    expect(result.brokenAt).toBeNull();
  });

  it("verifyChain detects tamper (sequence_no manipulated)", async () => {
    await appendEvent({ actorId: "u", eventType: "a" });
    await appendEvent({ actorId: "u", eventType: "b" });
    // Tamper: mutate sequence_no
    const all = getAllEvents();
    all[1].sequenceNo = 99;
    const result = await verifyChain();
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it("verifyChain works on empty log", async () => {
    const result = await verifyChain();
    expect(result.valid).toBe(true);
  });
});
