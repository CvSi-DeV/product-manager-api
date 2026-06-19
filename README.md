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

## Variables d'Environnement
Les variables d'environnement nécessaires au fonctionnement de l'API sont à créer dans un fichier .env. voir le fichier .env.example.

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