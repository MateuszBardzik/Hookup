#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Install / update the website on the server: Python packages, database
# migrations, admin files, website build, restart. Gets the latest code from
# GitHub first (git pull). After pushing a change, run on the server:
#   bash /srv/engivexlab/app/deploy/update.sh
# ---------------------------------------------------------------------------
set -euo pipefail
APP=/srv/engivexlab/app
[ -f "$APP/back-end/.env" ] || { echo "back-end/.env is missing - run deploy/server-setup.sh first"; exit 1; }

if [ -d "$APP/.git" ] && [ "${1:-}" != "--pulled" ]; then
  echo "== Latest code from GitHub"
  git -C "$APP" pull --ff-only
  exec bash "$APP/deploy/update.sh" --pulled   # restart with the new version of this script
fi

echo "== Back-end (Django)"
cd "$APP/back-end"
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt
mkdir -p media
.venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py collectstatic --noinput -v 0

echo "== Front-end (React build)"
cd "$APP/front-end"
npm ci --no-audit --no-fund --loglevel=error
npm run build

echo "== Permissions + restart"
chown -R engivex:www-data "$APP/back-end"
chmod 640 "$APP/back-end/.env"
systemctl restart engivexlab
nginx -t -q && systemctl reload nginx
sleep 1
systemctl is-active --quiet engivexlab && echo "Website is running." || { echo "The app did not start - see: journalctl -u engivexlab -n 50"; exit 1; }
