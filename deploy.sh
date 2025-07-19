#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
#  deploy.sh  –  one-command production update on Raspberry Pi
# ───────────────────────────────────────────────────────────
set -euo pipefail                  # stop on first error
unset GIT_DIR                      # prevent bare-repo confusion

# ─── Paths ─────────────────────────────────────────────────
ROOT=/home/chuy/sales-pi           # working tree
VENV=/home/chuy/venv-sales         # venv OUTSIDE the repo
FRONT=$ROOT/sales-dashboard        # React / Vite source.
WWW=$ROOT/www                      # static files served by Nginx

# ─── 1. Check out newest commit into the working tree ─────
echo "🔄  Checking out latest commit…"
git --work-tree="$ROOT" --git-dir="$ROOT/.git" fetch origin main
git --work-tree="$ROOT" --git-dir="$ROOT/.git" reset --hard origin/main

# ─── 2. Backend dependencies (Python) ─────────────────────
echo "📦  Updating backend deps…"
"$VENV/bin/pip" install -r "$ROOT/backend/requirements.txt"

# ─── 3. Build React dashboard (frontend) ──────────────────
echo "🛠   Building React dashboard…"
cd "$FRONT"
npm ci
npm run build

# ─── 4. Publish static files ──────────────────────────────
echo "📂  Publishing static files…"
rm -rf "$WWW"
mkdir  "$WWW"
cp -r dist/* "$WWW"

# ─── 5. Run database migrations (creates DB if missing) ──
echo "📑  Running database migrations…"
cd "$ROOT"                                # ensure project root
export PYTHONPATH="$ROOT/backend"         # make 'backend' importable
"$VENV/bin/flask" --app backend.app db upgrade
cd - >/dev/null                           # return to previous dir

# ─── 6. Restart services ─────────────────────────────────
echo "🚀  Restarting services…"
sudo systemctl restart sales-backend
sudo systemctl reload nginx

echo "✅  Deploy complete"
