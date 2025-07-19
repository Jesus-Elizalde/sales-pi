# 🛠 Raspberry-Pi Deployment Cheat-Sheet  
*(save this as `CHEATSHEET_DEPLOY.md` in `/home/chuy/sales-pi`)*  

| Path / file | Purpose |
| --- | --- |
| `/home/chuy/sales-pi/` | Git working tree (backend, **sales-dashboard**, `deploy.sh`, `migrations/`, …) |
| `/home/chuy/git/sales-pi.git` | **Bare** repo → remote **pi** (`git push pi main`) |
| `/home/chuy/venv-sales/` | Python virtual-environment (outside repo) |
| `backend/instance/sales.db` | SQLite database (auto-created, directory `775`) |
| `deploy.sh` | Build → migrate → restart script (executed by post-receive hook) |
| `migrations/` | Alembic migration scripts |
| `www/` | Static files copied from Vite build & served by Nginx |

---

## 🚀 Daily workflow (Mac → Pi)

```bash
# create / edit code and migrations locally
flask --app backend.app db migrate -m "msg"
flask --app backend.app db upgrade
git add migrations/versions/* deploy.sh …
git commit -m "feat: …"

# push to GitHub
git push origin main

# deploy to Raspberry Pi
git push pi main          # triggers deploy.sh on the Pi
```

Successful push ends with:

```
📑  Running database migrations…
INFO  Running upgrade → heads
🚀  Restarting services…
✅  Deploy complete
```

---

## `deploy.sh` (full reference)

```bash
#!/usr/bin/env bash
set -euo pipefail
unset GIT_DIR                       # avoid bare-repo confusion

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

echo "📑  Running database migrations…"
cd "$ROOT"
export PYTHONPATH="$ROOT/backend"
"$VENV/bin/flask" --app backend.app db upgrade
cd - >/dev/null

echo "🚀  Restarting services…"
sudo systemctl restart sales-backend
sudo systemctl reload nginx
echo "✅  Deploy complete"
```

*Post-receive hook (`/home/chuy/git/sales-pi.git/hooks/post-receive`)*

```bash
#!/bin/bash
/home/chuy/sales-pi/deploy.sh
```

---

## 🔧 Handy commands (on the Pi)

| Task | Command |
| --- | --- |
| Manual deploy | `~/sales-pi/deploy.sh` |
| Backend logs | `journalctl -u sales-backend -f` |
| Nginx errors | `tail -f /var/log/nginx/error.log` |
| Backend status | `systemctl status sales-backend` |
| New migration (dev) | `flask --app backend.app db migrate -m "msg"` |

---

## 🌐 Service URLs (LAN)

| URL | Returns |
| --- | --- |
| `http://192.168.1.176/` | React dashboard |
| `http://192.168.1.176/api/…` | Flask API via Nginx |
| `http://127.0.0.1:8000/…` | Gunicorn direct (Pi only) |

---

## 🛠 First-aid

| Symptom | Fix |
| --- | --- |
| `Could not import 'backend.app'` in deploy | Ensure `export PYTHONPATH=$ROOT/backend` before Flask commands |
| `sqlite3.OperationalError: unable to open database file` | `mkdir -p backend/instance && chmod 775 … && chown chuy:www-data …` |
| Push error “local changes would be overwritten” | Always run `deploy.sh` (it does `reset --hard`) |

> Enjoy painless, one-command deployments for both back-end & front-end 🎉

