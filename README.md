# PRODUCT-MANAGER_API
[![CI - product-manager-api](https://github.com/CvSi-DeV/product-manager-api/actions/workflows/CI.yml/badge.svg)](https://github.com/CvSi-DeV/product-manager-api/actions/workflows/CI.yml)

## Fonctionnalités
- authentification (token, rbac)
- CRUD sur produits
- persistance sur PostgreSQL

## Stack
- express
- prisma
- PostgreSQL
- jwt
- bcrypt

## Install
```bash 
git clone https://github.com/CvSi-DeV/product-manager-api.git
```

## Pré-requis
- Node.js
- Une base de données PostgreSQL accessible
- Un fichier `.env` à la racine du projet contenant les variables ci-dessous (voir aussi `.env.example`)

## Variables d'Environnement
Les variables suivantes sont **obligatoires** : l'application refuse de démarrer si l'une d'elles est manquante.

| Variable | Obligatoire | Description | Exemple |
|----------|:-----------:|-------------|---------|
| `DATABASE_URL` | ✅ | Chaîne de connexion à la base PostgreSQL (utilisée par Prisma) | `postgresql://USER@localhost:5435/product_manager?schema=public` |
| `JWT_SECRET` | ✅ | Secret de signature des JWT (minimum 32 caractères) | `JSONWEBTOKENSECRET_minimum_32_chars` |
| `JWT_EXPIRES_IN` | ✅ | Durée de validité des tokens | `24h` |
| `ALLOWED_ORIGINS` | ✅ | Origines autorisées pour le CORS, séparées par des virgules | `http://localhost:5173,https://mon-front.app` |
| `SERVER_PORT` | ✅ | Port d'écoute du serveur Express | `3000` |
| `LOCAL_ENV` | ❌ | À définir **uniquement en local** : désactive le flag `secure` des cookies. Ne doit **pas** exister en production. | `local_env` |

## Base de données avec Docker
Un fichier `docker-compose.yml` est fourni pour lancer une base PostgreSQL locale dont les identifiants correspondent à ceux du `.env` (voir `.env.example`).

Démarrer la base :
```bash
docker compose up -d
```

Lancer l'API :
```bash
npm start
```

Autres commandes utiles :
```bash
docker compose ps        # état du conteneur
docker compose logs -f   # suivre les logs
docker compose down      # arrêter la base (données conservées)
docker compose down -v   # arrêter et supprimer les données (repartir de zéro)
```

## Migrations de la base
Lancer `docker compose up -d` puis `npm start` **n'applique pas** les migrations : la base est créée vide. Les migrations doivent être jouées manuellement.

Appliquer les migrations existantes (création des tables `Product` et `User`) :
```bash
npx prisma migrate deploy
```

> `migrate deploy` applique les migrations déjà présentes dans `prisma/migrations/` sans en créer de nouvelles. C'est la commande à utiliser en local après avoir démarré la base, et en production.

En développement, pour créer une nouvelle migration après avoir modifié `prisma/schema.prisma` :
```bash
npx prisma migrate dev --name <nom_de_la_migration>
```

Autres commandes utiles :
```bash
npx prisma migrate status   # état des migrations appliquées
npx prisma studio           # interface web pour explorer les données
```

## Lancer les tests
Les tests sont réalisés avec : 
- Supertest
- Jest

Pour exécuter une session de tests, lancer 
```bash
npm test
```

## Deploiement
L'application est déployée sur [RENDER](https://product-manager-api-uako.onrender.com)