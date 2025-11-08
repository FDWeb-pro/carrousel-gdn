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


## Diagnostic problème SMTP
- [x] Vérifier la récupération de la configuration SMTP depuis la base de données
- [x] Vérifier que la configuration est bien sauvegardée
- [x] Ajouter des logs pour diagnostiquer le problème
- [ ] Créer une route de test pour vérifier la configuration SMTP


## Correction bug envoi d'email
- [x] Ajouter des logs détaillés dans la fonction sendEmail
- [x] Vérifier la configuration de nodemailer
- [x] Tester l'envoi d'email avec un serveur SMTP fonctionnel (✅ FONCTIONNE)
- [ ] Corriger le bug qui empêche l'envoi d'email dans l'application


## Améliorations de l'interface Générateur
- [x] Créer une barre d'actions fixe en haut de la page (sticky header)
- [x] Déplacer tous les boutons dans cette barre fixe
- [x] Ajouter un compteur de slides (1/8, 2/8... 8/8) sur le bouton "Ajouter une slide"
- [x] Ajouter un bouton "Reset carrousel" pour réinitialiser
- [x] Modifier "Envoyer et Télécharger" pour qu'il enregistre automatiquement avant d'envoyer
- [x] Copier les images des types de slides dans le projet
- [x] Afficher un aperçu image dans chaque encadré de slide selon son type

## Améliorations de la page Types de Slides
- [x] Ajouter un champ d'upload d'image pour chaque type de slide
- [x] Stocker les images uploadées dans S3
- [x] Afficher les miniatures des slides existantes
- [x] Rendre la slide titre visible et modifiable (mais pas supprimable)
- [x] Rendre la slide finale visible et modifiable (mais pas supprimable)

## Améliorations de la page Historique d'Audit
- [x] Ajouter un bouton d'export de l'historique (CSV ou Excel)
- [x] Ajouter un bouton de remise à zéro de l'historique
- [x] Ajouter une confirmation avant la remise à zéro

## Nettoyage
- [x] Supprimer la page Test Configuration SMTP
- [x] Supprimer les fichiers de test inutiles
- [x] Nettoyer les routes de test dans routers.ts


## Corrections urgentes
- [x] Ajouter les boutons d'export et remise à zéro dans la page Historique d'audit
- [x] Vérifier et restaurer les 5 types de slides manquants dans la base de données
