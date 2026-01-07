# Quick Start: Deploy Frontend to Vultr

## 1. Create Vultr Server

1. Go to https://my.vultr.com/
2. Deploy New Server
3. Choose: Ubuntu 22.04, $6/month plan
4. Add your SSH key
5. Deploy and note the IP address

## 2. Setup Server (One-time)

SSH into your server and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Nginx
apt install -y nginx

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create directory
mkdir -p /var/www/sonic-cartographer/build

# Copy nginx config from this repo
# (Transfer nginx.conf to /etc/nginx/sites-available/sonic-cartographer)
```

From your local machine:

```bash
scp nginx.conf root@YOUR_SERVER_IP:/etc/nginx/sites-available/sonic-cartographer
```

Back on the server:

```bash
# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/sonic-cartographer /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 3. Deploy Frontend

From your local machine in the `frontend/` directory:

```bash
DEPLOY_HOST=YOUR_SERVER_IP ./deploy.sh
```

That's it! Visit `http://YOUR_SERVER_IP` to see your site.

## Optional: Add SSL

If you have a domain:

```bash
# On server
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

## Update Frontend Later

Just run the deploy script again:

```bash
DEPLOY_HOST=YOUR_SERVER_IP ./deploy.sh
```

## Need Help?

See full deployment guide in `DEPLOYMENT.md`
