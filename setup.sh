#!/bin/bash

# Installation depuis GitHub - Générateur de Carrousels
# Auteur: Frédéric Dedobbeleer - FDWeb

set -e

REPO_URL="https://github.com/FDWeb-pro/carrousel-gdn.git"
INSTALL_DIR="/opt/carrousel-gdn"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Installation depuis GitHub - Générateur de Carrousels   ║"
echo "║                                                            ║"
echo "║   Installation automatique depuis le dépôt GitHub         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Fonction pour générer un mot de passe aléatoire
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Fonction pour générer un secret JWT
generate_jwt_secret() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-48
}

# Vérifier que Git est installé
if ! command -v git &> /dev/null; then
    echo "📦 Installation de Git..."
    sudo apt-get update
    sudo apt-get install -y git
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "📦 Installation de Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Vérifier que pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installation de pnpm..."
    sudo npm install -g pnpm
fi

# Vérifier que MySQL est installé
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL n'est pas installé."
    read -p "Voulez-vous installer MySQL localement ? (o/n) : " install_mysql
    if [[ "$install_mysql" == "o" || "$install_mysql" == "O" ]]; then
        echo "📦 Installation de MySQL..."
        sudo apt-get update
        sudo apt-get install -y mysql-server
        sudo systemctl start mysql
        sudo systemctl enable mysql
        echo "✅ MySQL installé et démarré"
    fi
fi

echo "✅ Tous les prérequis sont installés"
echo ""

# Configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "1️⃣  Votre email (pour les notifications) : " USER_EMAIL
read -p "2️⃣  Nom de votre organisation : " ORG_NAME

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration MySQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Hôte MySQL (défaut: localhost) : " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "Port MySQL (défaut: 3306) : " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -p "Nom de la base de données (défaut: carrousel_gdn) : " DB_NAME
DB_NAME=${DB_NAME:-carrousel_gdn}

read -p "Utilisateur MySQL : " DB_USER
read -sp "Mot de passe MySQL : " DB_PASSWORD
echo ""

# Génération des secrets
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Génération des secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

JWT_SECRET=$(generate_jwt_secret)
echo "✅ Secret JWT généré"

# Clonage du dépôt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Clonage du dépôt GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  Le répertoire $INSTALL_DIR existe déjà."
    read -p "Voulez-vous le supprimer et réinstaller ? (o/n) : " remove_dir
    if [[ "$remove_dir" == "o" || "$remove_dir" == "O" ]]; then
        sudo rm -rf "$INSTALL_DIR"
    else
        echo "❌ Installation annulée"
        exit 1
    fi
fi

echo "📥 Clonage depuis GitHub..."
sudo git clone "$REPO_URL" "$INSTALL_DIR"

# Création du fichier .env
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration de l'application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${DB_NAME}"

sudo tee "$INSTALL_DIR/.env" > /dev/null <<EOF
# Configuration de la base de données
DATABASE_URL=${DATABASE_URL}

# Secrets de sécurité
JWT_SECRET=${JWT_SECRET}

# Configuration OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Informations du propriétaire
OWNER_NAME=${ORG_NAME}
OWNER_EMAIL=${USER_EMAIL}

# Configuration de l'application
VITE_APP_TITLE=Générateur de Carrousels
VITE_APP_LOGO=/logo.png
NODE_ENV=production
PORT=3000
EOF

echo "✅ Fichier .env créé"

# Installation des dépendances
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installation des dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$INSTALL_DIR"
sudo pnpm install

# Build de l'application
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Build de l'application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo pnpm build

# Migration de la base de données
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Migration de la base de données"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo pnpm db:push

# Création du service systemd
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Création du service systemd"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo tee /etc/systemd/system/carrousel-gdn.service > /dev/null <<EOF
[Unit]
Description=Générateur de Carrousels
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable carrousel-gdn
sudo systemctl start carrousel-gdn

# Affichage des informations finales
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ INSTALLATION RÉUSSIE !                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Votre Générateur de Carrousels est maintenant en ligne !"
echo ""
echo "🌐 URL : http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📝 Informations de configuration :"
echo "   - Organisation : $ORG_NAME"
echo "   - Email : $USER_EMAIL"
echo "   - Base de données : $DB_NAME"
echo ""
echo "🔧 Commandes utiles :"
echo "   - Voir les logs : sudo journalctl -u carrousel-gdn -f"
echo "   - Redémarrer : sudo systemctl restart carrousel-gdn"
echo "   - Arrêter : sudo systemctl stop carrousel-gdn"
echo "   - Statut : sudo systemctl status carrousel-gdn"
echo ""
echo "📚 Documentation : $INSTALL_DIR/README.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
