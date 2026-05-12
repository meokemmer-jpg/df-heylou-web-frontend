/**
 * Seed-Skript fuer Sandbox-Daten. Nuetzlich fuer manuellen Test des Dashboards.
 *
 * Usage: npx tsx scripts/seed-sandbox-data.ts
 * [CRUX-MK]
 */

import { createHotel, type Hotel } from "../lib/db";

async function main() {
  const hotels: Hotel[] = [
    {
      id: "demo-hotel-001",
      ownerId: "demo-owner-001",
      name: "Demo Hotel Berlin",
      address: "Friedrichstr. 1, 10117 Berlin",
      pmsType: "mews",
      roomCount: 42,
      ninoOSCouplingStatus: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-hotel-002",
      ownerId: "demo-owner-002",
      name: "Demo Hotel Muenchen",
      address: "Marienplatz 5, 80331 Muenchen",
      pmsType: "apaleo",
      roomCount: 78,
      ninoOSCouplingStatus: "pending",
      createdAt: new Date().toISOString(),
    },
  ];

  for (const h of hotels) {
    await createHotel(h);
    console.log(`Seeded hotel: ${h.id} (${h.name})`);
  }
  console.log(`Done. ${hotels.length} hotels seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
