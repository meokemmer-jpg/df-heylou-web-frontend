/**
 * E2E: Hotelier-Dashboard.
 * [CRUX-MK]
 */

import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("Dashboard-Index rendert KPIs", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator("text=Direct-Booking-Revenue")).toBeVisible();
  });

  test("Revenue-Detail-Page rendert Tabelle", async ({ page }) => {
    await page.goto("/dashboard/revenue");
    await expect(page.locator("h1")).toContainText("Revenue");
    await expect(page.locator("th").first()).toBeVisible();
  });

  test("Direct-Bookings-Page rendert Liste", async ({ page }) => {
    await page.goto("/dashboard/direct-bookings");
    await expect(page.locator("h1")).toContainText("Direct Bookings");
  });

  test("9OS-Status-Page rendert Status-Card", async ({ page }) => {
    await page.goto("/dashboard/9os-status");
    await expect(page.locator("h1")).toContainText("9OS-Status");
  });

  test("Dashboard-Navigation Links vorhanden", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator('nav a:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Direct Bookings")')).toBeVisible();
    await expect(page.locator('nav a:has-text("9OS Status")')).toBeVisible();
  });
});
