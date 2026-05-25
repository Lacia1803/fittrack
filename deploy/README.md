Deployment instructions for FitTrack

1. Copy repo to VPS (or clone):

```bash
# on your local machine
git clone https://github.com/Lacia1803/fittrack.git
scp -r fittrack user@yourvps:/opt/
# or clone directly on VPS
ssh user@yourvps
git clone https://github.com/Lacia1803/fittrack.git /opt/fittrack
cd /opt/fittrack
```

2. Run the deploy script (as root or with sudo):

```bash
sudo bash deploy/deploy.sh yourdomain.tld admin@yourdomain.tld
```

3. After script completes:

- Ensure `.env.local` contains real production keys (Supabase URL/key, GEMINI key). The script opens an editor for you to edit `.env.local`.
- `docker compose up -d --build` will run the app on port 3000.
- Nginx will proxy `http/https` to `http://127.0.0.1:3000` and Certbot will request a Let’s Encrypt certificate.

Notes:

- Replace `yourdomain.tld` and admin email with your real domain and email.
- If Certbot fails due to DNS or firewall, fix DNS and open port 80/443.
- For additional security, consider using Docker secrets or environment variables via your host provider.
