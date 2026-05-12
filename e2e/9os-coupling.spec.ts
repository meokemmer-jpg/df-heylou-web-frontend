/**
 * E2E: 9OS-Coupling-Flow (API + UI-Trigger).
 * [CRUX-MK]
 */

import { test, expect } from "@playwright/test";

test.describe("9OS-Coupling", () => {
  test("API /api/9os/activate liefert active fuer gueltige Hotel-Daten", async ({ request }) => {
    const resp = await request.post("/api/9os/activate", {
      data: {
        id: "e2e-hotel-001",
        name: "E2E Test Hotel",
        address: "Test Str 1",
        pmsType: "mews",
        roomCount: 25,
      },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe("active");
  });

  test("API /api/9os/activate liefert 502 fuer ungueltige Daten", async ({ request }) => {
    const resp = await request.post("/api/9os/activate", {
      data: { id: "x" },
    });
    expect(resp.status()).toBe(502);
  });

  test("API /api/health liefert ok-Status", async ({ request }) => {
    const resp = await request.get("/api/health");
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe("ok");
  });
});
