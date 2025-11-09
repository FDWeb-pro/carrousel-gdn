# Manuel Administrateur - Générateur de Carrousels

**Version 2.0 - Novembre 2025**

**Auteur : Manus AI**

---

## Table des matières

1. [Introduction](#introduction)
2. [Rôles et permissions](#rôles-et-permissions)
3. [Accès à l'interface d'administration](#accès-à-linterface-dadministration)
4. [Tableau de bord administration](#tableau-de-bord-administration)
5. [Paramètres de marque](#paramètres-de-marque)
6. [Configuration du nombre de slides](#configuration-du-nombre-de-slides)
7. [Gestion de l'aide et des ressources](#gestion-de-laide-et-des-ressources)
8. [Gestion des utilisateurs](#gestion-des-utilisateurs)
9. [Configuration des types de slides](#configuration-des-types-de-slides)
10. [Configuration SMTP](#configuration-smtp)
11. [Configuration de l'intelligence artificielle](#configuration-de-lintelligence-artificielle)
12. [Historique d'audit](#historique-daudit)
13. [Consultation de l'historique des carrousels](#consultation-de-lhistorique-des-carrousels)
14. [Bonnes pratiques](#bonnes-pratiques)

---

## Introduction

Le Générateur de Carrousels est une application web professionnelle permettant de créer des carrousels de présentation. Cette application est conçue pour être entièrement personnalisable et adaptable aux besoins de votre organisation. Elle offre deux niveaux d'administration distincts avec des permissions spécifiques pour assurer une gestion efficace et sécurisée de la plateforme.

Ce manuel s'adresse aux administrateurs de l'application et couvre l'ensemble des fonctionnalités d'administration disponibles, y compris les nouvelles fonctionnalités de personnalisation de marque, de configuration du nombre de slides, et de gestion des ressources d'aide. Il est conçu pour vous guider dans la configuration initiale, la gestion quotidienne des utilisateurs et du contenu, ainsi que dans la maintenance de la plateforme.

### Public cible

Ce manuel est destiné aux profils suivants :

**Super administrateurs** : Ils disposent de tous les droits d'administration, y compris la configuration des types de slides, la configuration SMTP, la configuration de l'intelligence artificielle, la personnalisation de la marque, la configuration du nombre de slides, la gestion des ressources d'aide, et la gestion complète des utilisateurs.

**Administrateurs** : Ils peuvent gérer les utilisateurs, consulter l'historique des carrousels et l'historique d'audit, personnaliser la marque, configurer le nombre de slides, et gérer les ressources d'aide. Ils n'ont pas accès aux configurations système avancées (SMTP, IA, types de slides).

### Architecture white-label

L'application est conçue comme une solution white-label, ce qui signifie qu'elle peut être entièrement personnalisée pour refléter l'identité visuelle et les besoins de votre organisation. Le logo, le nom de l'application, la description de votre structure, et les ressources d'aide sont tous configurables via l'interface d'administration.

---

## Rôles et permissions

L'application distingue trois niveaux d'accès avec des permissions spécifiques pour chaque rôle.

### Tableau récapitulatif des permissions

| Fonctionnalité | Super Admin | Admin | Utilisateur |
|---|---|---|---|
| Créer des carrousels | ✓ | ✓ | ✓ |
| Consulter l'historique personnel | ✓ | ✓ | ✓ |
| Modifier son profil | ✓ | ✓ | ✓ |
| Accéder à l'aide | ✓ | ✓ | ✓ |
| Consulter tous les carrousels | ✓ | ✓ | ✗ |
| Gérer les utilisateurs | ✓ | ✓ | ✗ |
| Consulter l'historique d'audit | ✓ | ✓ | ✗ |
| Configurer les paramètres de marque | ✓ | ✓ | ✗ |
| Configurer le nombre de slides | ✓ | ✓ | ✗ |
| Gérer les ressources d'aide | ✓ | ✓ | ✗ |
| Configurer les types de slides | ✓ | ✗ | ✗ |
| Configurer SMTP | ✓ | ✗ | ✗ |
| Configurer l'IA | ✓ | ✗ | ✗ |
| Configurer le lien CGU | ✓ | ✗ | ✗ |

### Description des rôles

**Super administrateur** : Le super administrateur possède tous les droits sur l'application. Il est responsable de la configuration système complète, incluant la personnalisation de la marque, la configuration du nombre de slides, la gestion des types de slides, la configuration des services externes (SMTP, IA), la gestion des ressources d'aide (y compris le lien CGU), et la supervision générale de la plateforme. Le propriétaire du projet est automatiquement désigné comme super administrateur lors de la création de l'application.

**Administrateur** : L'administrateur gère les aspects opérationnels de l'application. Il peut créer, modifier et supprimer des comptes utilisateurs, consulter l'ensemble des carrousels créés sur la plateforme, accéder à l'historique d'audit, personnaliser la marque de l'organisation, configurer le nombre de slides autorisé, et gérer les ressources d'aide (fichiers et liens, sauf le lien CGU réservé aux super administrateurs). Il ne peut pas modifier les configurations système avancées.

**Utilisateur** : L'utilisateur standard peut créer des carrousels, consulter son propre historique, accéder aux ressources d'aide, et modifier son profil personnel. Il n'a pas accès aux fonctionnalités d'administration.

---

## Accès à l'interface d'administration

L'interface d'administration est accessible via le menu de navigation latéral après connexion avec un compte administrateur ou super administrateur.

### Connexion à l'application

Pour accéder à l'application, rendez-vous sur l'URL de votre instance et cliquez sur le bouton de connexion. L'authentification s'effectue via le système OAuth de Manus, qui prend en charge les comptes Google, Microsoft et autres fournisseurs d'identité.

Lors de votre première connexion, votre compte est automatiquement créé dans l'application. Si vous êtes le propriétaire du projet, vous recevez automatiquement le rôle de super administrateur. Les autres utilisateurs reçoivent le rôle d'utilisateur standard par défaut et doivent être promus administrateur ou super administrateur manuellement.

### Navigation dans l'interface

Une fois connecté, l'interface présente un menu de navigation latéral sur la gauche de l'écran. Le logo et le nom de votre organisation s'affichent en haut du menu, reflétant la personnalisation que vous avez configurée. Les options disponibles dépendent de votre rôle.

Pour les **administrateurs et super administrateurs**, le menu affiche les options suivantes : Générateur (création de carrousels), Historique (consultation de tous les carrousels), Aide (accès aux ressources), et Administration (accès au tableau de bord centralisé).

Le menu utilisateur, accessible en cliquant sur votre nom en bas du menu latéral, permet d'accéder à votre profil personnel et de vous déconnecter. Un footer en bas de chaque page affiche la mention de crédit avec les liens vers les sites web associés.

### Navigation dans les pages d'administration

Toutes les pages d'administration sont accessibles depuis le tableau de bord administration centralisé. Chaque page d'administration affiche un bouton "Retour à l'Administration" en haut pour revenir facilement au tableau de bord. Les pages utilisent toute la largeur disponible pour une meilleure lisibilité des tableaux et formulaires.

---

## Tableau de bord administration

Le tableau de bord administration est le point d'entrée centralisé pour accéder à toutes les fonctionnalités d'administration. Il offre une vue d'ensemble des différentes sections de configuration et de gestion.

### Accès au tableau de bord

Pour accéder au tableau de bord administration, cliquez sur "Administration" dans le menu de navigation latéral. La page affiche une série de cartes organisées par catégorie, chacune donnant accès à une fonctionnalité spécifique.

### Organisation du tableau de bord

Le tableau de bord est organisé en plusieurs sections pour faciliter la navigation :

**Personnalisation** : Cette section regroupe les fonctionnalités de personnalisation de l'application, incluant les Paramètres de Marque (logo, nom, description) et la Configuration du Nombre de Slides (min/max autorisé).

**Contenu** : Cette section permet de gérer le contenu de l'application, incluant la Gestion de l'Aide (fichiers, liens, CGU) et la Configuration des Types de Slides (modèles de slides disponibles).

**Utilisateurs et Sécurité** : Cette section regroupe la Gestion des Utilisateurs (comptes, rôles, statuts) et l'Historique d'Audit (logs des actions importantes).

**Configuration Technique** : Cette section, réservée aux super administrateurs, inclut la Configuration SMTP (envoi d'emails) et la Configuration IA (intelligence artificielle).

### Utilisation du tableau de bord

Pour accéder à une fonctionnalité, cliquez sur la carte correspondante. Vous serez redirigé vers la page de configuration ou de gestion appropriée. Chaque page affiche un bouton "Retour à l'Administration" pour revenir facilement au tableau de bord.

---

## Paramètres de marque

Les paramètres de marque vous permettent de personnaliser l'identité visuelle de l'application pour qu'elle reflète votre organisation. Cette fonctionnalité est accessible aux administrateurs et super administrateurs.

### Accès aux paramètres de marque

Pour accéder aux paramètres de marque, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Paramètres de Marque" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/brand-config`.

### Configuration du nom de l'organisation

Le champ "Nom de la structure" permet de définir le nom de votre organisation tel qu'il apparaîtra dans l'application. Ce nom est utilisé dans plusieurs endroits :

- Dans le titre de la sidebar du menu de navigation
- Dans le sous-titre de la page Générateur ("Créez votre carrousel pour [Nom de la structure]")
- Dans les exports et communications

Saisissez le nom complet de votre organisation (par exemple : "Guichet du Numérique", "Agence Digitale XYZ", etc.). Ce champ est obligatoire.

### Upload du logo

Le logo de votre organisation s'affiche en haut du menu de navigation latéral, au-dessus du nom de la structure. Pour uploader un logo :

1. Cliquez sur le bouton "Choisir un fichier" dans la section "Logo de la structure"
2. Sélectionnez un fichier image depuis votre ordinateur (formats acceptés : PNG, JPG, SVG)
3. Une prévisualisation du logo s'affiche immédiatement
4. Cliquez sur "Enregistrer" pour sauvegarder la configuration

**Recommandations pour le logo** :
- Format carré (ratio 1:1) pour un rendu optimal
- Taille recommandée : 200x200 pixels minimum
- Poids maximum : 2 MB
- Privilégiez un fond transparent (PNG) pour une meilleure intégration visuelle
- Assurez-vous que le logo est lisible en petit format

Le logo est automatiquement stocké sur un service de stockage cloud sécurisé et affiché dans toute l'application.

### Configuration de la description

Le champ "Description courte" permet de saisir une description de votre organisation (maximum 250 caractères). Cette description peut être utilisée pour présenter votre structure aux utilisateurs ou dans les exports de données.

Saisissez une description concise et informative de votre organisation, ses missions, ou ses services. Exemple : "Le Guichet du Numérique accompagne les entreprises dans leur transformation digitale en proposant des formations, du conseil et des outils innovants."

### Suppression du logo

Pour supprimer le logo actuel et revenir au logo par défaut, cliquez sur le bouton "Supprimer le logo" à côté de la prévisualisation. Cette action est immédiate mais peut être annulée en uploadant à nouveau un logo avant d'enregistrer.

### Sauvegarde des modifications

Après avoir modifié les paramètres de marque, cliquez sur le bouton "Enregistrer" en bas de la page. Un message de confirmation s'affiche pour indiquer que les modifications ont été sauvegardées. Les changements sont immédiatement visibles dans toute l'application après rechargement de la page.

### Impact des paramètres de marque

Les paramètres de marque configurés ici affectent l'ensemble de l'application :
- Le logo s'affiche dans la sidebar et dans la page Générateur
- Le nom de la structure apparaît dans la sidebar et dans le sous-titre du Générateur
- La description est disponible pour les exports et communications futures

Cette personnalisation permet de transformer l'application en une solution white-label adaptée à votre organisation.

---

## Configuration du nombre de slides

La configuration du nombre de slides permet de définir combien de slides intermédiaires les utilisateurs peuvent ajouter à leurs carrousels. Cette fonctionnalité est accessible aux administrateurs et super administrateurs.

### Accès à la configuration

Pour accéder à la configuration du nombre de slides, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Configuration Slides" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/slide-config`.

### Configuration du minimum de slides

Le champ "Nombre minimum de slides intermédiaires" définit le nombre minimum de slides que les utilisateurs doivent ajouter entre la slide titre et la slide finale. Cette valeur doit être au minimum de 2 pour garantir un contenu suffisant dans les carrousels.

Saisissez un nombre entier entre 2 et 100. Une valeur typique est 2 ou 3 slides minimum pour assurer un contenu minimal.

### Configuration du maximum de slides

Le champ "Nombre maximum de slides intermédiaires" définit le nombre maximum de slides que les utilisateurs peuvent ajouter entre la slide titre et la slide finale. Cette valeur peut aller jusqu'à 100 pour permettre des carrousels très détaillés.

Saisissez un nombre entier entre 2 et 100. Une valeur typique est 8 à 10 slides maximum pour maintenir des carrousels concis et percutants.

### Validation des valeurs

L'application vérifie automatiquement que :
- Le minimum est au moins égal à 2
- Le maximum ne dépasse pas 100
- Le minimum est inférieur ou égal au maximum

Si vous saisissez des valeurs invalides, un message d'erreur s'affiche et vous invite à corriger les valeurs avant de sauvegarder.

### Sauvegarde de la configuration

Après avoir défini les valeurs minimum et maximum, cliquez sur le bouton "Enregistrer" en bas de la page. Un message de confirmation s'affiche pour indiquer que la configuration a été sauvegardée.

### Impact de la configuration

La configuration du nombre de slides affecte immédiatement l'interface du générateur pour tous les utilisateurs :
- Le compteur de slides affiche le nouveau maximum (par exemple "3/10" au lieu de "3/8")
- Le bouton "Ajouter une slide" est désactivé lorsque le maximum est atteint
- Les utilisateurs sont informés des limites via l'interface

**Note importante** : Cette configuration affecte uniquement la création de nouveaux carrousels et l'ajout de slides aux carrousels existants. Les carrousels déjà créés avec un nombre de slides différent ne sont pas modifiés.

### Recommandations

Pour la plupart des cas d'usage, les valeurs suivantes sont recommandées :
- **Minimum** : 2 à 3 slides pour garantir un contenu minimal
- **Maximum** : 8 à 10 slides pour maintenir des carrousels concis et engageants

Des carrousels trop longs (plus de 10 slides) peuvent perdre l'attention du lecteur. Des carrousels trop courts (moins de 2 slides) manquent de substance. Adaptez ces valeurs selon les besoins spécifiques de votre organisation.

---

## Gestion de l'aide et des ressources

La gestion de l'aide et des ressources vous permet de mettre à disposition des utilisateurs des fichiers téléchargeables, des liens vers des ressources en ligne, et un lien vers les conditions générales d'utilisation. Cette fonctionnalité est accessible aux administrateurs et super administrateurs.

### Accès à la gestion de l'aide

Pour accéder à la gestion de l'aide, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Gestion de l'Aide" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/help`.

### Types de ressources

L'application supporte deux types de ressources :

**Fichiers téléchargeables** : Manuels d'utilisation, guides PDF, modèles de carrousels, ou tout autre document que les utilisateurs peuvent télécharger sur leur ordinateur.

**Liens vers des ressources en ligne** : Pages web, tutoriels vidéo, forums de discussion, ou tout autre contenu accessible via une URL.

### Ajout d'un fichier téléchargeable

Pour ajouter un fichier téléchargeable :

1. Dans la section "Ajouter une nouvelle ressource", sélectionnez "Fichier téléchargeable" dans le menu déroulant "Type de ressource"
2. Saisissez un titre descriptif pour le fichier (par exemple : "Manuel utilisateur complet", "Guide de bonnes pratiques")
3. Saisissez une description optionnelle pour expliquer le contenu du fichier
4. Cliquez sur "Choisir un fichier" et sélectionnez le fichier depuis votre ordinateur
5. Cliquez sur "Ajouter la ressource"

Le fichier est automatiquement uploadé sur le service de stockage cloud et ajouté à la liste des ressources disponibles. Les utilisateurs pourront le télécharger depuis la page "Aide" de l'application.

**Recommandations pour les fichiers** :
- Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP
- Taille maximale : 10 MB par fichier
- Privilégiez le format PDF pour les documents de lecture
- Utilisez des noms de fichiers explicites

### Ajout d'un lien vers une ressource en ligne

Pour ajouter un lien vers une ressource en ligne :

1. Dans la section "Ajouter une nouvelle ressource", sélectionnez "Lien vers une ressource en ligne" dans le menu déroulant "Type de ressource"
2. Saisissez un titre descriptif pour le lien (par exemple : "Tutoriel vidéo : Créer son premier carrousel", "Forum de support")
3. Saisissez une description optionnelle pour expliquer le contenu de la page
4. Saisissez l'URL complète de la ressource (commençant par http:// ou https://)
5. Cliquez sur "Ajouter la ressource"

Le lien est ajouté à la liste des ressources disponibles. Les utilisateurs pourront cliquer dessus depuis la page "Aide" pour ouvrir la ressource dans un nouvel onglet.

### Gestion des ressources existantes

La page affiche la liste de toutes les ressources disponibles, organisées par type (fichiers et liens). Pour chaque ressource, les informations suivantes sont affichées : titre, description, type, et date d'ajout.

Pour **supprimer** une ressource, cliquez sur le bouton "Supprimer" (icône poubelle) à côté de la ressource. Une confirmation vous sera demandée car cette action est irréversible. La suppression d'un fichier supprime également le fichier du service de stockage cloud.

Pour **modifier** une ressource, vous devez la supprimer et en créer une nouvelle. La modification directe n'est pas disponible pour éviter les erreurs de manipulation.

### Configuration du lien CGU (Super administrateurs uniquement)

Les super administrateurs ont accès à une section supplémentaire permettant de configurer le lien vers les Conditions Générales d'Utilisation (CGU). Cette section n'est pas visible pour les administrateurs standard.

Pour configurer le lien CGU :

1. Dans la section "Conditions Générales d'Utilisation (CGU)", saisissez l'URL complète de la page CGU (commençant par http:// ou https://)
2. Cliquez sur "Enregistrer le lien CGU"

Le lien CGU s'affiche dans une section dédiée en bas de la page "Aide" accessible par tous les utilisateurs. Ce lien est distinct des autres ressources car il a une importance légale particulière.

### Impact de la gestion de l'aide

Les ressources configurées ici sont immédiatement visibles sur la page "Aide" accessible par tous les utilisateurs de l'application. Cette page centralise toutes les ressources d'assistance et de documentation, facilitant l'adoption de l'application par les utilisateurs.

Une bonne gestion des ressources d'aide réduit les demandes de support et améliore l'autonomie des utilisateurs.

---

## Gestion des utilisateurs

La gestion des utilisateurs est une fonctionnalité centrale de l'administration. Elle permet de contrôler qui peut accéder à l'application et avec quels droits.

### Accès à la page de gestion

Pour accéder à la gestion des utilisateurs, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Gestion des Utilisateurs" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/users`.

La page affiche un tableau listant tous les utilisateurs enregistrés dans l'application avec leurs informations principales : nom, email, rôle, statut, et date de dernière connexion.

### Recherche et filtrage

La page de gestion des utilisateurs propose des outils de recherche et de filtrage pour faciliter la navigation dans une liste potentiellement longue d'utilisateurs.

**Barre de recherche** : Utilisez la barre de recherche en haut de la page pour rechercher un utilisateur par son nom ou son email. La recherche est instantanée et filtre la liste au fur et à mesure de votre saisie.

**Filtrage par rôle** : Utilisez le menu déroulant "Filtrer par rôle" pour afficher uniquement les utilisateurs d'un rôle spécifique (Super Admin, Admin, ou Utilisateur).

**Filtrage par statut** : Utilisez le menu déroulant "Filtrer par statut" pour afficher uniquement les utilisateurs actifs ou inactifs.

### Modification du rôle d'un utilisateur

Pour modifier le rôle d'un utilisateur :

1. Localisez l'utilisateur dans le tableau
2. Cliquez sur le menu déroulant dans la colonne "Rôle"
3. Sélectionnez le nouveau rôle : Super Admin, Admin, ou Utilisateur
4. Le changement est automatiquement sauvegardé

Le changement de rôle prend effet immédiatement. L'utilisateur verra ses permissions modifiées lors de sa prochaine action dans l'application ou après rechargement de la page.

**Attention** : Soyez prudent lors de l'attribution du rôle Super Admin, car ce rôle donne accès à toutes les configurations système, y compris les configurations sensibles (SMTP, IA).

### Activation et désactivation d'un utilisateur

Pour désactiver un utilisateur (l'empêcher de se connecter sans supprimer son compte) :

1. Localisez l'utilisateur dans le tableau
2. Cliquez sur le bouton "Désactiver" dans la colonne "Actions"
3. Confirmez l'action

Un utilisateur désactivé ne peut plus se connecter à l'application, mais son compte et ses carrousels sont préservés. Pour réactiver un utilisateur, cliquez sur le bouton "Activer".

### Suppression d'un utilisateur

Pour supprimer définitivement un utilisateur :

1. Localisez l'utilisateur dans le tableau
2. Cliquez sur le bouton "Supprimer" (icône poubelle) dans la colonne "Actions"
3. Confirmez l'action

La suppression d'un utilisateur est irréversible. Le compte est supprimé de la base de données, mais les carrousels créés par cet utilisateur sont préservés pour des raisons d'archivage.

**Attention** : Vous ne pouvez pas supprimer votre propre compte ni le compte du propriétaire du projet.

### Informations sur les utilisateurs

Le tableau affiche les informations suivantes pour chaque utilisateur :

**Nom** : Prénom et nom de l'utilisateur tels que définis dans son profil.

**Email** : Adresse email utilisée pour la connexion via OAuth.

**Rôle** : Niveau de permissions de l'utilisateur (Super Admin, Admin, ou Utilisateur).

**Statut** : Actif ou Inactif. Seuls les utilisateurs actifs peuvent se connecter.

**Dernière connexion** : Date et heure de la dernière connexion de l'utilisateur à l'application.

**Méthode de connexion** : Fournisseur d'identité utilisé (Google, Microsoft, etc.).

### Création manuelle d'utilisateurs

L'application ne propose pas de fonctionnalité de création manuelle d'utilisateurs. Les comptes sont automatiquement créés lors de la première connexion via OAuth. Pour ajouter un nouvel utilisateur, communiquez-lui l'URL de l'application et demandez-lui de se connecter avec son compte Google, Microsoft, ou autre fournisseur d'identité supporté.

Une fois le compte créé automatiquement, vous pouvez modifier son rôle si nécessaire via la page de gestion des utilisateurs.

---

## Configuration des types de slides

La configuration des types de slides permet de définir quels modèles de slides sont disponibles pour les utilisateurs lors de la création de carrousels. Cette fonctionnalité est réservée aux super administrateurs.

### Accès à la configuration

Pour accéder à la configuration des types de slides, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Configuration Types de Slides" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/slide-types`.

### Types de slides disponibles

L'application propose cinq types de slides prédéfinis, chacun avec une structure et un usage spécifique :

**Type 1 - Introduction** : Slide d'introduction avec un texte principal et une image d'accompagnement.

**Type 2 - Texte simple** : Slide polyvalente avec un texte et une image.

**Type 3 - Liste à puces** : Slide pour présenter des points clés sous forme de liste.

**Type 4 - Citation** : Slide pour mettre en avant une citation avec son auteur.

**Type 5 - Chiffre clé** : Slide pour présenter quatre chiffres ou statistiques avec des icônes.

### Activation et désactivation des types

Pour chaque type de slide, vous pouvez activer ou désactiver sa disponibilité pour les utilisateurs. Utilisez les boutons "Activer" ou "Désactiver" à côté de chaque type.

Lorsqu'un type est **activé**, il apparaît dans le menu déroulant de sélection lors de l'ajout d'une slide intermédiaire dans le générateur.

Lorsqu'un type est **désactivé**, il n'apparaît plus dans le menu déroulant et les utilisateurs ne peuvent plus créer de nouvelles slides de ce type. Les slides existantes de ce type dans les carrousels déjà créés ne sont pas affectées.

### Configuration des miniatures

Chaque type de slide dispose d'une miniature de prévisualisation qui s'affiche dans les cartes de slides du générateur. Pour configurer ou modifier une miniature :

1. Cliquez sur le bouton "Modifier la miniature" à côté du type de slide
2. Sélectionnez un fichier image depuis votre ordinateur (formats acceptés : PNG, JPG)
3. La miniature est automatiquement uploadée et associée au type de slide

**Recommandations pour les miniatures** :
- Format : PNG ou JPG
- Taille recommandée : 400x300 pixels
- Poids maximum : 1 MB
- Privilégiez des images claires et représentatives du type de slide

### Ordre d'affichage des types

L'ordre d'affichage des types de slides dans le menu déroulant du générateur correspond à l'ordre numérique des types (Type 1, Type 2, etc.). Cet ordre ne peut pas être modifié via l'interface.

### Impact de la configuration

La configuration des types de slides affecte immédiatement l'interface du générateur pour tous les utilisateurs. Seuls les types activés apparaissent dans le menu déroulant de sélection lors de l'ajout d'une slide intermédiaire.

**Attention** : Désactiver un type de slide n'affecte pas les carrousels existants. Les slides de ce type déjà créées restent visibles et modifiables. Seule la création de nouvelles slides de ce type est bloquée.

---

## Configuration SMTP

La configuration SMTP permet de paramétrer l'envoi d'emails depuis l'application, notamment pour la fonctionnalité "Envoyer et Télécharger" qui envoie les carrousels par email. Cette fonctionnalité est réservée aux super administrateurs.

### Accès à la configuration

Pour accéder à la configuration SMTP, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Configuration SMTP" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/smtp`.

### Paramètres SMTP requis

Pour configurer l'envoi d'emails, vous devez fournir les informations suivantes :

**Serveur SMTP (Host)** : L'adresse du serveur SMTP de votre fournisseur d'email. Exemple : smtp.gmail.com, smtp.office365.com, smtp.infomaniak.com.

**Port SMTP** : Le port utilisé par le serveur SMTP. Les ports courants sont : 587 (TLS), 465 (SSL), ou 25 (non sécurisé, déconseillé).

**Utiliser TLS** : Cochez cette case si votre serveur SMTP utilise le chiffrement TLS (recommandé pour le port 587).

**Nom d'utilisateur** : Votre identifiant de connexion au serveur SMTP, généralement votre adresse email complète.

**Mot de passe** : Le mot de passe de votre compte email ou un mot de passe d'application spécifique si votre fournisseur le requiert.

**Email expéditeur** : L'adresse email qui apparaîtra comme expéditeur des emails envoyés par l'application.

**Nom de l'expéditeur** : Le nom qui apparaîtra comme expéditeur des emails (par exemple : "Générateur de Carrousels", "Équipe GdN").

**Email destinataire par défaut** : L'adresse email qui recevra les carrousels envoyés via la fonctionnalité "Envoyer et Télécharger" (généralement l'adresse de l'administrateur système).

### Configuration pour les principaux fournisseurs

**Gmail** :
- Host : smtp.gmail.com
- Port : 587
- TLS : Activé
- Utilisateur : votre-email@gmail.com
- Mot de passe : Mot de passe d'application (à générer dans les paramètres de sécurité Google)

**Microsoft 365 / Outlook** :
- Host : smtp.office365.com
- Port : 587
- TLS : Activé
- Utilisateur : votre-email@votredomaine.com
- Mot de passe : Votre mot de passe Microsoft

**Infomaniak** :
- Host : mail.infomaniak.com
- Port : 587
- TLS : Activé
- Utilisateur : votre-email@votredomaine.com
- Mot de passe : Votre mot de passe Infomaniak

### Test de la configuration

Après avoir saisi les paramètres SMTP, cliquez sur le bouton "Tester la configuration" pour vérifier que les paramètres sont corrects. Un email de test est envoyé à l'adresse destinataire par défaut.

Si le test réussit, un message de confirmation s'affiche. Si le test échoue, un message d'erreur indique la nature du problème (identifiants incorrects, serveur inaccessible, etc.).

### Sauvegarde de la configuration

Une fois les paramètres vérifiés et testés, cliquez sur le bouton "Enregistrer" pour sauvegarder la configuration SMTP. Les paramètres sont stockés de manière sécurisée dans la base de données.

**Sécurité** : Le mot de passe SMTP est chiffré avant d'être stocké dans la base de données pour garantir la sécurité de vos identifiants.

### Dépannage

Si l'envoi d'emails ne fonctionne pas :

1. Vérifiez que tous les champs sont correctement remplis
2. Vérifiez que votre fournisseur d'email autorise les connexions SMTP (certains fournisseurs requièrent une activation manuelle)
3. Vérifiez que vous utilisez un mot de passe d'application si votre fournisseur le requiert (Gmail, Microsoft)
4. Vérifiez que le port et le protocole TLS correspondent aux exigences de votre fournisseur
5. Consultez les logs de l'historique d'audit pour identifier les erreurs spécifiques

---

## Configuration de l'intelligence artificielle

La configuration de l'intelligence artificielle permet de paramétrer les fonctionnalités d'assistance IA de l'application, notamment la génération automatique de prompts d'images et de contenu. Cette fonctionnalité est réservée aux super administrateurs.

### Accès à la configuration

Pour accéder à la configuration IA, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Configuration IA" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/ai-config`.

### Paramètres IA requis

Pour configurer l'intelligence artificielle, vous devez fournir les informations suivantes :

**Clé API** : La clé d'authentification pour accéder au service d'IA (OpenAI, Anthropic, ou autre fournisseur compatible).

**Modèle** : Le modèle d'IA à utiliser pour la génération de contenu. Exemples : gpt-4, gpt-3.5-turbo, claude-3-opus, etc.

**Température** : Un paramètre contrôlant la créativité des réponses (valeur entre 0 et 1). Une température basse (0.2-0.3) produit des réponses plus prévisibles et cohérentes. Une température haute (0.7-0.9) produit des réponses plus créatives et variées.

**Tokens maximum** : Le nombre maximum de tokens (mots approximativement) que l'IA peut générer par requête. Une valeur typique est 500-1000 tokens pour la génération de prompts d'images et 1500-2000 tokens pour la génération de contenu complet.

### Configuration recommandée

Pour la plupart des cas d'usage, les paramètres suivants sont recommandés :

- **Modèle** : gpt-4 ou gpt-3.5-turbo (OpenAI) pour un bon équilibre entre qualité et coût
- **Température** : 0.7 pour un bon équilibre entre créativité et cohérence
- **Tokens maximum** : 1000 pour la génération de prompts d'images, 2000 pour la génération de contenu complet

### Test de la configuration

Après avoir saisi les paramètres IA, cliquez sur le bouton "Tester la configuration" pour vérifier que les paramètres sont corrects. Une requête de test est envoyée au service d'IA pour générer un court texte d'exemple.

Si le test réussit, un message de confirmation s'affiche avec le texte généré. Si le test échoue, un message d'erreur indique la nature du problème (clé API invalide, modèle non disponible, quota dépassé, etc.).

### Sauvegarde de la configuration

Une fois les paramètres vérifiés et testés, cliquez sur le bouton "Enregistrer" pour sauvegarder la configuration IA. Les paramètres sont stockés de manière sécurisée dans la base de données.

**Sécurité** : La clé API est chiffrée avant d'être stockée dans la base de données pour garantir la sécurité de vos identifiants.

### Désactivation de l'IA

Si vous souhaitez désactiver temporairement les fonctionnalités d'IA sans supprimer la configuration, laissez le champ "Clé API" vide et enregistrez. Les boutons d'assistance IA disparaîtront de l'interface utilisateur.

### Coûts et quotas

L'utilisation de l'intelligence artificielle génère des coûts facturés par votre fournisseur d'IA (OpenAI, Anthropic, etc.). Surveillez votre consommation via le tableau de bord de votre fournisseur pour éviter les dépassements de budget.

Certains fournisseurs imposent des quotas de requêtes par minute ou par jour. Si vous atteignez ces quotas, les fonctionnalités d'IA seront temporairement indisponibles jusqu'à la réinitialisation du quota.

---

## Historique d'audit

L'historique d'audit enregistre toutes les actions importantes effectuées dans l'application par les administrateurs et super administrateurs. Cette fonctionnalité permet de suivre les modifications de configuration, les actions sur les utilisateurs, et les événements système.

### Accès à l'historique d'audit

Pour accéder à l'historique d'audit, cliquez sur "Administration" dans le menu de navigation, puis sur la carte "Historique d'Audit" dans le tableau de bord. Vous pouvez également accéder directement à cette page via l'URL `/admin/audit`.

### Événements enregistrés

L'historique d'audit enregistre les événements suivants :

**Actions sur les utilisateurs** : Création, modification de rôle, activation, désactivation, suppression d'utilisateurs.

**Modifications de configuration** : Changements dans les paramètres de marque, configuration du nombre de slides, configuration SMTP, configuration IA, configuration des types de slides.

**Gestion des ressources** : Ajout, modification, suppression de ressources d'aide.

**Actions système** : Envoi d'emails, erreurs critiques, tentatives de connexion échouées.

### Consultation de l'historique

La page affiche un tableau listant tous les événements enregistrés, classés par date et heure (du plus récent au plus ancien). Pour chaque événement, les informations suivantes sont affichées :

**Date et heure** : Moment exact où l'événement s'est produit.

**Utilisateur** : Nom de l'utilisateur qui a effectué l'action.

**Action** : Type d'action effectuée (création, modification, suppression, etc.).

**Entité** : Type d'entité concernée (utilisateur, configuration, ressource, etc.).

**Détails** : Informations supplémentaires sur l'action (anciennes et nouvelles valeurs, identifiants, etc.).

### Filtrage et recherche

Utilisez les outils de filtrage en haut de la page pour affiner l'affichage de l'historique :

**Filtrage par utilisateur** : Affichez uniquement les actions effectuées par un utilisateur spécifique.

**Filtrage par type d'action** : Affichez uniquement les actions d'un type spécifique (création, modification, suppression).

**Filtrage par période** : Affichez uniquement les événements d'une période spécifique (aujourd'hui, cette semaine, ce mois, période personnalisée).

### Export de l'historique

Pour exporter l'historique d'audit au format CSV, cliquez sur le bouton "Exporter en CSV" en haut de la page. Un fichier CSV contenant tous les événements filtrés est téléchargé sur votre ordinateur.

Ce fichier peut être ouvert dans Excel ou tout autre tableur pour analyse ou archivage.

### Rétention des données

Les événements d'audit sont conservés indéfiniment dans la base de données. Pour des raisons de performance, il est recommandé d'exporter et d'archiver régulièrement l'historique, puis de supprimer les événements anciens (plus de 12 mois) si la base de données devient trop volumineuse.

---

## Consultation de l'historique des carrousels

L'historique des carrousels permet aux administrateurs et super administrateurs de consulter tous les carrousels créés par tous les utilisateurs de l'application. Cette fonctionnalité offre une vue d'ensemble de l'activité de création de contenu.

### Accès à l'historique global

Pour accéder à l'historique global des carrousels, cliquez sur "Historique" dans le menu de navigation latéral. En tant qu'administrateur ou super administrateur, vous voyez tous les carrousels créés par tous les utilisateurs, contrairement aux utilisateurs standard qui ne voient que leurs propres carrousels.

### Consultation des carrousels

La page affiche la liste de tous les carrousels enregistrés, classés par date de création (du plus récent au plus ancien). Chaque carrousel est représenté par une carte affichant : le titre, la thématique, l'auteur, la date de création, et le nombre de slides.

Pour consulter le détail d'un carrousel, cliquez sur sa carte. Les informations complètes du carrousel s'affichent, incluant le contenu de toutes les slides.

### Recherche et filtrage

Utilisez les outils de recherche et de filtrage en haut de la page pour trouver rapidement un carrousel spécifique :

**Barre de recherche** : Recherchez un carrousel par son titre ou sa thématique.

**Filtrage par auteur** : Affichez uniquement les carrousels créés par un utilisateur spécifique.

**Filtrage par thématique** : Affichez uniquement les carrousels d'une thématique spécifique.

**Filtrage par période** : Affichez uniquement les carrousels créés dans une période spécifique.

### Suppression de carrousels

En tant qu'administrateur ou super administrateur, vous pouvez supprimer n'importe quel carrousel, y compris ceux créés par d'autres utilisateurs. Pour supprimer un carrousel :

1. Localisez le carrousel dans la liste
2. Cliquez sur le bouton "Supprimer" (icône poubelle) sur la carte du carrousel
3. Confirmez l'action

La suppression d'un carrousel est irréversible. Utilisez cette fonctionnalité avec prudence.

### Export de carrousels

Depuis la page de détail d'un carrousel, vous pouvez exporter le carrousel au format Excel en cliquant sur le bouton "Télécharger Excel". Cette fonctionnalité est utile pour récupérer ou archiver des carrousels créés par d'autres utilisateurs.

### Statistiques d'utilisation

La page d'historique affiche des statistiques d'utilisation en haut de la page :

**Nombre total de carrousels** : Le nombre total de carrousels créés dans l'application.

**Carrousels créés ce mois** : Le nombre de carrousels créés au cours du mois en cours.

**Utilisateurs actifs** : Le nombre d'utilisateurs ayant créé au moins un carrousel.

**Thématiques populaires** : Les thématiques les plus utilisées dans les carrousels.

Ces statistiques vous donnent une vue d'ensemble de l'activité de l'application et vous aident à identifier les tendances d'utilisation.

---

## Bonnes pratiques

Cette section regroupe des recommandations pour optimiser la gestion et la maintenance de l'application.

### Configuration initiale

Lors de la première installation de l'application, suivez ces étapes pour une configuration optimale :

1. **Personnalisez la marque** : Configurez immédiatement le logo, le nom de l'organisation, et la description dans les Paramètres de Marque pour que l'application reflète votre identité.

2. **Définissez le nombre de slides** : Configurez le minimum et maximum de slides intermédiaires selon les besoins de votre organisation (recommandé : min 2, max 8).

3. **Activez les types de slides nécessaires** : Désactivez les types de slides que vous n'utiliserez pas pour simplifier l'interface utilisateur.

4. **Configurez SMTP** : Paramétrez l'envoi d'emails pour permettre la fonctionnalité "Envoyer et Télécharger".

5. **Configurez l'IA** : Si vous souhaitez utiliser les fonctionnalités d'assistance IA, configurez la clé API et les paramètres.

6. **Ajoutez des ressources d'aide** : Uploadez les manuels d'utilisation et ajoutez des liens vers les ressources en ligne pour faciliter l'adoption par les utilisateurs.

7. **Créez les comptes administrateurs** : Identifiez les personnes qui auront besoin de droits d'administration et modifiez leurs rôles après leur première connexion.

### Gestion des utilisateurs

Pour une gestion efficace des utilisateurs :

- **Attribuez les rôles avec parcimonie** : Limitez le nombre de super administrateurs au strict nécessaire (1 à 3 personnes maximum) pour éviter les modifications accidentelles de configuration.

- **Documentez les changements de rôles** : Tenez un registre externe des modifications de rôles et des raisons de ces modifications pour faciliter l'audit.

- **Désactivez plutôt que supprimer** : Préférez désactiver les comptes des utilisateurs qui quittent l'organisation plutôt que de les supprimer, pour préserver l'historique et les carrousels associés.

- **Revoyez régulièrement les permissions** : Effectuez un audit trimestriel des rôles et permissions pour vous assurer qu'ils correspondent toujours aux besoins actuels.

### Maintenance de la configuration

Pour maintenir une configuration optimale :

- **Testez les modifications** : Avant de modifier des paramètres critiques (SMTP, IA), testez toujours la nouvelle configuration pour éviter les interruptions de service.

- **Documentez les paramètres** : Conservez une documentation externe des paramètres SMTP et IA utilisés pour faciliter le dépannage et la migration.

- **Surveillez l'historique d'audit** : Consultez régulièrement l'historique d'audit pour détecter les actions inhabituelles ou les erreurs de configuration.

- **Archivez les anciennes ressources** : Supprimez régulièrement les ressources d'aide obsolètes pour maintenir une page d'aide claire et à jour.

### Gestion du contenu

Pour optimiser la gestion du contenu :

- **Définissez des thématiques standard** : Créez une liste de thématiques recommandées et communiquez-la aux utilisateurs pour faciliter la recherche et l'organisation des carrousels.

- **Revoyez les carrousels créés** : Consultez régulièrement l'historique global pour identifier les carrousels de qualité qui peuvent servir d'exemples ou de modèles.

- **Exportez et archivez** : Exportez régulièrement les carrousels importants au format Excel pour archivage externe.

### Sécurité et confidentialité

Pour garantir la sécurité de l'application :

- **Changez régulièrement les mots de passe** : Modifiez les mots de passe SMTP et les clés API au moins une fois par an.

- **Surveillez les connexions** : Consultez l'historique d'audit pour détecter les tentatives de connexion suspectes ou les actions non autorisées.

- **Limitez l'accès aux configurations sensibles** : Réservez le rôle de super administrateur aux personnes de confiance ayant une réelle nécessité d'accéder aux configurations système.

- **Sauvegardez la base de données** : Effectuez des sauvegardes régulières de la base de données pour pouvoir restaurer l'application en cas de problème.

### Support aux utilisateurs

Pour faciliter l'adoption de l'application :

- **Maintenez la page d'aide à jour** : Ajoutez régulièrement de nouvelles ressources (tutoriels, guides, FAQ) pour répondre aux questions récurrentes des utilisateurs.

- **Créez des modèles de carrousels** : Créez des carrousels exemples pour chaque thématique et partagez-les avec les utilisateurs comme modèles de référence.

- **Organisez des formations** : Proposez des sessions de formation pour les nouveaux utilisateurs afin de faciliter la prise en main de l'application.

- **Collectez les retours** : Encouragez les utilisateurs à vous faire part de leurs suggestions d'amélioration pour faire évoluer l'application selon leurs besoins.

---

**Fin du Manuel Administrateur**

Pour toute question technique ou suggestion d'amélioration de ce manuel, contactez l'équipe de développement.

**Réalisé par Frédéric Dedobbeleer - [FDWeb](https://www.fdweb.be) - [Guichet du Numérique](https://www.guichetdunumerique.be)**
