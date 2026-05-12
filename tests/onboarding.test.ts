/**
 * Unit-Tests: Onboarding-Flow + Auth-Layer.
 * Sandbox-Mode default (HEYLOU_WEB_SANDBOX=true).
 *
 * [CRUX-MK]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  currentUser,
  verifyEmail,
  verifyPhone,
  sendMagicLink,
  sendSmsOtp,
  _resetAuthState,
} from "@/lib/auth";
import {
  createHotel,
  getHotel,
  upsertOnboardingState,
  getOnboardingState,
  _resetMemoryStore,
  type Hotel,
  type OnboardingState,
} from "@/lib/db";

beforeEach(() => {
  _resetAuthState();
  _resetMemoryStore();
});

describe("Onboarding · Auth-Layer (Sandbox-Mode)", () => {
  it("currentUser returns sandbox user", async () => {
    const u = await currentUser();
    expect(u).not.toBeNull();
    expect(u?.id).toBe("sandbox-user-001");
    expect(u?.emailVerified).toBe(false);
  });

  it("sendMagicLink returns mock token in sandbox", async () => {
    const result = await sendMagicLink("test@example.com");
    expect(result.ok).toBe(true);
    expect(result.mockToken).toBe("DEV-MAGIC");
  });

  it("verifyEmail accepts DEV-MAGIC token", async () => {
    const ok = await verifyEmail("sandbox-user-001", "DEV-MAGIC");
    expect(ok).toBe(true);
    const u = await currentUser();
    expect(u?.emailVerified).toBe(true);
  });

  it("verifyEmail rejects invalid token", async () => {
    const ok = await verifyEmail("sandbox-user-001", "WRONG");
    expect(ok).toBe(false);
    const u = await currentUser();
    expect(u?.emailVerified).toBe(false);
  });

  it("sendSmsOtp returns mock code in sandbox", async () => {
    const result = await sendSmsOtp("+49 89 0000000");
    expect(result.ok).toBe(true);
    expect(result.mockCode).toBe("000000");
  });

  it("verifyPhone accepts 000000 code", async () => {
    const ok = await verifyPhone("sandbox-user-001", "000000");
    expect(ok).toBe(true);
  });

  it("verifyPhone rejects invalid code", async () => {
    const ok = await verifyPhone("sandbox-user-001", "999999");
    expect(ok).toBe(false);
  });

  it("verifyPhone rejects unknown userId", async () => {
    const ok = await verifyPhone("nonexistent-user", "000000");
    expect(ok).toBe(false);
  });
});

describe("Onboarding · DB-Layer (Sandbox)", () => {
  it("createHotel persists hotel and getHotel retrieves it", async () => {
    const hotel: Hotel = {
      id: "h-001",
      ownerId: "u-001",
      name: "Test Hotel",
      address: "Test Address",
      pmsType: "mews",
      roomCount: 50,
      ninoOSCouplingStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    await createHotel(hotel);
    const retrieved = await getHotel("h-001");
    expect(retrieved?.name).toBe("Test Hotel");
  });

  it("getHotel returns null for unknown id", async () => {
    const result = await getHotel("nonexistent");
    expect(result).toBeNull();
  });

  it("upsertOnboardingState persists and getOnboardingState retrieves by ownerId", async () => {
    const state: OnboardingState = {
      id: "s-001",
      ownerId: "u-001",
      step: "hotel-data",
      emailVerified: true,
      phoneVerified: true,
      hotelData: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertOnboardingState(state);
    const retrieved = await getOnboardingState("u-001");
    expect(retrieved?.step).toBe("hotel-data");
  });
});
