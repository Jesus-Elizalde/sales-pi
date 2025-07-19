#!/usr/bin/env bash
set -euo pipefail
unset GIT_DIR

ROOT=/home/chuy/sales-pi
VENV=/home/chuy/venv-sales
FRONT=$ROOT/sales-dashboard
WWW=$ROOT/www

echo "🔄  Checking out latest commit…"
git --work-tree="$ROOT" --git-dir="$ROOT/.git" fetch origin main
git --work-tree="$ROOT" --git-dir="$ROOT/.git" reset --hard origin/main

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