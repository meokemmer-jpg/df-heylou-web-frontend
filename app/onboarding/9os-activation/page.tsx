"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadHotelDraft, type HotelDraft } from "@/lib/onboarding-draft";

export default function OnboardingNineOSPage() {
  const [activating, setActivating] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "active" | "failed">("idle");
  const [draft, setDraft] = useState<HotelDraft | null>(null);

  useEffect(() => {
    setDraft(loadHotelDraft());
  }, []);

  async function handleActivate() {
    setActivating(true);
    setStatus("pending");
    try {
      const hotelId = crypto.randomUUID();
      const payload = draft
        ? {
            id: hotelId,
            name: draft.name,
            address: draft.address,
            pmsType: draft.pmsType,
            roomCount: draft.roomCount,
          }
        : {
            id: "demo-hotel-001",
            name: "Demo Hotel Berlin",
            address: "Friedrichstr. 1, 10117 Berlin",
            pmsType: "mews",
            roomCount: 42,
          };
      const resp = await fetch("/api/9os/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await resp.json() as { ok: boolean; status?: string };
      setStatus(body.ok ? "active" : "failed");
    } catch {
      setStatus("failed");
    } finally {
      setActivating(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Schritt 4/5: 9OS aktivieren</h1>
      <p className="mt-2 text-neutral-600">
        Verbindung mit 9OS-NEXT (Revenue Management + Channel Manager + PMS-Sync).
      </p>
      {draft && (
        <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Hotel: <strong>{draft.name}</strong> · {draft.roomCount} Zimmer · {draft.pmsType.toUpperCase()}
        </p>
      )}
      <button
        onClick={handleActivate}
        disabled={activating || status === "active"}
        className="mt-6 w-full rounded-md bg-heylou-primary px-4 py-3 text-white disabled:opacity-50"
      >
        {activating ? "Aktiviere..." : status === "active" ? "Aktiviert" : "9OS jetzt aktivieren"}
      </button>
      {status === "active" && (
        <Link href="/onboarding/confirmation" className="mt-6 inline-block rounded-md bg-heylou-accent px-6 py-3 font-semibold text-neutral-900">
          Weiter zu Schritt 5
        </Link>
      )}
      {status === "failed" && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          Aktivierung fehlgeschlagen. Bitte erneut versuchen.
        </p>
      )}
    </main>
  );
}
