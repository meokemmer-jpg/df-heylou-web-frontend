"use client";

import Link from "next/link";
import { useState } from "react";

export default function OnboardingPhonePage() {
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code === "000000") setVerified(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Schritt 2/5: Telefon-Bestaetigung</h1>
      <form onSubmit={handleVerify} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">SMS-Code (6-stellig)</span>
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000 (Sandbox)"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-heylou-primary px-4 py-2 text-white">
          Code pruefen
        </button>
      </form>
      {verified && (
        <Link href="/onboarding/hotel-data" className="mt-6 inline-block rounded-md bg-heylou-accent px-6 py-3 font-semibold text-neutral-900">
          Weiter zu Schritt 3
        </Link>
      )}
    </main>
  );
}
