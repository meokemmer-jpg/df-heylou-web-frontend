"use client";

import Link from "next/link";
import { useState } from "react";
import { HOTEL_DRAFT_KEY, saveHotelDraft } from "@/lib/onboarding-draft";

export { HOTEL_DRAFT_KEY };

export default function OnboardingHotelDataPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pmsType, setPmsType] = useState<"mews" | "apaleo" | "protel" | "other">("mews");
  const [roomCount, setRoomCount] = useState(20);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveHotelDraft({ name, address, pmsType, roomCount });
    setSubmitted(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Schritt 3/5: Hotel-Daten</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Hotel-Daten-Formular">
        <label className="block">
          <span className="text-sm font-medium">Hotel-Name</span>
          <input
            id="hotelName"
            name="hotelName"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Adresse</span>
          <input
            id="address"
            name="address"
            type="text"
            required
            minLength={5}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">PMS-Typ</span>
          <select
            id="pmsType"
            name="pmsType"
            value={pmsType}
            onChange={(e) => setPmsType(e.target.value as typeof pmsType)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            <option value="mews">MEWS</option>
            <option value="apaleo">Apaleo</option>
            <option value="protel">Protel</option>
            <option value="other">Sonstiges</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Zimmer-Anzahl</span>
          <input
            id="roomCount"
            name="roomCount"
            type="number"
            required
            min={1}
            max={2000}
            value={roomCount}
            onChange={(e) => setRoomCount(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-heylou-primary px-4 py-2 text-white">
          Speichern
        </button>
      </form>
      {submitted && (
        <Link href="/onboarding/9os-activation" className="mt-6 inline-block rounded-md bg-heylou-accent px-6 py-3 font-semibold text-neutral-900">
          Weiter zu Schritt 4
        </Link>
      )}
    </main>
  );
}
