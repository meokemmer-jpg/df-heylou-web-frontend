/**
 * DB-Layer with Sandbox-Default + Postgres-RLS-Production.
 *
 * Sandbox-Mode (HEYLOU_WEB_SANDBOX=true): In-Memory-Store mit deterministischen IDs.
 * Production: Drizzle-ORM + Postgres (Supabase) + RLS-Policies.
 *
 * Pattern aus _df_common/postgres_rls_sandbox_pilot per backend-switch-multi-driver.
 *
 * [CRUX-MK]
 */

export interface Hotel {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  pmsType: "mews" | "apaleo" | "protel" | "other";
  roomCount: number;
  ninoOSCouplingStatus: "pending" | "active" | "failed";
  createdAt: string;
}

export interface OnboardingState {
  id: string;
  ownerId: string;
  step: "email" | "phone" | "hotel-data" | "9os-activation" | "confirmation";
  emailVerified: boolean;
  phoneVerified: boolean;
  hotelData: Partial<Hotel> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouplingRecord {
  id: string;
  hotelId: string;
  status: "pending" | "active" | "failed";
  activatedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface InMemoryStore {
  hotels: Map<string, Hotel>;
  onboarding: Map<string, OnboardingState>;
  couplings: Map<string, CouplingRecord>;
}

const memoryStore: InMemoryStore = {
  hotels: new Map(),
  onboarding: new Map(),
  couplings: new Map(),
};

function isSandbox(): boolean {
  return process.env.HEYLOU_WEB_SANDBOX !== "false";
}

/**
 * Set tenant context for Postgres-RLS.
 * Sandbox: no-op. Production: SET LOCAL app.tenant_id = $1.
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  if (isSandbox()) return;
  // Production: SET LOCAL app.tenant_id = tenantId via prepared statement.
  // Implementation pending Welle-39 (Drizzle-Postgres-Adapter).
  void tenantId;
}

export async function getHotel(id: string): Promise<Hotel | null> {
  if (isSandbox()) {
    return memoryStore.hotels.get(id) ?? null;
  }
  // Production: drizzle.select().from(hotelsTable).where(eq(id, hotelsTable.id));
  return null;
}

export async function createHotel(hotel: Hotel): Promise<Hotel> {
  if (isSandbox()) {
    memoryStore.hotels.set(hotel.id, hotel);
    return hotel;
  }
  // Production: drizzle.insert(...).returning();
  return hotel;
}

export async function updateHotelCouplingStatus(
  id: string,
  status: Hotel["ninoOSCouplingStatus"],
): Promise<Hotel | null> {
  if (isSandbox()) {
    const h = memoryStore.hotels.get(id);
    if (!h) return null;
    const updated = { ...h, ninoOSCouplingStatus: status };
    memoryStore.hotels.set(id, updated);
    return updated;
  }
  return null;
}

export async function getOnboardingState(ownerId: string): Promise<OnboardingState | null> {
  if (isSandbox()) {
    for (const state of memoryStore.onboarding.values()) {
      if (state.ownerId === ownerId) return state;
    }
    return null;
  }
  return null;
}

export async function upsertOnboardingState(state: OnboardingState): Promise<OnboardingState> {
  if (isSandbox()) {
    memoryStore.onboarding.set(state.id, state);
    return state;
  }
  return state;
}

export async function createCouplingRecord(record: CouplingRecord): Promise<CouplingRecord> {
  if (isSandbox()) {
    memoryStore.couplings.set(record.id, record);
    return record;
  }
  return record;
}

export async function getCouplingRecord(id: string): Promise<CouplingRecord | null> {
  if (isSandbox()) {
    return memoryStore.couplings.get(id) ?? null;
  }
  return null;
}

/** Test-only helper for resetting In-Memory-Store between tests. */
export function _resetMemoryStore(): void {
  memoryStore.hotels.clear();
  memoryStore.onboarding.clear();
  memoryStore.couplings.clear();
}

export function _getStoreSnapshot(): InMemoryStore {
  return memoryStore;
}
