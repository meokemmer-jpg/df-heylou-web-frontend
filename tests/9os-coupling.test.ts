/**
 * Unit-Tests: 9OS-Coupling-Validator.
 *
 * [CRUX-MK]
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  activate9OSCoupling,
  getCouplingStatus,
  HotelDataSchema,
} from "@/lib/9os-coupling";
import { _resetMemoryStore, getHotel, createHotel, type Hotel } from "@/lib/db";
import { _resetAuditLog, getAllEvents } from "@/lib/audit-log";

const baseHotel: Hotel = {
  id: "hotel-9os-test",
  ownerId: "u-test",
  name: "Test Hotel",
  address: "Friedrichstr. 1, Berlin",
  pmsType: "mews",
  roomCount: 30,
  ninoOSCouplingStatus: "pending",
  createdAt: new Date().toISOString(),
};

beforeEach(async () => {
  _resetMemoryStore();
  _resetAuditLog();
  await createHotel(baseHotel);
});

describe("9OS-Coupling-Validator", () => {
  it("HotelDataSchema accepts valid input", () => {
    const result = HotelDataSchema.safeParse({
      id: "h-1",
      name: "OK Hotel",
      address: "Some street 5",
      pmsType: "mews",
      roomCount: 20,
    });
    expect(result.success).toBe(true);
  });

  it("HotelDataSchema rejects empty name", () => {
    const result = HotelDataSchema.safeParse({
      id: "h-1",
      name: "",
      address: "Some street 5",
      pmsType: "mews",
      roomCount: 20,
    });
    expect(result.success).toBe(false);
  });

  it("HotelDataSchema rejects invalid pmsType", () => {
    const result = HotelDataSchema.safeParse({
      id: "h-1",
      name: "OK",
      address: "Some street 5",
      pmsType: "invalid-pms",
      roomCount: 20,
    });
    expect(result.success).toBe(false);
  });

  it("activate9OSCoupling returns active status in sandbox", async () => {
    const result = await activate9OSCoupling(baseHotel, "u-test");
    expect(result.ok).toBe(true);
    expect(result.status).toBe("active");
    expect(result.couplingId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("activate9OSCoupling updates hotel status to active", async () => {
    await activate9OSCoupling(baseHotel, "u-test");
    const hotel = await getHotel(baseHotel.id);
    expect(hotel?.ninoOSCouplingStatus).toBe("active");
  });

  it("activate9OSCoupling persists CouplingRecord", async () => {
    const result = await activate9OSCoupling(baseHotel, "u-test");
    const record = await getCouplingStatus(result.couplingId);
    expect(record).not.toBeNull();
    expect(record?.hotelId).toBe(baseHotel.id);
  });

  it("activate9OSCoupling fails on forced-failure name", async () => {
    const failHotel = { ...baseHotel, name: "Fail-Test Hotel" };
    const result = await activate9OSCoupling(failHotel, "u-test");
    expect(result.ok).toBe(false);
    expect(result.status).toBe("failed");
  });

  it("activate9OSCoupling logs audit events", async () => {
    await activate9OSCoupling(baseHotel, "u-test");
    const events = getAllEvents();
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.find((e) => e.eventType === "9os.coupling.requested")).toBeDefined();
    expect(events.find((e) => e.eventType === "9os.coupling.activated")).toBeDefined();
  });

  it("activate9OSCoupling returns invalid_hotel_data for malformed input", async () => {
    const result = await activate9OSCoupling({ id: "x" }, "u-test");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid_hotel_data");
  });
});
