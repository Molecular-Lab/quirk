# Deploy Telegram Bot to AWS EC2

## Quick Start

### 1. Launch EC2 Instance

- Instance type: **t3.micro** (~$7/month)
- AMI: Amazon Linux 2023
- Security group: Allow SSH (port 22)
- Storage: 8GB

### 2. Install Docker on EC2

```bash
ssh -i your-key.pem ec2-user@<EC2_IP>

# Install Docker
sudo yum update -y
sudo yum install docker git -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in
exit
```

### 3. Deploy Bot

```bash
ssh -i your-key.pem ec2-user@<EC2_IP>

# Clone repo
git clone https://github.com/WTCHAI/laac.git
cd laac/server/apps/defai-telegram-bot

# Setup environment
cp .env.example .env
nano .env  # Edit with your values

# Start bot
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### 4. Configure .env

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
DEFAI_SERVER_API_URL=https://your-api-server.com
DEFAI_SERVER_API_KEY=your_secure_api_key
DEBUG=false
```

### 5. Auto-restart on Reboot

```bash
sudo tee /etc/systemd/system/telegram-bot.service > /dev/null <<EOF
[Unit]
Description=DeFAI Telegram Bot
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/laac/server/apps/defai-telegram-bot
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update (after git pull)
docker-compose down
docker-compose up -d --build

# Check status
docker-compose ps
```

## Update Bot

```bash
cd ~/laac
git pull
cd server/apps/defai-telegram-bot
docker-compose down
docker-compose up -d --build
```
