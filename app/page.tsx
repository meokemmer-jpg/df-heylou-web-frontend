import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-heylou-primary">HeyLou</h1>
        <p className="mt-4 text-xl text-neutral-700">
          Direkte Buchungen statt OTA-Kommission. Mit 9OS-NEXT.
        </p>
      </header>

      <section aria-labelledby="value-prop" className="mb-16 grid gap-6 md:grid-cols-3">
        <h2 id="value-prop" className="sr-only">Wert-Proposition</h2>
        <article className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">Booking-Engine</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Eigene direkte Buchungen statt 15-25% OTA-Kommission. Stripe-Integration inklusive.
          </p>
        </article>
        <article className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">9OS-NEXT-Coupling</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Automatische Hotel-OS-Aktivierung. Revenue Management, Channel Manager, PMS-Sync.
          </p>
        </article>
        <article className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">Audit-Trail</h3>
          <p className="mt-2 text-sm text-neutral-600">
            HMAC-SHA256-signierte Transaktionen. DSGVO-konform mit Cross-Tenant-Isolation.
          </p>
        </article>
      </section>

      <section aria-labelledby="cta" className="rounded-xl bg-heylou-primary p-10 text-white">
        <h2 id="cta" className="text-3xl font-bold">Werde Pilot-Hotelier</h2>
        <p className="mt-3 text-lg text-blue-100">
          Hildesheim ist live. Naechstes Hotel: Du.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-heylou-accent px-6 py-3 font-semibold text-neutral-900 hover:bg-yellow-400"
          >
            Onboarding starten
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
          >
            Anmelden
          </Link>
        </div>
      </section>
    </main>
  );
}
