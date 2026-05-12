/**
 * E2E: Hotelier-Onboarding-Flow (5 Schritte).
 * [CRUX-MK]
 */

import { test, expect } from "@playwright/test";

test.describe("Onboarding-Flow", () => {
  test("Landing-Page rendert mit CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("HeyLou");
    await expect(page.locator("text=Onboarding starten")).toBeVisible();
  });

  test("Schritt 1: Email-Magic-Link mit DEV-MAGIC erfolgreich", async ({ page }) => {
    await page.goto("/onboarding/email");
    await page.fill('input[type="text"]', "DEV-MAGIC");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Weiter zu Schritt 2")).toBeVisible();
  });

  test("Schritt 2: SMS-OTP 000000 erfolgreich", async ({ page }) => {
    await page.goto("/onboarding/phone");
    await page.fill('input[inputMode="numeric"]', "000000");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Weiter zu Schritt 3")).toBeVisible();
  });

  test("Schritt 3: Hotel-Daten-Form valid submit", async ({ page }) => {
    await page.goto("/onboarding/hotel-data");
    await page.fill('input[type="text"]', "Hotel E2E Test");
    await page.fill('input[required]:nth-of-type(2)', "Teststr 1, Berlin").catch(() => undefined);
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Weiter zu Schritt 4")).toBeVisible();
  });

  test("Schritt 4: 9OS-Aktivierung button vorhanden", async ({ page }) => {
    await page.goto("/onboarding/9os-activation");
    await expect(page.locator("text=9OS jetzt aktivieren")).toBeVisible();
  });

  test("Schritt 5: Confirmation-Page rendert + Dashboard-Link", async ({ page }) => {
    await page.goto("/onboarding/confirmation");
    await expect(page.locator("h1")).toContainText("Onboarding abgeschlossen");
    await expect(page.locator("text=Zum Dashboard")).toBeVisible();
  });
});
