#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# One-time setup of a fresh Ubuntu 24.04 server for the engivexlab website.
# Run as root on the server, after cloning the GitHub repo to /srv/engivexlab/app:
#
#   bash /srv/engivexlab/app/deploy/server-setup.sh engivexlab.com you@example.com
#
# (the e-mail address is only for Let's Encrypt certificate notices)
#
# Installs Python tools, Node.js 22, nginx and certbot; creates the app user
# "engivex"; writes back-end/.env for the live site; sets up the app service
# (gunicorn) and nginx; builds everything; gets a free HTTPS certificate.
# Safe to run again.
# ---------------------------------------------------------------------------
set -euo pipefail
DOMAIN=${1:?usage: server-setup.sh <domain> <email>}
EMAIL=${2:?usage: server-setup.sh <domain> <email>}
APP=/srv/engivexlab/app
DEPLOY=$APP/deploy

echo "== 1/7 System packages"
apt-get update -q
DEBIAN_FRONTEND=noninteractive apt-get install -y -q \
  git python3-venv python3-dev build-essential nginx certbot python3-certbot-nginx ufw curl

echo "== 2/7 Node.js 22 (needed to build the website)"
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -q nodejs
fi

echo "== 3/7 Swap file (gives the 2 GB server room while building)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== 4/7 App user 'engivex' (the website does not run as root)"
id engivex >/dev/null 2>&1 || useradd --system --no-create-home --home-dir /srv/engivexlab --shell /usr/sbin/nologin engivex

echo "== 5/7 Settings for the live site (back-end/.env)"
ENV_FILE=$APP/back-end/.env
if [ ! -f "$ENV_FILE" ]; then
  KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
  sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__SECRET__|$KEY|" "$DEPLOY/env.production.example" > "$ENV_FILE"
  echo "   created $ENV_FILE (add Mailgun / Google keys later: nano $ENV_FILE)"
else
  echo "   $ENV_FILE already exists - kept as is"
fi

echo "== 6/7 nginx, app service, firewall"
sed "s|__DOMAIN__|$DOMAIN|g" "$DEPLOY/nginx.conf" > /etc/nginx/sites-available/engivexlab
ln -sf /etc/nginx/sites-available/engivexlab /etc/nginx/sites-enabled/engivexlab
rm -f /etc/nginx/sites-enabled/default
cp "$DEPLOY/engivexlab.service" /etc/systemd/system/engivexlab.service
systemctl daemon-reload
systemctl enable engivexlab
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

bash "$DEPLOY/update.sh"

echo "== 7/7 HTTPS certificate (Let's Encrypt)"
if ! certbot --nginx -n --agree-tos -m "$EMAIL" --redirect -d "$DOMAIN" -d "www.$DOMAIN"; then
  echo "   www.$DOMAIN is not set up in DNS - getting a certificate for $DOMAIN only"
  certbot --nginx -n --agree-tos -m "$EMAIL" --redirect -d "$DOMAIN"
fi

echo
echo "All set: https://$DOMAIN"
echo "Next: create your admin login with"
echo "  cd $APP/back-end && sudo -u engivex .venv/bin/python manage.py createsuperuser"
