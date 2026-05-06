#!/bin/bash
# ============================================================
# ORHUN AI — Oracle ARM Server Setup Script
# Bu skriptni Oracle server'da ishga tushiring:
#   chmod +x setup-oracle.sh
#   ./setup-oracle.sh
# ============================================================

set -e  # xato bo'lsa to'xtash

echo "🚀 Orhun AI Backend setup boshlanmoqda..."
echo ""

# ============================================================
# 1) Tizimni yangilash
# ============================================================
echo "📦 Tizim paketlari yangilanmoqda..."
sudo apt update && sudo apt upgrade -y

# ============================================================
# 2) Asosiy paketlar
# ============================================================
echo "📦 Kerakli paketlar o'rnatilmoqda..."
sudo apt install -y \
    python3 python3-pip python3-venv \
    git \
    nginx \
    certbot python3-certbot-nginx \
    ufw \
    htop \
    build-essential \
    libssl-dev libffi-dev \
    curl wget

# ============================================================
# 3) Firewall sozlash
# ============================================================
echo "🔒 Firewall sozlanmoqda..."
sudo ufw --force enable
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw status

echo ""
echo "⚠️  MUHIM: Oracle Cloud Console'da ham Ingress Rules qo'shing:"
echo "   Networking → VCN → Security Lists → Add rules"
echo "   Ports 80, 443 (TCP) from 0.0.0.0/0"
echo ""

# ============================================================
# 4) Python virtual env va backend o'rnatish
# ============================================================
cd /home/ubuntu/orhun-ai/backend

if [ ! -d "venv" ]; then
    echo "🐍 Python virtual environment yaratilmoqda..."
    python3 -m venv venv
fi

echo "📚 Python paketlar o'rnatilmoqda..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# ============================================================
# 5) .env tekshirish
# ============================================================
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  .env fayl topilmadi!"
    echo "   .env.example ni nusxalab to'ldiring:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    echo ""
    exit 1
fi

# ============================================================
# 6) systemd service o'rnatish
# ============================================================
echo "⚙️  systemd service o'rnatilmoqda..."
sudo cp orhun-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orhun-backend
sudo systemctl restart orhun-backend

sleep 3
sudo systemctl status orhun-backend --no-pager

# ============================================================
# 7) Nginx (ixtiyoriy — domain bo'lsa)
# ============================================================
echo ""
read -p "Domain (masalan: api.orhun-ai.uz) ni hozir sozlaymizmi? [y/N] " setup_nginx
if [[ "$setup_nginx" =~ ^[Yy]$ ]]; then
    read -p "Domain nomi: " domain_name
    sudo sed -i "s/api.orhun-ai.uz/$domain_name/g" nginx-config
    sudo cp nginx-config /etc/nginx/sites-available/orhun-backend
    sudo ln -sf /etc/nginx/sites-available/orhun-backend /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    
    echo ""
    echo "🔐 SSL sertifikat olish..."
    sudo certbot --nginx -d "$domain_name" --non-interactive --agree-tos --email admin@"$domain_name"
fi

# ============================================================
# Tugadi
# ============================================================
echo ""
echo "✅ Setup tugadi!"
echo ""
echo "Tekshirish:"
echo "  Health: curl http://localhost:8000/health"
echo "  Logs:   sudo journalctl -u orhun-backend -f"
echo "  Status: sudo systemctl status orhun-backend"
echo ""
