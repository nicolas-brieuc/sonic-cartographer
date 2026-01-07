#!/bin/bash

##############################################################################
# Sonic Cartographer Frontend Deployment Script for Vultr
# This script deploys the built frontend to a Vultr Compute Instance
##############################################################################

set -e  # Exit on error

# Configuration
REMOTE_USER="${DEPLOY_USER:-root}"
REMOTE_HOST="${DEPLOY_HOST}"
REMOTE_PATH="/var/www/sonic-cartographer"
BUILD_DIR="build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if DEPLOY_HOST is set
if [ -z "$REMOTE_HOST" ]; then
    print_error "DEPLOY_HOST environment variable is not set"
    echo "Usage: DEPLOY_HOST=your-server-ip ./deploy.sh"
    exit 1
fi

print_info "Starting deployment to ${REMOTE_HOST}..."

# Step 1: Build the frontend
print_info "Building frontend for production..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not found. Build failed."
    exit 1
fi

print_success "Frontend built successfully"

# Step 2: Create tarball
print_info "Creating deployment package..."
tar -czf sonic-cartographer-frontend.tar.gz -C "$BUILD_DIR" .
print_success "Deployment package created"

# Step 3: Upload to server
print_info "Uploading to server..."
scp sonic-cartographer-frontend.tar.gz "${REMOTE_USER}@${REMOTE_HOST}:/tmp/"
print_success "Upload complete"

# Step 4: Extract and deploy on server
print_info "Deploying on server..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" <<'ENDSSH'
    set -e

    # Create directory if it doesn't exist
    sudo mkdir -p /var/www/sonic-cartographer/build

    # Extract the tarball
    sudo tar -xzf /tmp/sonic-cartographer-frontend.tar.gz -C /var/www/sonic-cartographer/build

    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/sonic-cartographer

    # Clean up
    rm /tmp/sonic-cartographer-frontend.tar.gz

    # Reload Nginx
    sudo systemctl reload nginx

    echo "Deployment complete!"
ENDSSH

# Clean up local tarball
rm sonic-cartographer-frontend.tar.gz

print_success "Deployment completed successfully!"
print_info "Frontend is now live at http://${REMOTE_HOST}"
