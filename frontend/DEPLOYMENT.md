# Sonic Cartographer Frontend - Vultr Deployment Guide

This guide will walk you through deploying the Sonic Cartographer frontend to a Vultr Compute Instance with Nginx.

## Prerequisites

- Vultr account
- SSH key pair configured
- Domain name (optional, but recommended)

## Step 1: Create Vultr Compute Instance

1. Log in to your Vultr account at https://my.vultr.com/
2. Click "Deploy +" → "Deploy New Server"
3. Choose configuration:
   - **Server Type**: Cloud Compute - Shared CPU
   - **Location**: Choose closest to your users
   - **Server Image**: Ubuntu 22.04 LTS (recommended)
   - **Server Size**: $6/month (1 CPU, 1GB RAM) is sufficient
4. Add your SSH key under "SSH Keys"
5. Set a server hostname (e.g., `sonic-cartographer-frontend`)
6. Click "Deploy Now"
7. Wait for the server to be ready (usually 1-2 minutes)
8. Note your server's IP address from the dashboard

## Step 2: Initial Server Setup

SSH into your new server:

```bash
ssh root@YOUR_SERVER_IP
```

Update the system:

```bash
apt update && apt upgrade -y
```

Install required packages:

```bash
apt install -y nginx certbot python3-certbot-nginx curl
```

Configure firewall:

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Step 3: Configure Nginx

Create the web directory:

```bash
mkdir -p /var/www/sonic-cartographer/build
```

Copy the Nginx configuration from this repository to your server. From your local machine:

```bash
scp nginx.conf root@YOUR_SERVER_IP:/etc/nginx/sites-available/sonic-cartographer
```

Or manually create it on the server:

```bash
nano /etc/nginx/sites-available/sonic-cartographer
```

Then paste the contents from `nginx.conf` in this repository.

Enable the site:

```bash
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable Sonic Cartographer site
ln -s /etc/nginx/sites-available/sonic-cartographer /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 4: Deploy the Frontend

### Option A: Automated Deployment (Recommended)

From your local machine, in the `frontend/` directory:

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run deployment
DEPLOY_HOST=YOUR_SERVER_IP ./deploy.sh
```

This will:
- Build the frontend
- Create a deployment package
- Upload to your server
- Extract and configure files
- Reload Nginx

### Option B: Manual Deployment

1. Build the frontend locally:

```bash
npm run build
```

2. Create a tarball:

```bash
tar -czf sonic-cartographer-frontend.tar.gz -C build .
```

3. Upload to server:

```bash
scp sonic-cartographer-frontend.tar.gz root@YOUR_SERVER_IP:/tmp/
```

4. SSH to server and extract:

```bash
ssh root@YOUR_SERVER_IP

cd /tmp
tar -xzf sonic-cartographer-frontend.tar.gz -C /var/www/sonic-cartographer/build

# Set permissions
chown -R www-data:www-data /var/www/sonic-cartographer

# Reload Nginx
systemctl reload nginx

# Clean up
rm /tmp/sonic-cartographer-frontend.tar.gz
```

## Step 5: Configure SSL (Optional but Recommended)

If you have a domain name pointing to your server:

```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for SSL
```

Certificates will auto-renew. Test renewal:

```bash
certbot renew --dry-run
```

## Step 6: Verify Deployment

Visit your site:

```
http://YOUR_SERVER_IP
# or
https://yourdomain.com  (if using SSL)
```

You should see the Sonic Cartographer landing page.

Check the health endpoint:

```bash
curl http://YOUR_SERVER_IP/health
# Should return: healthy
```

## Environment Configuration

The frontend is configured to use your Raindrop backend at:
```
https://svc-01kec55hc6kk97ea5dvjkfp634.01kavf4tgmmw025x22v6x0m5db.lmapp.run
```

To update the API endpoint:

1. Edit `.env.production` locally
2. Rebuild and redeploy:

```bash
npm run build
DEPLOY_HOST=YOUR_SERVER_IP ./deploy.sh
```

## Monitoring and Maintenance

### View Nginx logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Check Nginx status

```bash
systemctl status nginx
```

### Reload Nginx after config changes

```bash
nginx -t  # Test configuration
systemctl reload nginx
```

### Monitor server resources

```bash
# CPU and memory usage
htop

# Disk usage
df -h
```

## Troubleshooting

### Issue: "502 Bad Gateway"

This usually means Nginx can't find the files:

```bash
# Check if files exist
ls -la /var/www/sonic-cartographer/build

# Check permissions
sudo chown -R www-data:www-data /var/www/sonic-cartographer

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

### Issue: "Connection refused" when accessing the site

Check if Nginx is running:

```bash
systemctl status nginx

# If not running, start it
systemctl start nginx
```

Check firewall:

```bash
ufw status
# Make sure ports 80 and 443 are allowed
```

### Issue: API calls failing

Check browser console for CORS errors. The backend should already have CORS configured, but verify:

```bash
# Test API endpoint
curl -I https://svc-01kec55hc6kk97ea5dvjkfp634.01kavf4tgmmw025x22v6x0m5db.lmapp.run/health
```

### Issue: Assets not loading (404 errors)

The Nginx configuration uses `try_files` to handle React Router. If assets still fail:

```bash
# Verify build structure
ls -la /var/www/sonic-cartographer/build/assets/

# Check Nginx config
nginx -t

# Reload
systemctl reload nginx
```

## Updating the Frontend

To deploy updates:

1. Make your changes locally
2. Run the deployment script:

```bash
DEPLOY_HOST=YOUR_SERVER_IP ./deploy.sh
```

This will build and deploy the latest version.

## Cost Estimate

- **Vultr Compute Instance**: $6/month (1GB RAM)
- **Bandwidth**: 1TB included (sufficient for small-medium traffic)
- **Total**: ~$6/month

## Security Recommendations

1. **Enable automatic security updates**:

```bash
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

2. **Change SSH port** (optional):

```bash
nano /etc/ssh/sshd_config
# Change Port 22 to something else
systemctl restart sshd
```

3. **Disable root login**:

```bash
# Create a non-root user first
adduser deploy
usermod -aG sudo deploy

# Then disable root SSH login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd
```

4. **Set up fail2ban**:

```bash
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## Next Steps

- Point your domain name to the Vultr server IP (update A record in DNS)
- Configure SSL with Let's Encrypt (see Step 5)
- Set up monitoring (e.g., UptimeRobot, Netdata)
- Configure automated backups in Vultr dashboard

## Support

For issues specific to:
- **Vultr**: https://www.vultr.com/docs/
- **Nginx**: https://nginx.org/en/docs/
- **Certbot**: https://certbot.eff.org/

---

**Note**: This guide assumes you're deploying to a fresh Ubuntu 22.04 server. Adjust commands as needed for different distributions.
