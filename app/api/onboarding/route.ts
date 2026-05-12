import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { upsertOnboardingState, createHotel, type Hotel, type OnboardingState } from "@/lib/db";
import { activate9OSCoupling } from "@/lib/9os-coupling";
import { appendEvent } from "@/lib/audit-log";

const OnboardingSubmitSchema = z.object({
  ownerId: z.string().min(1),
  hotel: z.object({
    name: z.string().min(2).max(120),
    address: z.string().min(5).max(200),
    pmsType: z.enum(["mews", "apaleo", "protel", "other"]),
    roomCount: z.number().int().positive().max(2000),
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = OnboardingSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const { ownerId, hotel: hotelInput } = parsed.data;

  const hotelId = randomUUID();
  const hotel: Hotel = {
    id: hotelId,
    ownerId,
    name: hotelInput.name,
    address: hotelInput.address,
    pmsType: hotelInput.pmsType,
    roomCount: hotelInput.roomCount,
    ninoOSCouplingStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  await createHotel(hotel);

  const state: OnboardingState = {
    id: randomUUID(),
    ownerId,
    step: "9os-activation",
    emailVerified: true,
    phoneVerified: true,
    hotelData: hotel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await upsertOnboardingState(state);
  await appendEvent({
    actorId: ownerId,
    eventType: "onboarding.hotel_created",
    targetId: hotelId,
    payload: { pmsType: hotel.pmsType, roomCount: hotel.roomCount },
  });

  // Trigger 9OS-NEXT-Activation
  const couplingResult = await activate9OSCoupling(hotel, ownerId);

  return NextResponse.json({
    ok: couplingResult.ok,
    hotelId,
    couplingId: couplingResult.couplingId,
    couplingStatus: couplingResult.status,
    error: couplingResult.error,
  }, { status: couplingResult.ok ? 201 : 502 });
}
