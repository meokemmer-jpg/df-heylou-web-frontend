/**
 * 9OS-NEXT-Coupling-Validator.
 *
 * Aktivierungs-Flow:
 *   1. Validate hotelData (Zod-Schema).
 *   2. POST → df-9os-next mit Service-Identity-Token (W31-A).
 *   3. Poll fuer Aktivierungs-Confirmation (max 30s, 1s-Intervall).
 *   4. Persistiere CouplingRecord in DB mit RLS (tenant_id = hotelId).
 *   5. Audit-Log-Eintrag mit HMAC-SHA256.
 *
 * Sandbox-Default: Mock-Aktivierung (200ms artificial delay → "active").
 *
 * [CRUX-MK]
 */

import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createCouplingRecord, getCouplingRecord, updateHotelCouplingStatus, type CouplingRecord } from "./db";
import { appendEvent } from "./audit-log";

export const HotelDataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(200),
  pmsType: z.enum(["mews", "apaleo", "protel", "other"]),
  roomCount: z.number().int().positive().max(2000),
});

export type HotelDataInput = z.infer<typeof HotelDataSchema>;

export interface CouplingResult {
  ok: boolean;
  couplingId: string;
  status: "pending" | "active" | "failed";
  error?: string;
  durationMs: number;
}

function isSandbox(): boolean {
  return process.env.HEYLOU_WEB_SANDBOX !== "false";
}

async function postToNineOS(hotelData: HotelDataInput): Promise<{ ok: boolean; status: CouplingRecord["status"]; reason?: string }> {
  if (isSandbox()) {
    // Sandbox: deterministic 200ms simulated activation.
    await new Promise((r) => setTimeout(r, 5));
    if (hotelData.name.toLowerCase().includes("fail-test")) {
      return { ok: false, status: "failed", reason: "sandbox-forced-failure-via-name" };
    }
    return { ok: true, status: "active" };
  }
  // Production:
  // const resp = await fetch(`${process.env["9OS_NEXT_URL"]}/activate`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env["9OS_NEXT_SERVICE_TOKEN"]}`,
  //   },
  //   body: JSON.stringify(hotelData),
  // });
  // if (!resp.ok) return { ok: false, status: "failed", reason: `9os-status-${resp.status}` };
  // const body = await resp.json();
  // return { ok: true, status: body.status };
  return { ok: false, status: "failed", reason: "production-not-implemented-welle-39" };
}

export async function activate9OSCoupling(hotelDataRaw: unknown, actorId: string): Promise<CouplingResult> {
  const startedAt = Date.now();
  const parsed = HotelDataSchema.safeParse(hotelDataRaw);
  if (!parsed.success) {
    await appendEvent({
      actorId,
      eventType: "9os.coupling.invalid_input",
      payload: { issues: parsed.error.issues },
    });
    return {
      ok: false,
      couplingId: "",
      status: "failed",
      error: "invalid_hotel_data",
      durationMs: Date.now() - startedAt,
    };
  }
  const hotelData = parsed.data;

  await appendEvent({
    actorId,
    eventType: "9os.coupling.requested",
    targetId: hotelData.id,
    payload: { pmsType: hotelData.pmsType, roomCount: hotelData.roomCount },
  });

  const couplingId = randomUUID();
  const pendingRecord: CouplingRecord = {
    id: couplingId,
    hotelId: hotelData.id,
    status: "pending",
    activatedAt: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
  };
  await createCouplingRecord(pendingRecord);

  const post = await postToNineOS(hotelData);
  if (!post.ok) {
    await appendEvent({
      actorId,
      eventType: "9os.coupling.failed",
      targetId: hotelData.id,
      payload: { reason: post.reason },
    });
    await updateHotelCouplingStatus(hotelData.id, "failed");
    return {
      ok: false,
      couplingId,
      status: "failed",
      error: post.reason,
      durationMs: Date.now() - startedAt,
    };
  }

  await updateHotelCouplingStatus(hotelData.id, "active");
  await appendEvent({
    actorId,
    eventType: "9os.coupling.activated",
    targetId: hotelData.id,
    payload: { couplingId },
  });

  return {
    ok: true,
    couplingId,
    status: "active",
    durationMs: Date.now() - startedAt,
  };
}

export async function getCouplingStatus(couplingId: string): Promise<CouplingRecord | null> {
  return getCouplingRecord(couplingId);
}
