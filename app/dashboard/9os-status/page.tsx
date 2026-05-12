import { getHotel } from "@/lib/db";

export default async function DashboardNineOSPage() {
  const hotel = await getHotel("demo-hotel-001");

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">9OS-Status</h1>
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <p className="text-sm text-neutral-500">Coupling-Status</p>
        <p className="mt-2 text-2xl font-bold">
          {hotel?.ninoOSCouplingStatus ?? "kein Hotel gefunden"}
        </p>
      </div>
    </main>
  );
}
