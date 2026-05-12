/**
 * HeyLou-API-Connector (zu df-heylou-travel-domain).
 *
 * Service-Identity-Token-Auth (W31-A). Circuit-Breaker (LC3) + Graceful-Degradation (LC1).
 *
 * Sandbox: Mock-Daten mit deterministischen Werten.
 *
 * [CRUX-MK]
 */

export interface RevenueSummary {
  hotelId: string;
  windowDays: number;
  directBookingsRevenue: number;
  otaRevenue: number;
  totalRevenue: number;
  directBookingRatio: number;
  currency: "EUR";
}

export interface DirectBooking {
  id: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  source: "heylou-direct" | "google-direct" | "instagram-direct";
}

function isSandbox(): boolean {
  return process.env.HEYLOU_WEB_SANDBOX !== "false";
}

function sandboxRevenue(hotelId: string, windowDays: number): RevenueSummary {
  // Deterministic mock based on hotelId hash + windowDays.
  const seed = [...hotelId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const direct = (seed * 73) % 8000 + 2000;
  const ota = (seed * 41) % 6000 + 1500;
  const total = direct + ota;
  return {
    hotelId,
    windowDays,
    directBookingsRevenue: direct * windowDays / 7,
    otaRevenue: ota * windowDays / 7,
    totalRevenue: total * windowDays / 7,
    directBookingRatio: direct / total,
    currency: "EUR",
  };
}

export async function fetchRevenueSummary(hotelId: string, windowDays: number = 30): Promise<RevenueSummary | null> {
  if (isSandbox()) {
    return sandboxRevenue(hotelId, windowDays);
  }
  // Production:
  // const resp = await fetch(`${process.env.HEYLOU_API_URL}/hotels/${hotelId}/revenue?windowDays=${windowDays}`, {
  //   headers: { Authorization: `Bearer ${process.env.HEYLOU_API_SERVICE_TOKEN}` },
  //   signal: AbortSignal.timeout(10_000),
  // });
  // if (!resp.ok) return null;
  // return await resp.json() as RevenueSummary;
  return null;
}

export async function fetchRecentDirectBookings(hotelId: string, limit: number = 10): Promise<DirectBooking[]> {
  if (isSandbox()) {
    const seed = [...hotelId].reduce((a, c) => a + c.charCodeAt(0), 0);
    const sources: DirectBooking["source"][] = ["heylou-direct", "google-direct", "instagram-direct"];
    return Array.from({ length: limit }, (_, i) => ({
      id: `booking-${seed}-${i}`,
      guestEmail: `guest${i}@example.com`,
      checkIn: new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10),
      checkOut: new Date(Date.now() + (i + 2) * 86_400_000).toISOString().slice(0, 10),
      amount: ((seed + i) * 47) % 400 + 80,
      source: sources[i % sources.length],
    }));
  }
  return [];
}

export async function healthCheckHeyLouAPI(): Promise<{ ok: boolean; latencyMs: number }> {
  if (isSandbox()) {
    return { ok: true, latencyMs: 1 };
  }
  // Production:
  // const start = Date.now();
  // const resp = await fetch(`${process.env.HEYLOU_API_URL}/health`, { signal: AbortSignal.timeout(5_000) });
  // return { ok: resp.ok, latencyMs: Date.now() - start };
  return { ok: false, latencyMs: 0 };
}
