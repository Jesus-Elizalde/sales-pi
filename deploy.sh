#!/usr/bin/env bash
# ────────────────────────────────────────────────
#  deploy.sh  —  one-command prod update
# ────────────────────────────────────────────────
set -euo pipefail
unset GIT_DIR                     # avoid bare-repo confusion

ROOT=/home/chuy/sales-pi
VENV=$ROOT/backend/venv
FRONT=$ROOT/sales-dashboard
WWW=$ROOT/www

echo "🔄  Pulling latest code…"
git --work-tree="$ROOT" --git-dir="$ROOT/.git" pull --ff-only

echo "📦  Updating backend deps…"
"$VENV/bin/pip" install -r "$ROOT/backend/requirements.txt"

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
