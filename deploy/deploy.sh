#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./deploy.sh yourdomain.tld git_repo_url your_email@example.com
# Example: sudo ./deploy.sh fittrack.example https://github.com/Lacia1803/fittrack.git admin@example.com

DOMAIN=${1:-}
GIT_REPO=${2:-}
EMAIL=${3:-}

if [ -z "$DOMAIN" ] || [ -z "$GIT_REPO" ] || [ -z "$EMAIL" ]; then
  echo "Usage: sudo $0 <domain> <git_repo_url> <admin_email>"
  exit 1
fi

APP_DIR=/opt/fittrack

echo "=== Starting deploy for $DOMAIN ==="

echo "1) Update system packages"
apt update && apt upgrade -y

echo "2) Create app directory"
mkdir -p $APP_DIR
chown $SUDO_USER:$SUDO_USER $APP_DIR

echo "3) Install prerequisites (curl, gnupg, ca-certificates)"
apt install -y curl gnupg2 ca-certificates lsb-release software-properties-common

echo "4) Install Docker Engine & Compose plugin"
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "5) Install Nginx and Certbot"
apt install -y nginx certbot python3-certbot-nginx

echo "6) Open firewall ports"
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "7) Clone application repo"
if [ -d "$APP_DIR/.git" ]; then
  echo "Repository already exists, pulling latest"
  git -C $APP_DIR pull
else
  git clone "$GIT_REPO" "$APP_DIR"
fi

echo "8) Prepare environment file"
if [ -f "$APP_DIR/.env.example" ]; then
  cp $APP_DIR/.env.example $APP_DIR/.env.local
  echo "Created .env.local from .env.example — please edit $APP_DIR/.env.local and set production keys BEFORE continuing."
else
  echo "No .env.example found in repo — create $APP_DIR/.env.local manually with required variables." 
fi

echo "9) Install & start application with Docker Compose"
cd $APP_DIR
docker compose pull || true
docker compose up -d --build

echo "10) Configure Nginx site"
NGINX_SITE=/etc/nginx/sites-available/fittrack
cp $APP_DIR/deploy/fittrack.nginx.conf.template $NGINX_SITE
sed -i "s/YOUR_DOMAIN_HERE/$DOMAIN/g" $NGINX_SITE
ln -sf $NGINX_SITE /etc/nginx/sites-enabled/fittrack
nginx -t && systemctl reload nginx

echo "11) Obtain SSL certificate with Certbot"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect || true

echo "Deployment finished. Visit https://$DOMAIN"
echo "If you have not edited .env.local with production keys (Supabase/GEMINI), edit it now and then run:"
echo "  cd $APP_DIR && docker compose up -d --build"
#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./deploy.sh yourdomain.tld admin@example.com
# This script assumes it's run on an Ubuntu 22.04+ VPS and that the repository
# has already been cloned into /opt/fittrack or current working directory.

DOMAIN=${1:-}
EMAIL=${2:-}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: sudo $0 yourdomain.tld admin@example.com"
  exit 1
fi

echo "Updating apt and installing dependencies..."
apt update
apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx

echo "Ensure docker service is running"
systemctl enable --now docker

REPO_DIR="$(pwd)"
echo "Using repo dir: $REPO_DIR"

if [ ! -f "$REPO_DIR/.env.local" ]; then
  if [ -f "$REPO_DIR/.env.example" ]; then
    cp "$REPO_DIR/.env.example" "$REPO_DIR/.env.local"
    echo "Copied .env.example -> .env.local. Edit .env.local with production keys before continuing.";
    echo "Opening editor (nano) for .env.local...";
    nano "$REPO_DIR/.env.local"
  else
    echo ".env.example not found in repo. Please create .env.local manually."; exit 1
  fi
fi

echo "Starting application with Docker Compose..."
docker compose up -d --build

NGINX_CONF="/etc/nginx/sites-available/fittrack"
if [ ! -f "$NGINX_CONF" ]; then
  echo "Installing nginx config template to $NGINX_CONF"
  cp "$REPO_DIR/deploy/fittrack.nginx.conf.template" "$NGINX_CONF"
  sed -i "s/YOUR_DOMAIN_HERE/$DOMAIN/g" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/fittrack
fi

echo "Testing nginx config and reloading..."
nginx -t
systemctl reload nginx

echo "Obtaining TLS cert with Certbot..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || true

echo "Deployment finished. Visit: https://$DOMAIN"
