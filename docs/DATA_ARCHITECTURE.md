# Architecture des Données Hub'Eau (POC vs PROD)

Ce document décrit la stratégie de gestion des données du réseau piézométrique Hub'Eau, séparant le référentiel géographique (données "froides") de l'historique des relevés (données "chaudes"), ainsi que la gestion multicouche de la carte.

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
- **Déclenchement** : Uniquement à la demande (au clic sur un marqueur). Requête dynamiquement calculée sur **une année glissante** avec encodage sécurisé de l'identifiant BSS.
- **Objectif** : Ne pas surcharger l'infrastructure avec des millions de séries temporelles, et garantir l'affichage de la valeur la plus récente certifiée par l'État pour les graphiques de tendance (ECharts).

## 3. Gestion des Couches Cartographiques (Layers)

**Architecture Implémentée (Zustand + Config Catalogue)**
- **Catalogue de configuration (`config/map-layers.ts`)** : Fichier centralisant le contrat de données (`MapLayerConfig`). Chaque couche y est déclarée avec son ID, sa source, son type et son design (couleur, visibilité par défaut).
- **Store Global (`store/map-store.ts`)** : Gestionnaire d'état léger (Zustand) pilotant le tableau `activeLayerIds`. Il permet de mémoriser et de modifier l'état des couches de n'importe où dans l'application.
- **Moteur de rendu (`water-map.tsx`)** : Totalement agnostique, le composant carte lit la configuration et le store pour déterminer quelles données instancier et afficher dynamiquement.
- **Sélecteur UI (`layer-selector.tsx`)** : Contrôleur flottant générant automatiquement la liste des options depuis le catalogue, permettant l'activation/désactivation instantanée (sans rechargement réseau) par l'utilisateur.
- **Évolutivité (Cible)** : Cette fondation modulaire est prête pour l'import de données personnalisées (upload GeoJSON par l'utilisateur), qui seront converties à la volée en objet `MapLayerConfig` et poussées dans le store.