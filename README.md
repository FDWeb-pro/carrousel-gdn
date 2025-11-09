# Générateur de Carrousels

**Version 1.0 - Novembre 2025**

Application web professionnelle pour créer et gérer des carrousels de contenus destinés aux réseaux sociaux et plateformes numériques.

---

## 🎯 Fonctionnalités

### Pour les utilisateurs

- **Création intuitive** : Interface simple pour créer des carrousels en quelques clics
- **Types de slides variés** : 3 modèles de slides intermédiaires personnalisables
- **Export multi-format** : Téléchargement Excel et envoi par email automatique
- **Historique complet** : Consultation et réutilisation des carrousels précédents
- **Aide intégrée** : Documentation et ressources d'aide accessibles

### Pour les administrateurs

- **Personnalisation de marque** : Logo, nom d'organisation, description personnalisables
- **Configuration flexible** : Nombre de slides min/max ajustable (2-100)
- **Gestion des utilisateurs** : Contrôle des accès et rôles (admin/utilisateur)
- **Configuration SMTP** : Envoi d'emails personnalisé
- **Types de slides personnalisables** : Création et gestion des modèles de slides
- **Gestion de l'aide** : Upload de fichiers manuels et liens vers ressources
- **Audit complet** : Traçabilité de toutes les actions utilisateurs

---

## 🚀 Installation

### Installation Express (Recommandée)

```bash
# Télécharger le script d'installation
curl -fsSL https://raw.githubusercontent.com/VOTRE_USERNAME/carrousel-gdn/main/install-from-github.sh -o install.sh

# Lancer l'installation
chmod +x install.sh && sudo ./install.sh
```

**Temps d'installation : 10-15 minutes**

Le script installe automatiquement tous les prérequis et configure l'application.

### Installation Docker

```bash
git clone https://github.com/VOTRE_USERNAME/carrousel-gdn.git
cd carrousel-gdn
docker compose up -d
```

### Documentation complète

- [Guide d'installation depuis GitHub](GUIDE_GITHUB_INSTALL.md)
- [Guide de déploiement](docs/DEPLOIEMENT.md)
- [Installation pour les nuls](INSTALLATION_POUR_LES_NULS.md)
- [Installation sur Hostinger](INSTALLATION_HOSTINGER.md)

---

## 📋 Prérequis

### Serveur

- **OS** : Ubuntu 20.04+ ou Debian 11+
- **RAM** : Minimum 2 GB (4 GB recommandé)
- **Disque** : Minimum 10 GB
- **CPU** : 1 vCPU minimum (2 vCPU recommandé)

### Logiciels

- **Node.js** : 20.x
- **pnpm** : 8.x
- **MySQL** : 8.0+ ou TiDB compatible
- **Git** : 2.x

Le script d'installation installe automatiquement tous ces prérequis.

---

## 🛠️ Stack technique

### Frontend

- **React 19** : Framework UI moderne
- **TypeScript** : Typage statique
- **Tailwind CSS 4** : Styling utility-first
- **shadcn/ui** : Composants UI accessibles
- **Wouter** : Routing léger
- **TanStack Query** : Gestion d'état serveur
- **Vite** : Build tool rapide

### Backend

- **Node.js 20** : Runtime JavaScript
- **Express 4** : Framework web
- **tRPC 11** : API type-safe
- **Drizzle ORM** : ORM TypeScript
- **MySQL/TiDB** : Base de données relationnelle
- **Manus OAuth** : Authentification sécurisée

### DevOps

- **Docker** : Conteneurisation
- **GitHub Actions** : CI/CD automatique
- **systemd** : Gestion de service
- **Nginx** : Reverse proxy (optionnel)

---

## 📁 Structure du projet

```
carrousel-gdn/
├── client/                 # Application frontend
│   ├── public/            # Assets statiques
│   ├── src/
│   │   ├── pages/         # Pages de l'application
│   │   ├── components/    # Composants réutilisables
│   │   ├── hooks/         # Hooks personnalisés
│   │   └── lib/           # Utilitaires et configuration
├── server/                 # Application backend
│   ├── _core/             # Infrastructure (OAuth, tRPC, etc.)
│   ├── db.ts              # Fonctions de base de données
│   ├── routers.ts         # Routes tRPC
│   └── email.ts           # Gestion des emails
├── drizzle/               # Schéma et migrations DB
│   └── schema.ts          # Définition des tables
├── shared/                # Code partagé client/server
├── docs/                  # Documentation
├── .github/workflows/     # GitHub Actions CI/CD
└── docker-compose.yml     # Configuration Docker
```

---

## 🔧 Développement

### Cloner le dépôt

```bash
git clone https://github.com/VOTRE_USERNAME/carrousel-gdn.git
cd carrousel-gdn
```

### Installer les dépendances

```bash
pnpm install
```

### Configurer l'environnement

Créez un fichier `.env` à la racine :

```env
DATABASE_URL=mysql://user:password@localhost:3306/carrousel_gdn
JWT_SECRET=votre_secret_jwt_aleatoire
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_TITLE=Générateur de Carrousels
VITE_APP_LOGO=/logo.png
```

### Initialiser la base de données

```bash
pnpm db:push
```

### Lancer en mode développement

```bash
pnpm dev
```

L'application est accessible sur http://localhost:3000

### Build pour la production

```bash
pnpm build
```

### Lancer les tests

```bash
pnpm test
```

---

## 📚 Documentation

### Pour les utilisateurs

- [Manuel utilisateur](Manuel_Utilisateur.md)
- [Guide de démarrage rapide](DEMARRAGE_RAPIDE.md)

### Pour les administrateurs

- [Manuel administrateur](Manuel_Administrateur.md)
- [Guide de configuration](docs/CONFIGURATION.md)

### Pour les développeurs

- [Guide de contribution](CONTRIBUTING.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)

### Installation et déploiement

- [Installation depuis GitHub](GUIDE_GITHUB_INSTALL.md)
- [Pousser le code sur GitHub](GUIDE_GITHUB_PUSH.md)
- [Guide de déploiement](docs/DEPLOIEMENT.md)
- [Installation Hostinger](INSTALLATION_HOSTINGER.md)
- [Installation Docker](carrousel-docker/README.md)

---

## 🔄 Mises à jour

### Mettre à jour l'application

```bash
cd /opt/carrousel-gdn
sudo git pull
sudo pnpm install
sudo pnpm build
sudo systemctl restart carrousel-gdn
```

### Voir les changements

```bash
git log --oneline -10
```

### Revenir à une version précédente

```bash
git checkout v1.0.0
sudo pnpm install
sudo pnpm build
sudo systemctl restart carrousel-gdn
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

---

## 🐛 Signaler un bug

Si vous trouvez un bug, veuillez [ouvrir une issue](https://github.com/VOTRE_USERNAME/carrousel-gdn/issues) avec :

- Une description claire du problème
- Les étapes pour reproduire
- Le comportement attendu
- Le comportement actuel
- Des captures d'écran si pertinent
- Votre environnement (OS, version Node.js, etc.)

---

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

© 2025 Frédéric Dedobbeleer - FDWeb - Guichet du Numérique

---

## 📧 Support

**Support technique** :
- Email : f.dedobbeleer@dwebformation.be
- Site web : https://www.fdweb.be

**Guichet du Numérique** :
- Site web : https://www.guichetdunumerique.be
- Email : contact@guichetdunumerique.be

---

## 🙏 Remerciements

- [React](https://react.dev) - Framework UI
- [tRPC](https://trpc.io) - API type-safe
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com) - Composants UI
- [Drizzle ORM](https://orm.drizzle.team) - ORM TypeScript
- [Manus](https://manus.im) - Plateforme de développement

---

## 🌟 Fonctionnalités à venir

- [ ] Templates de carrousels réutilisables
- [ ] Export PDF des carrousels
- [ ] Prévisualisation visuelle avant export
- [ ] Statistiques d'utilisation
- [ ] API publique pour intégrations
- [ ] Application mobile (iOS/Android)
- [ ] Intégration directe avec les réseaux sociaux
- [ ] Collaboration en temps réel

---

**Réalisé par Frédéric Dedobbeleer - FDWeb - Guichet du Numérique**

[![Website](https://img.shields.io/badge/Website-fdweb.be-blue)](https://www.fdweb.be)
[![Email](https://img.shields.io/badge/Email-f.dedobbeleer%40dwebformation.be-red)](mailto:f.dedobbeleer@dwebformation.be)
[![GdN](https://img.shields.io/badge/Guichet%20du%20Num%C3%A9rique-guichetdunumerique.be-green)](https://www.guichetdunumerique.be)
