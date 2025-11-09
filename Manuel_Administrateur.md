# Manuel Administrateur - Générateur de Carrousels GdN

**Version 1.0 - Janvier 2025**

**Auteur : Manus AI**

---

## Table des matières

1. [Introduction](#introduction)
2. [Rôles et permissions](#rôles-et-permissions)
3. [Accès à l'interface d'administration](#accès-à-linterface-dadministration)
4. [Gestion des utilisateurs](#gestion-des-utilisateurs)
5. [Configuration des types de slides](#configuration-des-types-de-slides)
6. [Configuration SMTP](#configuration-smtp)
7. [Configuration de l'intelligence artificielle](#configuration-de-lintelligence-artificielle)
8. [Historique d'audit](#historique-daudit)
9. [Consultation de l'historique des carrousels](#consultation-de-lhistorique-des-carrousels)
10. [Bonnes pratiques](#bonnes-pratiques)

---

## Introduction

Le Générateur de Carrousels GdN est une application web permettant de créer des carrousels de présentation pour le Guichet du Numérique. Cette application offre deux niveaux d'administration distincts avec des permissions spécifiques pour assurer une gestion efficace et sécurisée de la plateforme.

Ce manuel s'adresse aux administrateurs de l'application et couvre l'ensemble des fonctionnalités d'administration disponibles. Il est conçu pour vous guider dans la configuration initiale, la gestion quotidienne des utilisateurs et du contenu, ainsi que dans la maintenance de la plateforme.

### Public cible

Ce manuel est destiné aux profils suivants :

**Super administrateurs** : Ils disposent de tous les droits d'administration, y compris la configuration des types de slides, la configuration SMTP, la configuration de l'intelligence artificielle, et la gestion complète des utilisateurs.

**Administrateurs** : Ils peuvent gérer les utilisateurs, consulter l'historique des carrousels et l'historique d'audit, mais n'ont pas accès aux configurations système avancées.

---

## Rôles et permissions

L'application distingue trois niveaux d'accès avec des permissions spécifiques pour chaque rôle.

### Tableau récapitulatif des permissions

| Fonctionnalité | Super Admin | Admin | Utilisateur |
|---|---|---|---|
| Créer des carrousels | ✓ | ✓ | ✓ |
| Consulter l'historique personnel | ✓ | ✓ | ✓ |
| Modifier son profil | ✓ | ✓ | ✓ |
| Consulter tous les carrousels | ✓ | ✓ | ✗ |
| Gérer les utilisateurs | ✓ | ✓ | ✗ |
| Consulter l'historique d'audit | ✓ | ✓ | ✗ |
| Configurer les types de slides | ✓ | ✗ | ✗ |
| Configurer SMTP | ✓ | ✗ | ✗ |
| Configurer l'IA | ✓ | ✗ | ✗ |

### Description des rôles

**Super administrateur** : Le super administrateur possède tous les droits sur l'application. Il est responsable de la configuration système, de la gestion des types de slides, de la configuration des services externes (SMTP, IA), et de la supervision générale de la plateforme. Le propriétaire du projet est automatiquement désigné comme super administrateur lors de la création de l'application.

**Administrateur** : L'administrateur gère les aspects opérationnels de l'application. Il peut créer, modifier et supprimer des comptes utilisateurs, consulter l'ensemble des carrousels créés sur la plateforme, et accéder à l'historique d'audit pour suivre les actions importantes. Il ne peut pas modifier les configurations système.

**Utilisateur** : L'utilisateur standard peut créer des carrousels, consulter son propre historique, et modifier son profil personnel. Il n'a pas accès aux fonctionnalités d'administration.

---

## Accès à l'interface d'administration

L'interface d'administration est accessible via le menu de navigation latéral après connexion avec un compte administrateur.

### Connexion à l'application

Pour accéder à l'application, rendez-vous sur l'URL de votre instance et cliquez sur le bouton de connexion. L'authentification s'effectue via le système OAuth de Manus, qui prend en charge les comptes Google, Microsoft et autres fournisseurs d'identité.

Lors de votre première connexion, votre compte est automatiquement créé dans l'application. Si vous êtes le propriétaire du projet, vous recevez automatiquement le rôle de super administrateur. Les autres utilisateurs reçoivent le rôle d'utilisateur standard par défaut.

### Navigation dans l'interface

Une fois connecté, l'interface présente un menu de navigation latéral sur la gauche de l'écran. Les options disponibles dépendent de votre rôle.

Pour les **super administrateurs**, le menu affiche les options suivantes : Générateur (création de carrousels), Historique (consultation de tous les carrousels), Utilisateurs (gestion des comptes), Types de Slides (configuration des modèles), Configuration SMTP (paramétrage de l'envoi d'emails), Configuration IA (paramétrage de l'intelligence artificielle), et Historique d'audit (consultation des logs).

Pour les **administrateurs**, le menu affiche : Générateur, Historique, Utilisateurs, et Historique d'audit. Les options de configuration système ne sont pas disponibles.

Le menu utilisateur, accessible en cliquant sur votre nom en bas du menu latéral, permet d'accéder à votre profil personnel et de vous déconnecter.

---

## Gestion des utilisateurs

La gestion des utilisateurs est une fonctionnalité centrale de l'administration. Elle permet de contrôler qui peut accéder à l'application et avec quels droits.

### Accès à la page de gestion

Pour accéder à la gestion des utilisateurs, cliquez sur "Utilisateurs" dans le menu de navigation latéral. La page affiche un tableau listant tous les utilisateurs enregistrés dans l'application avec leurs informations principales : nom, email, rôle, statut, et date de dernière connexion.

### Recherche et filtrage

La page de gestion des utilisateurs propose des outils de recherche et de filtrage pour faciliter la navigation dans une liste potentiellement longue d'utilisateurs.

**Barre de recherche** : Située en haut de la page, elle permet de rechercher un utilisateur par son nom ou son adresse email. La recherche s'effectue en temps réel au fur et à mesure de la saisie.

**Filtres** : Trois filtres sont disponibles pour affiner l'affichage. Le filtre par rôle permet de n'afficher que les super administrateurs, les administrateurs, ou les utilisateurs standard. Le filtre par statut permet de filtrer par statut actif, bloqué, en attente, ou rejeté. Le bouton "Réinitialiser les filtres" permet de revenir à l'affichage complet de la liste.

### Modification du rôle d'un utilisateur

Pour modifier le rôle d'un utilisateur, localisez l'utilisateur dans la liste et cliquez sur le menu déroulant dans la colonne "Rôle". Sélectionnez le nouveau rôle souhaité parmi les options disponibles : Super Admin, Admin, ou User. La modification est appliquée immédiatement et l'utilisateur verra ses permissions mises à jour lors de sa prochaine action dans l'application.

**Attention** : La modification du rôle d'un utilisateur est une action sensible. Assurez-vous de bien comprendre les implications avant de promouvoir un utilisateur au rang d'administrateur ou de super administrateur.

### Blocage et déblocage d'utilisateurs

Le système de blocage permet de suspendre temporairement l'accès d'un utilisateur sans supprimer son compte ni ses données.

**Bloquer un utilisateur** : Pour bloquer un utilisateur, cliquez sur le bouton "Bloquer" dans la ligne correspondante. Une confirmation vous sera demandée. Une fois bloqué, l'utilisateur ne pourra plus se connecter à l'application. Ses carrousels et données restent intacts dans la base de données.

**Débloquer un utilisateur** : Pour débloquer un utilisateur, cliquez sur le bouton "Débloquer" dans la ligne correspondante. L'utilisateur pourra à nouveau se connecter immédiatement.

Le blocage est utile dans les situations suivantes : suspension temporaire d'un compte pour des raisons disciplinaires, désactivation d'un compte pendant une période d'absence prolongée, ou blocage préventif en cas de suspicion d'activité anormale.

### Suppression d'utilisateurs

La suppression d'un utilisateur est une action définitive qui entraîne la suppression de toutes ses données associées.

**Suppression individuelle** : Pour supprimer un utilisateur, cliquez sur le bouton "Supprimer" dans la ligne correspondante. Une confirmation vous sera demandée pour éviter les suppressions accidentelles. La suppression entraîne la suppression en cascade de toutes les données liées : tous les carrousels créés par l'utilisateur, toutes les notifications envoyées à l'utilisateur, et tous les logs d'audit associés à l'utilisateur.

**Suppression groupée** : Pour supprimer plusieurs utilisateurs simultanément, cochez les cases à gauche des utilisateurs concernés. Un bouton "Supprimer la sélection" apparaît en haut de la page. Cliquez sur ce bouton et confirmez l'action. La suppression groupée suit les mêmes règles de suppression en cascade que la suppression individuelle.

**Attention** : La suppression d'un utilisateur est irréversible. Assurez-vous que cette action est nécessaire avant de la confirmer. Privilégiez le blocage pour les suspensions temporaires.

### Gestion des statuts utilisateur

L'application gère quatre statuts différents pour les utilisateurs.

**Actif** : L'utilisateur peut se connecter et utiliser normalement l'application. C'est le statut par défaut pour les nouveaux utilisateurs.

**Bloqué** : L'utilisateur ne peut plus se connecter. Ses données restent intactes et il peut être débloqué à tout moment.

**En attente** : Ce statut est réservé pour une future fonctionnalité de validation des inscriptions. Actuellement non utilisé.

**Rejeté** : Ce statut est réservé pour une future fonctionnalité de validation des inscriptions. Actuellement non utilisé.

---

## Configuration des types de slides

La configuration des types de slides est une fonctionnalité réservée aux super administrateurs. Elle permet de définir les modèles de slides disponibles pour les utilisateurs lors de la création de carrousels.

### Accès à la configuration

Pour accéder à la configuration des types de slides, cliquez sur "Types de Slides" dans le menu de navigation latéral. Cette option n'est visible que pour les super administrateurs.

### Types de slides disponibles

L'application propose sept types de slides prédéfinis, dont deux sont obligatoires et ne peuvent pas être désactivés.

**Slides obligatoires** : La slide "Titre" (page 1) contient la thématique et le titre du carrousel. Elle est toujours présente et ne peut pas être supprimée ni désactivée. La slide "Finale" (page 10) contient les informations de l'expert et l'URL de l'offre. Elle est également toujours présente et ne peut pas être supprimée ni désactivée.

**Slides intermédiaires** : Cinq types de slides intermédiaires sont disponibles pour les pages 2 à 9. Type 1 (Introduction) : Slide d'introduction avec un texte principal et une image. Type 2 (Texte simple) : Slide de contenu textuel avec une image d'accompagnement. Type 3 (Liste à puces) : Slide structurée avec des points clés et une image. Type 4 (Citation) : Slide de citation avec l'auteur de la citation. Type 5 (Chiffre clé) : Slide avec quatre zones de texte et quatre images pour présenter des statistiques ou des données chiffrées.

### Activation et désactivation des types

Pour activer ou désactiver un type de slide intermédiaire, localisez le type dans la liste et utilisez le bouton de basculement "Actif/Inactif". Les types désactivés ne seront pas proposés aux utilisateurs lors de l'ajout d'une nouvelle slide dans le générateur.

**Note importante** : Les slides de type Titre et Finale ne peuvent pas être désactivées car elles sont obligatoires pour la structure du carrousel.

### Modification des images de prévisualisation

Chaque type de slide dispose d'une image de prévisualisation qui aide les utilisateurs à visualiser le rendu final. Les super administrateurs peuvent personnaliser ces images.

Pour modifier l'image de prévisualisation d'un type de slide, cliquez sur le bouton "Changer l'image" à côté de l'aperçu actuel. Sélectionnez une nouvelle image depuis votre ordinateur. Les formats acceptés sont JPG, PNG et GIF. L'image est automatiquement uploadée sur le serveur S3 et remplace l'ancienne image. La nouvelle image sera visible immédiatement dans le générateur pour tous les utilisateurs.

**Recommandations** : Utilisez des images de haute qualité (minimum 800x600 pixels) pour une meilleure lisibilité. Privilégiez des captures d'écran réelles des slides pour donner une représentation fidèle du rendu final. Maintenez une cohérence visuelle entre toutes les images de prévisualisation.

### Recherche et filtrage

La page de configuration propose des outils de recherche et de filtrage similaires à ceux de la gestion des utilisateurs.

**Barre de recherche** : Permet de rechercher un type de slide par son nom ou son type technique.

**Filtre par statut** : Permet d'afficher uniquement les types actifs ou inactifs.

---

## Configuration SMTP

La configuration SMTP est essentielle pour permettre l'envoi automatique des carrousels par email. Cette fonctionnalité est réservée aux super administrateurs.

### Accès à la configuration

Pour accéder à la configuration SMTP, cliquez sur "Configuration SMTP" dans le menu de navigation latéral. Cette option n'est visible que pour les super administrateurs.

### Paramètres SMTP

La page de configuration SMTP présente un formulaire avec les champs suivants.

**Serveur SMTP** : L'adresse du serveur SMTP de votre fournisseur d'email. Exemples : smtp.gmail.com, smtp.office365.com, smtp.infomaniak.com.

**Port SMTP** : Le port de connexion au serveur SMTP. Les ports courants sont 587 (TLS), 465 (SSL), ou 25 (non sécurisé, déconseillé).

**Email expéditeur** : L'adresse email qui apparaîtra comme expéditeur des emails envoyés par l'application. Cette adresse doit être valide et autorisée à envoyer des emails via le serveur SMTP configuré.

**Nom de l'expéditeur** : Le nom qui apparaîtra comme expéditeur dans les clients email des destinataires. Exemple : "Guichet du Numérique".

**Nom d'utilisateur SMTP** : L'identifiant de connexion au serveur SMTP. Généralement, il s'agit de l'adresse email complète.

**Mot de passe SMTP** : Le mot de passe de connexion au serveur SMTP. Ce champ est masqué pour des raisons de sécurité.

**Email de destination** : L'adresse email qui recevra les carrousels envoyés via la fonction "Envoyer et Télécharger". Cette adresse peut être modifiée à tout moment.

**Utiliser TLS** : Case à cocher pour activer le chiffrement TLS. Recommandé pour la sécurité des communications.

### Configuration pour les fournisseurs courants

Voici les paramètres recommandés pour les fournisseurs d'email les plus courants.

**Gmail** : Serveur SMTP : smtp.gmail.com, Port : 587, TLS : Activé. Note : Vous devez générer un mot de passe d'application depuis les paramètres de sécurité de votre compte Google.

**Outlook/Office 365** : Serveur SMTP : smtp.office365.com, Port : 587, TLS : Activé.

**Infomaniak** : Serveur SMTP : mail.infomaniak.com, Port : 587, TLS : Activé.

**OVH** : Serveur SMTP : ssl0.ovh.net, Port : 587, TLS : Activé.

### Test de la configuration

Après avoir saisi les paramètres SMTP, il est fortement recommandé de tester la configuration avant de l'enregistrer. Cliquez sur le bouton "Tester la configuration" pour envoyer un email de test à l'adresse de destination configurée. Si l'email est reçu correctement, la configuration est valide et peut être enregistrée. En cas d'erreur, vérifiez les paramètres saisis et consultez la documentation de votre fournisseur d'email.

### Enregistrement de la configuration

Une fois les paramètres vérifiés et testés, cliquez sur le bouton "Enregistrer" pour sauvegarder la configuration. Les utilisateurs pourront immédiatement utiliser la fonction "Envoyer et Télécharger" dans le générateur de carrousels.

### Sécurité

Les informations sensibles (mot de passe SMTP) sont stockées de manière sécurisée dans la base de données. Seuls les super administrateurs peuvent consulter et modifier ces paramètres. Il est recommandé de changer régulièrement le mot de passe SMTP et d'utiliser des mots de passe d'application dédiés plutôt que le mot de passe principal de votre compte email.

---

## Configuration de l'intelligence artificielle

La configuration de l'intelligence artificielle permet d'activer la génération automatique de descriptions d'images pour les prompts. Cette fonctionnalité est réservée aux super administrateurs.

### Accès à la configuration

Pour accéder à la configuration IA, cliquez sur "Configuration IA" dans le menu de navigation latéral. Cette option n'est visible que pour les super administrateurs.

### Choix du fournisseur d'IA

L'application supporte cinq fournisseurs d'intelligence artificielle différents. Chaque fournisseur a ses propres paramètres de configuration.

**Infomaniak** : Service d'IA européen respectueux de la vie privée. Nécessite un Product ID et une clé API.

**OpenAI** : Le fournisseur le plus connu, créateur de ChatGPT. Nécessite une clé API.

**Mistral AI** : Fournisseur français spécialisé dans les modèles open source. Nécessite une clé API.

**Claude (Anthropic)** : Fournisseur américain reconnu pour la qualité de ses réponses. Nécessite une clé API.

**Gemini (Google)** : Service d'IA de Google intégré à l'écosystème Google Cloud. Nécessite une clé API.

### Configuration pour Infomaniak

Pour configurer Infomaniak comme fournisseur d'IA, sélectionnez "Infomaniak" dans le menu déroulant "Fournisseur d'IA". Deux champs apparaissent.

**Product ID** : Identifiant de votre produit Infomaniak. Vous le trouverez dans votre espace client Infomaniak, section API.

**Clé API** : Clé d'authentification pour accéder à l'API Infomaniak. À générer depuis votre espace client.

Cliquez sur "Enregistrer" pour activer la configuration. Les utilisateurs verront apparaître des boutons "✨ Générer description" à côté des champs "Prompt Image" dans le générateur.

### Configuration pour OpenAI

Pour configurer OpenAI, sélectionnez "OpenAI" dans le menu déroulant et saisissez votre clé API OpenAI. Vous pouvez obtenir une clé API en créant un compte sur platform.openai.com et en générant une clé dans la section API Keys.

### Configuration pour Mistral AI

Pour configurer Mistral AI, sélectionnez "Mistral AI" dans le menu déroulant et saisissez votre clé API Mistral. Vous pouvez obtenir une clé API en créant un compte sur console.mistral.ai.

### Configuration pour Claude

Pour configurer Claude, sélectionnez "Claude (Anthropic)" dans le menu déroulant et saisissez votre clé API Anthropic. Vous pouvez obtenir une clé API en créant un compte sur console.anthropic.com.

### Configuration pour Gemini

Pour configurer Gemini, sélectionnez "Gemini (Google)" dans le menu déroulant et saisissez votre clé API Google. Vous pouvez obtenir une clé API en créant un projet sur console.cloud.google.com et en activant l'API Gemini.

### Activation et désactivation

Pour désactiver temporairement la génération IA sans supprimer la configuration, décochez la case "Activer la génération IA". Les boutons de génération disparaîtront du générateur mais la configuration restera sauvegardée.

Pour réactiver la fonctionnalité, cochez à nouveau la case et cliquez sur "Enregistrer".

### Utilisation par les utilisateurs

Une fois la configuration IA activée, tous les utilisateurs verront apparaître des boutons "✨ Générer description" à côté des champs "Prompt Image" dans le générateur. En cliquant sur ce bouton, l'IA analyse le contenu texte de la slide et génère automatiquement une description d'image pertinente pour le prompt.

---

## Historique d'audit

L'historique d'audit permet de suivre toutes les actions importantes effectuées dans l'application. Cette fonctionnalité est accessible aux super administrateurs et aux administrateurs.

### Accès à l'historique

Pour accéder à l'historique d'audit, cliquez sur "Historique d'audit" dans le menu de navigation latéral. La page affiche un tableau chronologique de toutes les actions enregistrées.

### Informations enregistrées

Pour chaque action, l'historique d'audit enregistre les informations suivantes.

**Date et heure** : Horodatage précis de l'action au format jour/mois/année heure:minute:seconde.

**Utilisateur** : Nom et email de l'utilisateur ayant effectué l'action.

**Action** : Type d'action effectuée. Les actions enregistrées incluent : création de carrousel, modification de carrousel, suppression de carrousel, envoi d'email, modification de profil utilisateur, création d'utilisateur, suppression d'utilisateur, blocage d'utilisateur, déblocage d'utilisateur, modification de rôle, modification de configuration SMTP, modification de configuration IA, modification de type de slide.

**Détails** : Informations complémentaires sur l'action, comme l'ID du carrousel concerné ou les paramètres modifiés.

### Filtrage et recherche

L'historique d'audit propose des outils de filtrage pour faciliter la recherche d'actions spécifiques.

**Filtre par type d'action** : Permet d'afficher uniquement les actions d'un type particulier.

**Filtre par utilisateur** : Permet d'afficher uniquement les actions effectuées par un utilisateur spécifique.

**Filtre par période** : Permet de filtrer les actions par date (aujourd'hui, cette semaine, ce mois, cette année).

**Barre de recherche** : Permet de rechercher dans les détails des actions.

### Export de l'historique

Pour exporter l'historique d'audit au format CSV, cliquez sur le bouton "Exporter CSV" en haut de la page. Le fichier téléchargé contient toutes les entrées de l'historique avec leurs détails complets. Ce fichier peut être ouvert dans Excel ou tout autre tableur pour analyse.

### Remise à zéro de l'historique

Les super administrateurs peuvent effacer l'historique d'audit pour repartir sur une base vierge. Cette action est irréversible et doit être utilisée avec précaution.

Pour effacer l'historique, cliquez sur le bouton "Remettre à zéro" en haut de la page. Une confirmation vous sera demandée. Après confirmation, toutes les entrées de l'historique sont définitivement supprimées.

**Attention** : Il est recommandé d'exporter l'historique au format CSV avant de le remettre à zéro, afin de conserver une archive des actions passées.

---

## Consultation de l'historique des carrousels

Les administrateurs et super administrateurs peuvent consulter l'ensemble des carrousels créés par tous les utilisateurs de l'application.

### Accès à l'historique

Pour accéder à l'historique des carrousels, cliquez sur "Historique" dans le menu de navigation latéral. La page affiche tous les carrousels créés sur la plateforme, quel que soit leur auteur.

### Informations affichées

Pour chaque carrousel, l'historique affiche les informations suivantes.

**Titre** : Le titre du carrousel tel que défini dans la slide titre.

**Thématique** : La thématique du carrousel.

**Auteur** : Le nom de l'utilisateur ayant créé le carrousel.

**Date de création** : Date et heure de création du carrousel.

**Actions disponibles** : Télécharger le fichier Excel, dupliquer le carrousel, supprimer le carrousel.

### Recherche et filtrage

L'historique propose des outils de recherche et de filtrage pour faciliter la navigation.

**Barre de recherche** : Permet de rechercher un carrousel par son titre ou sa thématique.

**Filtre par thématique** : Affiche uniquement les carrousels d'une thématique spécifique.

**Filtre par période** : Permet de filtrer les carrousels par date de création (aujourd'hui, cette semaine, ce mois, cette année).

### Sélection multiple et actions groupées

Les administrateurs peuvent sélectionner plusieurs carrousels simultanément en cochant les cases à gauche de chaque ligne.

**Suppression groupée** : Après avoir sélectionné plusieurs carrousels, cliquez sur le bouton "Supprimer la sélection" pour les supprimer tous en une seule opération. Une confirmation vous sera demandée.

**Téléchargement groupé** : Après avoir sélectionné plusieurs carrousels, cliquez sur le bouton "Télécharger la sélection" pour télécharger tous les fichiers Excel dans une archive ZIP.

### Duplication de carrousels

La fonction de duplication permet de créer une copie d'un carrousel existant pour le modifier. Cette fonctionnalité est utile pour créer des variantes d'un carrousel ou pour utiliser un carrousel existant comme modèle.

Pour dupliquer un carrousel, cliquez sur le bouton "Dupliquer" (icône 📋) dans la ligne correspondante. Le générateur s'ouvre automatiquement avec toutes les données du carrousel dupliqué. Vous pouvez alors modifier le contenu selon vos besoins et enregistrer le nouveau carrousel.

---

## Bonnes pratiques

Cette section présente les bonnes pratiques recommandées pour une administration efficace et sécurisée de l'application.

### Gestion des utilisateurs

**Attribution des rôles** : Accordez le rôle d'administrateur uniquement aux personnes de confiance qui ont besoin d'accéder aux fonctionnalités d'administration. Le rôle de super administrateur doit être réservé à un nombre très limité de personnes.

**Révision régulière** : Effectuez une révision trimestrielle des comptes utilisateurs pour identifier et supprimer les comptes inactifs ou obsolètes.

**Blocage vs suppression** : Privilégiez le blocage temporaire plutôt que la suppression définitive lorsque vous devez suspendre l'accès d'un utilisateur. La suppression entraîne la perte de toutes les données associées.

### Sécurité

**Mots de passe SMTP** : Utilisez des mots de passe d'application dédiés plutôt que le mot de passe principal de votre compte email. Changez ces mots de passe régulièrement.

**Clés API IA** : Protégez vos clés API et ne les partagez jamais. Régénérez-les périodiquement et en cas de suspicion de compromission.

**Historique d'audit** : Consultez régulièrement l'historique d'audit pour détecter d'éventuelles activités suspectes.

### Maintenance

**Sauvegarde de l'historique d'audit** : Exportez régulièrement l'historique d'audit au format CSV pour conserver une archive des actions importantes.

**Vérification des configurations** : Testez périodiquement la configuration SMTP pour vous assurer que l'envoi d'emails fonctionne correctement.

**Mise à jour des images de prévisualisation** : Maintenez les images de prévisualisation des types de slides à jour pour refléter fidèlement le rendu final.

### Support aux utilisateurs

**Formation** : Assurez-vous que les utilisateurs disposent du manuel utilisateur et connaissent les fonctionnalités de base de l'application.

**Communication** : Informez les utilisateurs des changements de configuration importants, comme la désactivation temporaire d'un type de slide ou une maintenance planifiée.

**Assistance** : Consultez l'historique des carrousels et l'historique d'audit pour aider les utilisateurs à résoudre leurs problèmes.

---

## Conclusion

Ce manuel couvre l'ensemble des fonctionnalités d'administration du Générateur de Carrousels GdN. Pour toute question ou problème non couvert par ce document, n'hésitez pas à consulter l'historique d'audit ou à contacter le support technique.

La maîtrise de ces outils d'administration vous permettra de gérer efficacement la plateforme et d'offrir la meilleure expérience possible aux utilisateurs de l'application.

---

**Document rédigé par Manus AI**

**Version 1.0 - Janvier 2025**
