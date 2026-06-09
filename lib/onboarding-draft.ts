/**
 * Shared constants + types for the Onboarding-Wizard draft state.
 * Persisted in localStorage between wizard steps (client-side only).
 *
 * [CRUX-MK]
 */

export const HOTEL_DRAFT_KEY = "heylou_onboarding_hotel_draft";

export interface HotelDraft {
  name: string;
  address: string;
  pmsType: "mews" | "apaleo" | "protel" | "other";
  roomCount: number;
}

export function loadHotelDraft(): HotelDraft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOTEL_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HotelDraft;
  } catch {
    return null;
  }
}

export function saveHotelDraft(draft: HotelDraft): void {
  localStorage.setItem(HOTEL_DRAFT_KEY, JSON.stringify(draft));
}

export function clearHotelDraft(): void {
  localStorage.removeItem(HOTEL_DRAFT_KEY);
}
