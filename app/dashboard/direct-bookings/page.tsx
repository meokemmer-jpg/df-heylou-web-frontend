import { fetchRecentDirectBookings } from "@/lib/heylou-api";

export default async function DashboardDirectBookingsPage() {
  const bookings = await fetchRecentDirectBookings("demo-hotel-001", 10);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Direct Bookings</h1>
      <ul className="mt-8 divide-y divide-neutral-200">
        {bookings.map((b) => (
          <li key={b.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{b.guestEmail}</p>
              <p className="text-sm text-neutral-500">
                {b.checkIn} - {b.checkOut} ({b.source})
              </p>
            </div>
            <p className="font-semibold">EUR {b.amount}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
