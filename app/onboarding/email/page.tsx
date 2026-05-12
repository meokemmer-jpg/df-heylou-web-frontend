"use client";

import Link from "next/link";
import { useState } from "react";

export default function OnboardingEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (token === "DEV-MAGIC") setVerified(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Schritt 1/5: Email-Bestaetigung</h1>
      <form onSubmit={handleVerify} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Magic-Token aus Email</span>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="DEV-MAGIC (Sandbox)"
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-heylou-primary px-4 py-2 text-white">
          Verifizieren
        </button>
      </form>
      {verified && (
        <Link
          href="/onboarding/phone"
          className="mt-6 inline-block rounded-md bg-heylou-accent px-6 py-3 font-semibold text-neutral-900"
        >
          Weiter zu Schritt 2
        </Link>
      )}
    </main>
  );
}
