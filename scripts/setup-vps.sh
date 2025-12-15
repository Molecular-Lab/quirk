#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_info "Starting Proxify VPS setup..."

# Update system
print_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install basic tools
print_info "Installing basic tools..."
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Add current user to docker group
    usermod -aG docker ${SUDO_USER:-$USER}

    # Enable and start Docker
    systemctl enable docker
    systemctl start docker
else
    print_warning "Docker is already installed"
fi

# Install Docker Compose
print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="2.23.3"
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    print_warning "Docker Compose is already installed"
fi

# Install Node.js (for running migrations and scripts)
print_info "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
else
    print_warning "Node.js is already installed"
fi

# Install pnpm
print_info "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@10.18.3
else
    print_warning "pnpm is already installed"
fi

# Install PostgreSQL client (for database operations)
print_info "Installing PostgreSQL client..."
apt-get install -y postgresql-client

# Install golang-migrate (for database migrations)
print_info "Installing golang-migrate..."
if ! command -v migrate &> /dev/null; then
    curl -L https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.tar.gz | tar xvz
    mv migrate /usr/local/bin/migrate
    chmod +x /usr/local/bin/migrate
else
    print_warning "golang-migrate is already installed"
fi

# Setup firewall
print_info "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Frontend
ufw allow 8080/tcp  # API
ufw reload

# Setup fail2ban
print_info "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
print_info "Creating application directory..."
APP_DIR="/opt/proxify"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/backups
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/nginx/ssl

# Set permissions
chown -R ${SUDO_USER:-$USER}:${SUDO_USER:-$USER} $APP_DIR

# Create systemd service for auto-start
print_info "Creating systemd service..."
cat > /etc/systemd/system/proxify.service <<EOF
[Unit]
Description=Proxify Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/proxify
ExecStart=/usr/bin/docker-compose -f docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable proxify

# Install Nginx for SSL termination (optional)
print_info "Installing Nginx..."
apt-get install -y nginx certbot python3-certbot-nginx

# Create nginx site config
cat > /etc/nginx/sites-available/proxify <<'EOF'
upstream api {
    server localhost:8080;
}

upstream web {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Setup swap (for low memory VPS)
print_info "Setting up swap space..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Optimize swap usage
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
    sysctl -p
else
    print_warning "Swap file already exists"
fi

# Install monitoring tools (optional)
print_info "Installing monitoring tools..."
# Netdata for system monitoring
if ! command -v netdata &> /dev/null; then
    bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --disable-telemetry
fi

# Create deployment user (optional)
print_info "Creating deployment user..."
DEPLOY_USER="deploy"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG docker $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER

    # Setup SSH for deployment user
    mkdir -p /home/$DEPLOY_USER/.ssh
    touch /home/$DEPLOY_USER/.ssh/authorized_keys
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh

    print_warning "Remember to add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
else
    print_warning "Deployment user already exists"
fi

# Create .env template
print_info "Creating environment template..."
cat > $APP_DIR/.env.example <<'EOF'
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=proxify
DB_SSL_MODE=prefer

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# API Configuration
NODE_ENV=production
PORT=8080
API_URL=https://api.your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Frontend Configuration
VITE_API_URL=https://api.your-domain.com

# Privy Auth
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Blockchain RPC
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key
ALCHEMY_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
LANGSMITH_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=your_project_name

# Docker Registry (for private images)
DOCKER_REGISTRY=ghcr.io
GITHUB_SHA=latest
EOF

print_info "Setup complete!"
print_info "Next steps:"
echo "1. Copy your .env file to $APP_DIR/.env"
echo "2. Copy docker-compose.production.yml to $APP_DIR/docker-compose.yml"
echo "3. Configure your domain in /etc/nginx/sites-available/proxify"
echo "4. Enable the nginx site: ln -s /etc/nginx/sites-available/proxify /etc/nginx/sites-enabled/"
echo "5. Get SSL certificate: certbot --nginx -d your-domain.com"
echo "6. Add SSH key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "7. Run deployment: cd $APP_DIR && docker-compose up -d"

print_warning "Remember to:"
echo "- Change all default passwords in .env"
echo "- Configure your DNS to point to this server"
echo "- Set up regular backups"
echo "- Monitor disk space and system resources"