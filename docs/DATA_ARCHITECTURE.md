# Architecture des Données Hub'Eau (POC vs PROD)

Ce document décrit la stratégie de gestion des données du réseau piézométrique Hub'Eau, séparant le référentiel géographique (données "froides") de l'historique des relevés (données "chaudes").

## 1. Référentiel des Stations (Données Froides)

**État Actuel (Phase POC - Environnement de développement)**
- **Méthode** : Fichier statique local (`public/stations.json`).
- **Génération** : Exécution manuelle du script `download-stations.mjs` qui pagine l'API Hub'Eau pour récupérer ~20 000 stations.
- **Objectif** : Avoir une carte ultra-fluide grâce à `supercluster` sans saturer l'API de l'État à chaque redémarrage du serveur local (Hot Reload).

**Objectif Cible (Phase de Production)**
- **Stockage** : Base de données persistante (ex: PostgreSQL).
- **Synchronisation (CRON)** : Un script ETL tournera 1 fois par mois pour :
  - Télécharger l'intégralité du réseau (Pagination jusqu'à ~53 000 stations).
  - Identifier et insérer les nouveaux ouvrages.
  - Conserver les anciens ouvrages disparus de l'API en les marquant avec un `statut: "fermé"` (Soft Delete) pour préserver l'historique de la ressource.
- **Distribution** : Une route d'API interne Next.js (`/api/stations`) avec un cache ISR (Incremental Static Regeneration) de 30 jours, servant la carte instantanément.

## 2. Chroniques et Mesures (Données Chaudes)

**État Actuel & Cible (POC et Production)**
- **Méthode** : Appels directs à l'API Hub'Eau (`/api/v1/niveaux_nappes/chroniques`).
- **Déclenchement** : Uniquement à la demande (au clic sur un marqueur de la carte ou à l'ouverture de la page d'analyse).
- **Objectif** : Ne pas surcharger notre infrastructure avec des millions de séries temporelles, et garantir l'affichage de la valeur la plus récente certifiée par l'État.