# TODO - Générateur de Carrousels GdN

## Authentification et Gestion des Rôles
- [x] Créer le schéma de base de données avec 3 types de rôles (super_admin, admin, membre)
- [x] Implémenter la procédure d'authentification avec gestion des rôles
- [x] Créer la page de connexion protégeant l'accès à l'application
- [x] Configurer le compte super admin initial

## Interface d'Administration
- [x] Créer le layout du panneau d'administration
- [x] Implémenter la gestion des utilisateurs (CRUD)
- [x] Implémenter la gestion des rôles et permissions
- [x] Créer l'interface de configuration des types de slides
- [x] Ajouter la possibilité de créer des comptes super admin, admin et membre

## Générateur de Carrousels
- [x] Intégrer le composant TSX existant pour le formulaire de création
- [x] Adapter le formulaire pour fonctionner avec la base de données
- [x] Implémenter la sauvegarde des carrousels en base de données
- [x] Implémenter la génération du fichier Excel selon le modèle
- [x] Ajouter la validation des données (minimum 2 slides intermédiaires)
- [x] Implémenter l'historique des carrousels créés

## Fonctionnalité d'Export et Email
- [x] Implémenter l'export Excel avec la structure correcte (10 slides)
- [x] Configurer le service d'envoi d'email
- [x] Créer l'interface pour spécifier l'adresse email de destination
- [x] Implémenter l'envoi du fichier Excel par email

## Interface Utilisateur
- [x] Créer la page d'accueil pour les membres (accès au générateur)
- [x] Créer le tableau de bord admin
- [x] Implémenter la navigation entre les différentes sections
- [x] Ajouter les messages de confirmation et erreurs

## Tests et Finalisation
- [x] Tester le flux complet d'authentification
- [x] Tester la création et l'export de carrousels
- [x] Tester l'envoi d'email
- [x] Vérifier les permissions selon les rôles
- [x] Documentation utilisateur

## Configuration SMTP (à implémenter)
- [ ] Créer une table de configuration pour les paramètres SMTP
- [ ] Créer une page d'administration pour gérer les paramètres SMTP
- [ ] Permettre aux admins de configurer SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE


## Nouvelles Fonctionnalités - Validation et CRUD
- [x] Ajouter un champ "status" (pending/approved/rejected) dans la table users
- [x] Modifier l'inscription pour mettre les nouveaux utilisateurs en "pending" par défaut
- [x] Créer l'interface de validation des demandes d'accès dans le panneau admin
- [x] Ajouter CRUD complet pour les carrousels (édition, suppression) pour les admins
- [x] Ajouter CRUD complet pour les types de slides (création, suppression)
- [x] Bloquer l'accès à l'application pour les utilisateurs en statut "pending"
- [x] Ajouter des notifications pour les demandes en attente


## Fonctionnalités Avancées
- [x] Créer une table de configuration pour les paramètres SMTP
- [x] Créer une page admin pour gérer la configuration SMTP
- [x] Créer une table pour les notifications
- [x] Implémenter le système de notifications pour les demandes d'accès
- [x] Ajouter un badge de compteur dans le menu pour les notifications
- [x] Créer une table d'audit pour l'historique des actions
- [x] Implémenter le logging des actions importantes
- [x] Créer une page admin pour consulter l'historique d'audit


## Corrections de bugs
- [x] Corriger le statut par défaut des nouveaux utilisateurs (doit être "pending")
- [x] Créer une page d'attente pour les utilisateurs pending au lieu d'une erreur 403
- [x] Créer des notifications pour les admins lors de nouvelles inscriptions


## Restrictions de permissions
- [x] Restreindre l'accès SMTP uniquement aux super_admin
- [x] Empêcher les admins de modifier le rôle des super_admin
- [x] Empêcher les admins de supprimer des super_admin


## Modifications d'interface
- [x] Retirer le champ "Email de destination" de la page générateur
- [x] Ajouter un champ "Email de destination" dans les paramètres SMTP
- [x] Ajouter un bouton "Envoyer et Télécharger" dans le générateur
- [x] Implémenter la logique d'envoi automatique à l'adresse SMTP configurée


## Correction bug envoi email
- [x] Corriger la validation Zod pour accepter undefined au lieu de chaîne vide dans emailTo
