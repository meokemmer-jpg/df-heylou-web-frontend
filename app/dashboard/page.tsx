import Link from "next/link";
import { fetchRevenueSummary } from "@/lib/heylou-api";

export default async function DashboardPage() {
  const revenue = await fetchRevenueSummary("demo-hotel-001", 30);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-neutral-600">Hotel-Uebersicht. Letzte 30 Tage.</p>

      <section aria-labelledby="kpis" className="mt-8 grid gap-4 md:grid-cols-3">
        <h2 id="kpis" className="sr-only">Kennzahlen</h2>
        <article className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Direct-Booking-Revenue</h3>
          <p className="mt-2 text-2xl font-bold text-heylou-success">
            EUR {revenue ? Math.round(revenue.directBookingsRevenue).toLocaleString("de-DE") : "—"}
          </p>
        </article>
        <article className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">OTA-Revenue</h3>
          <p className="mt-2 text-2xl font-bold text-neutral-700">
            EUR {revenue ? Math.round(revenue.otaRevenue).toLocaleString("de-DE") : "—"}
          </p>
        </article>
        <article className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Direct-Booking-Anteil</h3>
          <p className="mt-2 text-2xl font-bold text-heylou-primary">
            {revenue ? `${Math.round(revenue.directBookingRatio * 100)}%` : "—"}
          </p>
        </article>
      </section>

      <nav aria-label="Dashboard-Navigation" className="mt-12 flex gap-4">
        <Link href="/dashboard/revenue" className="rounded-md bg-heylou-primary px-4 py-2 text-white">
          Revenue
        </Link>
        <Link href="/dashboard/direct-bookings" className="rounded-md border border-heylou-primary px-4 py-2 text-heylou-primary">
          Direct Bookings
        </Link>
        <Link href="/dashboard/9os-status" className="rounded-md border border-heylou-primary px-4 py-2 text-heylou-primary">
          9OS Status
        </Link>
      </nav>
    </main>
  );
}
