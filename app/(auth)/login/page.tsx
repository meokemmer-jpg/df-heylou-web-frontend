"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">Anmelden</h1>
      <p className="mt-2 text-neutral-600">Magic-Link per Email.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Login-Formular">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-heylou-primary px-4 py-2 text-white">
          Magic-Link senden
        </button>
      </form>
      {sent && (
        <p role="status" className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Magic-Link gesendet. Pruefe deine Email. (Sandbox: Token = DEV-MAGIC)
        </p>
      )}
    </main>
  );
}
