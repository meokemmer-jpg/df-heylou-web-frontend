/**
 * Audit-Log mit HMAC-SHA256 (W30-G Pattern aus _df_common/audit.py portiert).
 *
 * Pflicht-Felder: timestamp, actor_id, event_type, target_id, payload, hmac.
 * Hash-Chain via prev_hmac (Welle-13 Cross-LLM-2OF3-HARDENED).
 *
 * Sandbox: In-Memory-Append-only-Log.
 * Production: Postgres-Audit-Table mit RLS + Hash-Chain-Integrity-Check.
 *
 * [CRUX-MK]
 */

import { createHmac, randomUUID } from "node:crypto";

export interface AuditEntry {
  id: string;
  sequenceNo: number;
  timestamp: string; // ISO 8601
  actorId: string;
  eventType: string;
  targetId: string | null;
  payload: Record<string, unknown>;
  prevHmac: string | null;
  hmac: string;
}

const memoryLog: AuditEntry[] = [];

function getHmacKey(): string {
  return process.env.AUDIT_LOG_HMAC_KEY ?? "sandbox-dev-key-DO-NOT-USE-IN-PRODUCTION";
}

function computeHmac(entry: Omit<AuditEntry, "hmac">): string {
  const key = getHmacKey();
  const canonical = JSON.stringify({
    id: entry.id,
    sequenceNo: entry.sequenceNo,
    timestamp: entry.timestamp,
    actorId: entry.actorId,
    eventType: entry.eventType,
    targetId: entry.targetId,
    payload: entry.payload,
    prevHmac: entry.prevHmac,
  });
  return createHmac("sha256", key).update(canonical).digest("hex");
}

export async function appendEvent(input: {
  actorId: string;
  eventType: string;
  targetId?: string | null;
  payload?: Record<string, unknown>;
}): Promise<AuditEntry> {
  const prev = memoryLog[memoryLog.length - 1] ?? null;
  const entry: Omit<AuditEntry, "hmac"> = {
    id: randomUUID(),
    sequenceNo: memoryLog.length,
    timestamp: new Date().toISOString(),
    actorId: input.actorId,
    eventType: input.eventType,
    targetId: input.targetId ?? null,
    payload: input.payload ?? {},
    prevHmac: prev?.hmac ?? null,
  };
  const hmac = computeHmac(entry);
  const full: AuditEntry = { ...entry, hmac };
  memoryLog.push(full);
  return full;
}

export async function verifyChain(): Promise<{ valid: boolean; brokenAt: number | null }> {
  let prev: AuditEntry | null = null;
  for (let i = 0; i < memoryLog.length; i++) {
    const entry = memoryLog[i];
    // Sequence-No must increment by 1
    if (entry.sequenceNo !== i) return { valid: false, brokenAt: i };
    // Prev-HMAC must match prev entry's HMAC
    const expectedPrev = prev?.hmac ?? null;
    if (entry.prevHmac !== expectedPrev) return { valid: false, brokenAt: i };
    // HMAC must match recomputed
    const { hmac, ...rest } = entry;
    const recomputed = computeHmac(rest);
    if (hmac !== recomputed) return { valid: false, brokenAt: i };
    prev = entry;
  }
  return { valid: true, brokenAt: null };
}

export function getAllEvents(): AuditEntry[] {
  return [...memoryLog];
}

/** Test-only reset. */
export function _resetAuditLog(): void {
  memoryLog.length = 0;
}
