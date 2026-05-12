import { fetchRevenueSummary } from "@/lib/heylou-api";

export default async function DashboardRevenuePage() {
  const win30 = await fetchRevenueSummary("demo-hotel-001", 30);
  const win7 = await fetchRevenueSummary("demo-hotel-001", 7);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Revenue</h1>
      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="py-2">Zeitraum</th>
            <th className="py-2">Direct EUR</th>
            <th className="py-2">OTA EUR</th>
            <th className="py-2">Anteil</th>
          </tr>
        </thead>
        <tbody>
          {[win30, win7].map((r) => r && (
            <tr key={r.windowDays} className="border-b border-neutral-100">
              <td className="py-2">{r.windowDays} Tage</td>
              <td className="py-2">{Math.round(r.directBookingsRevenue).toLocaleString("de-DE")}</td>
              <td className="py-2">{Math.round(r.otaRevenue).toLocaleString("de-DE")}</td>
              <td className="py-2">{Math.round(r.directBookingRatio * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
