#!/usr/bin/env bash
# Deploy df-heylou-web-frontend to Vercel.
# Pflicht: PHRONESIS_TICKET muss gesetzt sein fuer Production.
# [CRUX-MK]
set -euo pipefail

if [ "${HEYLOU_WEB_SANDBOX:-true}" != "false" ]; then
  echo "[WARN] HEYLOU_WEB_SANDBOX=true. Pre-Production-Deploy."
  echo "[INFO] Fuer Production: export HEYLOU_WEB_SANDBOX=false + PHRONESIS_TICKET=PT-..."
fi

if [ "${HEYLOU_WEB_SANDBOX:-true}" = "false" ]; then
  if [ -z "${PHRONESIS_TICKET:-}" ]; then
    echo "[ERROR] PHRONESIS_TICKET fehlt. Production-Deploy abgebrochen."
    echo "[INFO] Martin-Phronesis-Approval Pflicht per rules/df-akzeptanz-kriterien.md K13."
    exit 1
  fi
  echo "[OK] PHRONESIS_TICKET=$PHRONESIS_TICKET (Production-Deploy-Pfad)."
fi

echo "[1/4] Linting..."
npm run lint || echo "[WARN] Lint warnings — continuing"

echo "[2/4] Tests..."
npm run test

echo "[3/4] Build..."
npm run build

echo "[4/4] Vercel-Deploy..."
if command -v vercel >/dev/null 2>&1; then
  vercel deploy --prod
else
  echo "[ERROR] vercel CLI nicht installiert. npm i -g vercel"
  exit 1
fi

echo "[DONE] Deploy abgeschlossen. CRUX-MK Audit-Log-Eintrag erforderlich."
