#!/bin/bash

# Installation depuis GitHub - Générateur de Carrousels
# Auteur: Frédéric Dedobbeleer - FDWeb

set -e

REPO_URL="https://github.com/VOTRE_USERNAME/carrousel-gdn.git"
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
    read -p "Voulez-vous installer MySQL automatiquement ? (o/n): " install_mysql
    
    if [ "$install_mysql" = "o" ] || [ "$install_mysql" = "O" ]; then
        echo "📦 Installation de MySQL..."
        sudo apt-get update
        sudo apt-get install -y mysql-server
        sudo systemctl start mysql
        sudo systemctl enable mysql
    else
        echo "❌ MySQL est requis. Installez-le d'abord."
        exit 1
    fi
fi

echo "✅ Tous les prérequis sont installés"
echo ""

# Questions de configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Email
read -p "1️⃣  Votre email (pour les notifications) : " admin_email
while [[ ! "$admin_email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; do
    echo "   ⚠️  Email invalide. Réessayez."
    read -p "1️⃣  Votre email : " admin_email
done

# Nom de l'organisation
read -p "2️⃣  Nom de votre organisation : " org_name
if [ -z "$org_name" ]; then
    org_name="Mon Entreprise"
fi

# Configuration MySQL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration MySQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Hôte MySQL (défaut: localhost) : " mysql_host
mysql_host=${mysql_host:-localhost}

read -p "Port MySQL (défaut: 3306) : " mysql_port
mysql_port=${mysql_port:-3306}

read -p "Nom de la base de données (défaut: carrousel_gdn) : " mysql_database
mysql_database=${mysql_database:-carrousel_gdn}

read -p "Utilisateur MySQL : " mysql_user
read -sp "Mot de passe MySQL : " mysql_password
echo ""

# Générer les secrets
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Génération des secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

jwt_secret=$(generate_jwt_secret)
echo "✅ Secret JWT généré"

# Cloner le dépôt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Clonage du dépôt GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  Le répertoire $INSTALL_DIR existe déjà."
    read -p "Voulez-vous le supprimer et réinstaller ? (o/n): " reinstall
    
    if [ "$reinstall" = "o" ] || [ "$reinstall" = "O" ]; then
        sudo rm -rf "$INSTALL_DIR"
    else
        echo "❌ Installation annulée."
        exit 1
    fi
fi

echo "📥 Clonage depuis GitHub..."
sudo git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Créer le fichier .env
echo ""
echo "📝 Création du fichier de configuration..."

DATABASE_URL="mysql://${mysql_user}:${mysql_password}@${mysql_host}:${mysql_port}/${mysql_database}"

sudo tee .env > /dev/null << EOF
# Configuration générée automatiquement le $(date)

# Base de données
DATABASE_URL=$DATABASE_URL

# Sécurité
JWT_SECRET=$jwt_secret

# OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=

# Application
VITE_APP_TITLE=$org_name
VITE_APP_LOGO=/logo.png

# Propriétaire (sera défini au premier login)
OWNER_NAME=
OWNER_OPEN_ID=
EOF

echo "✅ Configuration créée"

# Installer les dépendances
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installation des dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo pnpm install

# Initialiser la base de données
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Initialisation de la base de données"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Créer la base de données si elle n'existe pas
mysql -h "$mysql_host" -P "$mysql_port" -u "$mysql_user" -p"$mysql_password" -e "CREATE DATABASE IF NOT EXISTS $mysql_database;"

# Pousser le schéma
sudo pnpm db:push

# Build de l'application
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Build de l'application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo pnpm build

# Créer le service systemd
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuration du service systemd"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo tee /etc/systemd/system/carrousel-gdn.service > /dev/null << EOF
[Unit]
Description=Générateur de Carrousels GdN
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node $INSTALL_DIR/server/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable carrousel-gdn
sudo systemctl start carrousel-gdn

# Attendre que le service démarre
echo "⏳ Attente du démarrage du service..."
sleep 5

# Vérifier que le service est démarré
if sudo systemctl is-active --quiet carrousel-gdn; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                  ✅ INSTALLATION RÉUSSIE !                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 Votre Générateur de Carrousels est maintenant en ligne !"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Accéder à l'application"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  🌐 URL : http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Commandes utiles"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Voir les logs       : sudo journalctl -u carrousel-gdn -f"
    echo "  Arrêter             : sudo systemctl stop carrousel-gdn"
    echo "  Redémarrer          : sudo systemctl restart carrousel-gdn"
    echo "  Vérifier le statut  : sudo systemctl status carrousel-gdn"
    echo ""
    echo "  Mettre à jour       : cd $INSTALL_DIR && sudo git pull && sudo pnpm install && sudo pnpm build && sudo systemctl restart carrousel-gdn"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📧 Support : f.dedobbeleer@dwebformation.be"
    echo "🌐 Site web : https://www.fdweb.be"
    echo ""
else
    echo ""
    echo "❌ Erreur : Le service n'a pas démarré correctement"
    echo ""
    echo "Consultez les logs pour plus d'informations :"
    echo "  sudo journalctl -u carrousel-gdn -n 50"
    echo ""
    echo "Ou contactez le support : f.dedobbeleer@dwebformation.be"
    exit 1
fi
