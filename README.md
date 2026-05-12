# df-heylou-web-frontend [CRUX-MK]

**Welle-38 Foundation-DF: HeyLou-Webseite + Hotelier-Onboarding + 9OS-NEXT-Coupling**

## Status

- **DF-ID:** df-heylou-web-frontend
- **Welle:** 38
- **Type:** foundation-df (serverless via Vercel)
- **Stack:** Next.js 15 + TypeScript 5.7 + Tailwind 4 + Vercel + Postgres (Supabase) + Clerk-Auth
- **Sandbox-Default:** `HEYLOU_WEB_SANDBOX=true` (mocked Stripe + Clerk + In-Memory DB)

## Stack-Begruendung (Trinity-Entscheidung Conservative)

| Achse | Wahl | Begruendung |
|-------|------|-------------|
| Framework | Next.js 15 App-Router | Konsistent zu V10-Foundation-Stack (288 Tests passing, empirisch validiert) |
| Language | TypeScript 5.7 strict | rules/coding.md §1 (no `any`) |
| UI | Tailwind 4 + shadcn/ui-Pattern | A11y-defaults, schnelles Render |
| Deploy | Vercel | 1-Klick-Deploy, V10-bereits-getestet |
| Database | Postgres (Supabase) + RLS | Multi-Tenant-Pflicht per Welle-19+ |
| Auth | Clerk (managed) | Magic-Link + SMS-OTP-Mock im Sandbox |

**Sunk-Cost-Maximierung:** Vercel + Supabase + Clerk sind bereits Sub-Komponenten der V10-Foundation. Kein neuer Vendor-Lock.

## Deploy

### Sandbox (Default)

```bash
cd df-heylou-web-frontend
npm install
npm run dev
# → http://localhost:3000
```

ENV-Vars: KEINE noetig (Sandbox-Mode-Default mit Mocks).

### Production via Vercel

```bash
# 1. ENV-Vars setzen
cp .env.example .env.local
# Edit .env.local mit echten Werten:
# - DATABASE_URL (Supabase Postgres)
# - CLERK_SECRET_KEY (Clerk Dashboard)
# - STRIPE_SECRET_KEY (Stripe Dashboard)
# - STRIPE_WEBHOOK_SECRET
# - HEYLOU_API_URL (df-heylou-travel-domain Endpoint)
# - 9OS_NEXT_URL (df-9os-next Coupling-Endpoint)

# 2. Vercel-Deploy
./scripts/deploy-vercel.sh

# 3. Phronesis-Pflicht Martin (PRE-PRODUCTION-CONDITIONAL):
# - PHRONESIS_TICKET setzen vor LaunchAgent/Production
# - Pre-Action-Verification per K13 (rules/df-akzeptanz-kriterien.md)
```

## Test-Suite

### Unit-Tests (Vitest)

```bash
npm run test
# Mindest-Anforderung: 33 Tests passing
```

### E2E-Tests (Playwright)

```bash
npm run test:e2e
# Mindest-Anforderung: 13 E2E-Tests passing
```

### Health-Check (LC5)

```bash
curl http://localhost:3000/api/health
# → {"status":"ok","degradation_mode":"<full|degraded_*|standalone_static>"}
```

## Architektur

### Hotelier-Onboarding-Wizard (5 Schritte)

1. **Email-Verification** (Clerk Magic-Link, Sandbox: Mock-Token "DEV-MAGIC")
2. **Phone-Verification** (SMS-OTP, Sandbox: Mock-Code "000000")
3. **Hotel-Data-Capture** (Name + Adresse + PMS-Type + Anzahl-Zimmer)
4. **9OS-NEXT-Activation** (POST /api/9os/activate)
5. **Confirmation** + Dashboard-Redirect

### 9OS-Coupling-Validator

`lib/9os-coupling.ts`:
- `activate9OSCoupling(hotelData) → CouplingResult`
- HTTP-POST zu `9OS_NEXT_URL` (Service-Identity-Token-Auth)
- Polling fuer Aktivierung (max 30s)
- Postgres-Persist mit RLS (tenant_id = hotelId)
- HMAC-SHA256 Audit-Log

### HeyLou-API-Connector

`lib/heylou-api.ts`:
- REST zu `HEYLOU_API_URL` (df-heylou-travel-domain)
- Service-Identity-Token-Auth (per W31-A)

### Stripe-Webhook-Endpoint

`app/api/webhooks/stripe/route.ts`:
- HMAC-SHA256-Verification (per `_df_common/stripe_hmac_verifier.py` Pattern in TypeScript)
- Replay-Protection via timestamp + idempotency_key

## Lose-Coupling (LC1-LC5)

- **LC1 Graceful-Degradation:** 4 Modi (full / degraded_no_db / degraded_no_clerk / standalone_static)
- **LC2 Direct-Mode:** Static-Landing-Page laeuft ohne DB/Auth (70% Capability)
- **LC3 Circuit-Breaker:** 10s Timeout pro Dependency
- **LC4 Failure-Isolation:** Serverless = state_externalization (DB/Cache)
- **LC5 Health-Check:** `/api/health` mit Dependency-Status

## Pflicht-DF-Akzeptanz (K11-K16)

| Kriterium | Implementation |
|-----------|----------------|
| K11 Cascade-Containment | hard (serverless, blast_radius=1) |
| K12 Distillation-Resistenz | output_feeds_into_training=false, provenance=true |
| K13 Independent-Ground-Truth | stripe_webhook_hmac als externer Anker |
| K14 Human-Override-Decay | Vercel-Console + Clerk-Dashboard + Martin-Phronesis-Gate |
| K15 Entropy-Budget | ~3000 LOC neu (justified per Hotelier-Onboarding-rho) |
| K16 Concurrent-Spawn-Mutex | stateless_serverless (kein Mutex noetig) |
| K11.b Pipeline-Cost | Static Pre-Run: max 100 9OS-Aktivierungen/Tag (rate-limit) |

## Cross-DF-Dependencies

| Ziel-DF | Methode | Failure-Mode |
|---------|---------|--------------|
| df-9os-next | POST /api/9os/activate | degraded_no_9os (Onboarding pausiert mit Hint) |
| df-heylou-travel-domain | GET /api/heylou/* | degraded_no_heylou (Dashboard zeigt Cached-Data) |
| df-stripe (extern) | Webhook receive | degraded_no_stripe (Payment-Disabled-Banner) |

## Limitations / Lambda-Honesty (Stand 2026-05-11)

- **Clerk-Setup:** Stub statt Real-Clerk (kein Production-Clerk-Account). Sandbox-Mode mit Mock-Magic-Link.
- **Stripe-Webhook:** HMAC-Verification implementiert, aber kein Real-Stripe-Connection-Test.
- **Postgres-RLS:** SQL-Migration-Skeletons vorhanden, aber kein Real-Supabase-Deploy-Test.
- **9OS-Coupling:** HTTP-Stub (df-9os-next-Endpoint angenommen, kein End-to-End-Test bis Welle-39).
- **Vercel-Deploy:** scripts/deploy-vercel.sh existiert, aber kein Auto-Test gegen Real-Vercel-Account.

[CRUX-MK]
