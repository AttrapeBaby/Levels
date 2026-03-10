# Levels

**Application web de gamification d'objectifs quotidiens.**

Levels transforme la productivité en jeu : chaque jour, l'utilisateur définit ses objectifs, les valide, gagne de l'XP, monte en niveau et maintient une série (streak). L'app encourage la régularité grâce à un système de récompenses, de pénalités et de défis.

🔗 **App en ligne** : [levels-app-f50a9.web.app](https://levels-app-f50a9.web.app)

---

## Fonctionnalités principales

### Objectifs quotidiens
- Création de 5 à 15 objectifs par jour avec catégories (Sport, Santé, Études, Compétences, Créatif, Finances, Administratif…)
- Système de **priorité** : un objectif marqué prioritaire rapporte 1.5× plus d'XP
- **Objectifs récurrents** : se recréent automatiquement chaque jour
- **Difficulté** ajustable (facile → extrême) avec XP proportionnel

### Progression RPG
- **XP et niveaux** : chaque validation rapporte de l'XP, le niveau monte avec une courbe exponentielle
- **Streak (série)** : jours consécutifs de succès → multiplicateur d'XP croissant (jusqu'à ×3.5)
- **Achievements** : 28 succès déblocables qui octroient des multiplicateurs permanents
- **Aura** : bordure visuelle évoluant avec le niveau (10 tiers, du bronze au cosmique)

### Systèmes de jeu avancés
- **Objectif mystère** : objectif caché qui se déverrouille en remplissant une condition secrète du jour (valider X objectifs, valider dans N catégories…), bonus XP ×2
- **Quête bonus** : défi quotidien supplémentaire avec récompense XP
- **L'Adversaire** : système PvE optionnel — un adversaire virtuel progresse chaque jour, il faut le battre avant la deadline
- **Le Sommet** : défi ultime activable une fois par jour pour un bonus massif
- **Réclamation** : possibilité de contester une pénalité injuste (nombre limité)

### Organisation long terme (Vision)
- Objectifs à 4 échelles : **vie**, **année**, **mois**, **semaine**
- Les objectifs hebdomadaires peuvent être liés aux objectifs quotidiens pour suivre la progression
- **Tâches planifiées** : programmer des objectifs pour des dates futures
- Calendrier hebdomadaire avec vue d'ensemble

### Autres fonctionnalités
- **Jours de repos** : configurable par jour de la semaine, préserve la streak sans pénalité
- **Pénalités** : perdre de l'XP et casser la streak si les objectifs minimum ne sont pas remplis
- **L'Instant** : entre minuit et 2h, grace period — les objectifs comptent encore pour la veille
- **Rappels** : notification configurable pour ne pas oublier ses objectifs
- **Historique** : archive complète jour par jour avec statistiques
- **Récap hebdomadaire** : résumé de la semaine avec stats et tendances

---

## Architecture technique

### Stack
| Composant | Technologie |
|-----------|------------|
| Frontend | HTML / CSS / JavaScript vanilla (single-file) |
| Authentification | Firebase Authentication (email/password) |
| Base de données | Cloud Firestore (temps réel) |
| Hébergement | Firebase Hosting |
| Type d'app | PWA (Progressive Web App) |

### Structure du projet
```
levels/
├── index.html          ← Application complète (~9000 lignes)
├── firebase.json       ← Configuration Firebase Hosting
├── .firebaserc         ← Projet Firebase lié (levels-app-f50a9)
├── deploy.sh           ← Script de déploiement avec versioning
└── versions/           ← Historique auto-généré par deploy.sh
```

### Choix d'architecture : single-file
L'ensemble de l'application (CSS + HTML + JavaScript) est contenu dans un seul fichier `index.html`. Ce choix permet :
- Un déploiement simplifié (un seul fichier à servir)
- Zéro étape de build (pas de bundler, pas de transpileur)
- Chargement instantané sans requêtes multiples

### Synchronisation cloud
- **Temps réel** : les données se synchronisent entre appareils via `onSnapshot` Firestore
- **Session unique** : un seul appareil actif à la fois (déconnexion automatique des autres)
- **Anti-conflit** : chaque session a un ID unique, les écritures propres sont ignorées par le listener
- **Debounce** : les sauvegardes cloud sont regroupées (délai 1.4s) pour limiter les écritures Firestore

### Système de dates
L'app utilise un double système de dates :
- **Date calendaire** (`todayKey`) : date réelle pour le stockage et l'affichage
- **Date Levels** (`levelsTodayKey`) : date avec décalage de 2h (avant 2h du matin = encore hier pour le reset)
- **Date effective** (`effectiveDayKey`) : pendant la grace period (0h-2h), les validations comptent pour la veille

---

## Déploiement

### Prérequis
```bash
npm install -g firebase-tools
firebase login
```

### Déployer
```bash
firebase deploy
# ou avec description :
./deploy.sh "description de la mise à jour"
```

### URLs
- **Application** : https://levels-app-f50a9.web.app
- **Console Firebase** : https://console.firebase.google.com/project/levels-app-f50a9

---

## Quotas (plan gratuit Firebase Spark)

| Service | Limite gratuite | Usage estimé |
|---------|----------------|--------------|
| Hosting storage | 10 GB | ~0.2 MB |
| Hosting transfer | 360 MB/jour | ~1800 visites/jour |
| Firestore lectures | 50 000/jour | ~500 utilisateurs actifs |
| Firestore écritures | 20 000/jour | ~500 utilisateurs actifs |
| Authentication | Illimité | ✅ |
