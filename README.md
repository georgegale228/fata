# FATA Kudos

Application web légère de gestion des Kudos ambassadeurs.

## Stack technique

- **Frontend**: HTML + Tailwind CSS (CDN) + JS vanilla
- **Backend**: Netlify Functions (Node.js)
- **Base de données**: Turso (SQLite edge)

## Installation locale

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Créer le fichier `.env` à partir de `.env.example` et ajouter vos identifiants Turso

3. Lancer le serveur local :
   ```bash
   npm run dev
   ```

## Structure du projet

```
fata-kudos/
├── index.html              ← Dashboard
├── attributions.html       ← Saisie kudos ambassadeurs
├── responsables.html       ← Saisie kudos responsables
├── participants.html       ← Gestion participants
├── netlify.toml            ← Config Netlify
├── netlify/
│   └── functions/          ← API backend
└── package.json
```

## Déploiement

1. Créer la base Turso :
   ```bash
   npm install -g @turso/cli
   turso auth login
   turso db create fata-kudos
   turso db shell fata-kudos
   ```

2. Coller le schéma SQL (voir ci-dessous)

3. Connecter Netlify au repo GitHub

4. Ajouter les variables d'environnement `TURSO_URL` et `TURSO_TOKEN` dans Netlify

## Schéma de la base de données

```sql
CREATE TABLE participants (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nom       TEXT NOT NULL,
  prenoms   TEXT NOT NULL,
  sexe      TEXT CHECK(sexe IN ('M','F')),
  pseudo    TEXT UNIQUE NOT NULL,
  email     TEXT,
  ecole     TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE kudos_ambassadeurs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,
  pseudo      TEXT NOT NULL,
  kudos       INTEGER NOT NULL,
  semaine_iso TEXT,
  commentaire TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (pseudo) REFERENCES participants(pseudo)
);

CREATE TABLE kudos_responsables (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,
  pseudo      TEXT NOT NULL,
  kudos       INTEGER NOT NULL,
  semaine_iso TEXT,
  commentaire TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);
```