#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────
#  deploy.sh  –  one-click production update on the Raspberry Pi
# ────────────────────────────────────────────────────────────
# Project root  : /home/chuy/sales-pi
# Backend venv  : backend/venv
# Front-end src : sales-dashboard/
# Static output : www/
# Services      : sales-backend (systemd)  + nginx
# ────────────────────────────────────────────────────────────
set -euo pipefail

unset GIT_DIR

ROOT=/home/chuy/sales-pi
VENV=$ROOT/backend/venv
FRONT=$ROOT/sales-dashboard
WWW=$ROOT/www

cd "$ROOT"

echo "📦  Updating backend dependencies…"
source "$VENV/bin/activate"
pip install -r backend/requirements.txt

echo "🛠   Building React dashboard…"
cd "$FRONT"
npm ci
npm run build

echo "📂  Publishing static files…"
rm -rf "$WWW"
mkdir  "$WWW"
cp -r dist/* "$WWW"

echo "🚀  Restarting services…"
sudo systemctl restart sales-backend
sudo systemctl reload nginx

echo "✅  Deploy complete"