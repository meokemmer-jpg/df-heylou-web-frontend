/**
 * Unit-Tests: API-Route /api/onboarding + /api/9os/activate.
 * Direct-Handler-Invocation (kein HTTP-Server noetig).
 *
 * [CRUX-MK]
 */

import { describe, it, expect, beforeEach } from "vitest";
import { POST as onboardingPOST } from "@/app/api/onboarding/route";
import { POST as nineOSPOST } from "@/app/api/9os/activate/route";
import { _resetMemoryStore } from "@/lib/db";
import { _resetAuditLog } from "@/lib/audit-log";

function makeReq(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  _resetMemoryStore();
  _resetAuditLog();
});

describe("POST /api/onboarding", () => {
  it("accepts valid hotel input and triggers 9OS coupling", async () => {
    const req = makeReq({
      ownerId: "u-001",
      hotel: {
        name: "Hotel Alpha",
        address: "Hauptstr 1",
        pmsType: "mews",
        roomCount: 30,
      },
    });
    const res = await onboardingPOST(req as never);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.couplingStatus).toBe("active");
  });

  it("rejects invalid JSON", async () => {
    const req = makeReq("{bad json");
    const res = await onboardingPOST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_json");
  });

  it("rejects schema-invalid input", async () => {
    const req = makeReq({ ownerId: "u-001", hotel: { name: "x" } });
    const res = await onboardingPOST(req as never);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("validation_failed");
  });

  it("returns 502 on 9OS coupling failure", async () => {
    const req = makeReq({
      ownerId: "u-001",
      hotel: {
        name: "Fail-Test Hotel",
        address: "Hauptstr 1",
        pmsType: "mews",
        roomCount: 30,
      },
    });
    const res = await onboardingPOST(req as never);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it("includes hotelId in successful response", async () => {
    const req = makeReq({
      ownerId: "u-002",
      hotel: {
        name: "Hotel Beta",
        address: "Hauptstr 2",
        pmsType: "apaleo",
        roomCount: 50,
      },
    });
    const res = await onboardingPOST(req as never);
    const body = await res.json();
    expect(body.hotelId).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("POST /api/9os/activate", () => {
  it("activates with valid hotel data", async () => {
    const req = makeReq({
      id: "h-direct",
      name: "Hotel Direct",
      address: "Direct Str 1",
      pmsType: "mews",
      roomCount: 20,
    }, { "x-actor-id": "u-001" });
    const res = await nineOSPOST(req as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("rejects malformed body with 502 + invalid_hotel_data", async () => {
    const req = makeReq({ id: "x" });
    const res = await nineOSPOST(req as never);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("invalid_hotel_data");
  });

  it("defaults x-actor-id to anonymous", async () => {
    const req = makeReq({
      id: "h-anon",
      name: "Anon Hotel",
      address: "Anon Str 1",
      pmsType: "mews",
      roomCount: 10,
    });
    const res = await nineOSPOST(req as never);
    expect(res.status).toBe(200);
  });

  it("rejects invalid JSON body", async () => {
    const req = makeReq("{bad");
    const res = await nineOSPOST(req as never);
    expect(res.status).toBe(400);
  });
});
