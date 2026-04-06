# Guide de déploiement - FATA Kudos

## Prérequis

- Compte Netlify
- Compte Turso (libSQL/SQLite edge database)
- Git (optionnel)

## Étape 1:Configurer la base de données Turso

1. Créer un compte sur [turso.tech](https://turso.tech)
2. Créer une nouvelle base de données:
   - Nom: `fata-kudos`
   - Région: `eu-central-1` (Frankfurt)
3. Créer un token d'API:
   - Settings → API Tokens → Generate New Token
4. copier le token et l'URL de la base de données

## Étape 2:Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet:

```env
TURSO_TOKEN=votre_token_ici
TURSO_URL=libsql://votre_url_ici
```

## Étape 3: Déployer sur Netlify

### Option A: Via CLI Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

### Option B: Via drag & drop

1. Zipper tous les fichiers du projet (sauf node_modules)
2. Aller sur [app.netlify.com](https://app.netlify.com)
3. Drag & drop le fichier zip
4. Configurer les variables d'environnement dans Settings → Environment Variables

### Option C: Via GitHub (recommandé)

1. Initialiser git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Créer un repo GitHub et push:
   ```bash
   git remote add origin https://github.com/votre-repo
   git push -u origin main
   ```

3. Connecter sur Netlify:
   - Sites → Add new site → Import an existing project
   - Choisir GitHub
   - Autoriser l'accès au repo
   - Build command: laisser vide
   - Publish directory: laisser vide

4. Ajouter les variables d'environnement dans Settings → Environment Variables:
   - `TURSO_TOKEN`
   - `TURSO_URL`

## Étape 4: Vérifier le déploiement

1. Ouvrir l'URL Netlify
2. Vérifier que le dashboard se charge
3. Tester la création d'un participant
4. Tester l'attribution de kudos

## Structure des fichiers

```
fata/
├── index.html           # Dashboard
├── attributions.html   # Kudos ambassadeurs
├── responsables.html  # Kudos responsables
├── participants.html  # Gestion participants
├── guide.html       # Guide d'attribution
├── netlify/
│   └── functions/
│       ├── db.js         # Connexion Turso
│       ├── kudos.js      # API kudos
│       ├── participants.js # API participants
│       └── stats.js     # API statistiques
├── netlify.toml      # Config Netlify
├── .env            # Variables (NE PAS COMMITTER)
└── package.json    # Dépendances
```

## Résolution des problèmes

### Erreur 403 CORS
- Vérifier que les functions Netlify utilisent les bons headers CORS

### Erreur Turso connection
- Vérifier les variables d'environnement
- Vérifier que le token n'a pas expiré

### Erreur 404 sur les pages
- Vérifier que le fichier `netlify.toml` est correct

### Erreur de build
- Netlify détecte automatiquement le type de projet
- Pas de build requis (static HTML)