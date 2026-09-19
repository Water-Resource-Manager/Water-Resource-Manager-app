# Water Resource Manager

HydroManager est une application web open source de suivi de la ressource en eau. Elle propose un tableau de bord et une carte SIG permettant d'explorer les stations piézométriques du réseau Hub'Eau, de consulter leurs caractéristiques et de préparer le suivi des nappes, des sécheresses et du changement climatique.

Le dépôt est actuellement un POC orienté carte. La source de vérité géographique est un export GeoJSON local de 20 000 stations, tandis que l'architecture cible prévoit une synchronisation persistante et des appels à la demande pour les chroniques de mesures.

## État actuel

Fonctionnel :

- tableau de bord accessible à `/` ;
- carte nationale accessible à `/map` ;
- chargement du référentiel local `public/stations.json` ;
- regroupement dynamique des stations avec `supercluster` ;
- zoom sur un groupe de stations ;
- sélection d'une station et consultation de ses informations Hub'Eau ;
- lien vers la fiche technique nationale ADES quand `urn_bss` est disponible.

Prévu mais pas encore implémenté dans ce dépôt :

- analyse temporelle à `/analytics` ;
- prédictions IA à `/predictions` ;
- vue synoptique à `/synoptic` ;
- configuration d'administration à `/admin/config` ;
- récupération et affichage des chroniques `/api/v1/niveaux_nappes/chroniques` ;
- recherche réellement connectée au filtrage des stations.

Les liens vers ces écrans sont déjà présents dans la navigation ou dans les fiches de station. Ils doivent être considérés comme des points d'extension, pas comme des fonctionnalités disponibles aujourd'hui.

## Démarrage rapide

### Prérequis

- Node.js compatible avec Next.js 16 ;
- npm ;
- accès réseau pour charger les tuiles OpenStreetMap et, si nécessaire, régénérer les stations Hub'Eau.

### Installation

```bash
npm install
```

### Serveur de développement

```bash
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

### Vérifications et production

```bash
# Vérifier le code avec ESLint
npm run lint

# Construire l'application Next.js
npm run build

# Démarrer la build de production
npm run start
```

Il n'y a pas encore de suite de tests automatisés ni de script `test` dans `package.json`.

## Architecture du projet

```text
app/
	layout.tsx              Layout racine, métadonnées et AppShell
	page.tsx                Tableau de bord `/`
	map/page.tsx            Écran carte `/map` et état de la station sélectionnée
	globals.css             Tailwind, thème et styles MapLibre
components/
	layout/app-shell.tsx    Navigation latérale commune
	water-map.tsx           Carte MapLibre, chargement GeoJSON et clustering
	map/asset-side-panel.tsx
													Panneau permanent de détails sur `/map`
	home-map-screen.tsx     Variante de carte avec recherche et Sheet
	map-interface.tsx       Interface de recherche et Sheet associée
	ui/                     Composants UI réutilisables (Button, Input, Sheet)
lib/utils.ts              Utilitaire `cn`
public/stations.json      Export GeoJSON local des stations (POC)
download-stations.mjs     Script de téléchargement depuis l'API Hub'Eau
docs/
	DATA_ARCHITECTURE.md    Choix POC/production pour les données
```

Les alias TypeScript `@/*` pointent vers la racine du projet. Les composants qui utilisent MapLibre ou l'état React sont des composants client (`"use client"`).

## Fonctionnement de la carte

`components/water-map.tsx` réalise les opérations suivantes :

1. charge `/stations.json` côté navigateur avec `fetch` ;
2. initialise `Supercluster` avec un rayon de 50 pixels et un zoom maximal de 14 ;
3. recalcule les points visibles à partir des limites et du niveau de zoom de la carte ;
4. affiche les groupes sous forme de cercles cliquables ;
5. affiche les stations individuelles sous forme de marqueurs ;
6. transmet la station sélectionnée au composant parent.

La carte utilise `react-map-gl/maplibre` et un style raster OpenStreetMap défini directement dans le composant. Les tuiles sont chargées depuis `a.tile.openstreetmap.org` ; l'attribution OpenStreetMap doit rester visible et respecter les conditions du service utilisé.

La page `/map` transmet la station choisie à `AssetSidePanel`, qui présente :

- l'identification BSS et l'identifiant BSS ;
- la commune, le département et les coordonnées ;
- la profondeur et les altitudes ;
- les dates de couverture et le nombre de mesures ;
- un lien vers la fiche ADES ;
- un lien futur vers la chronique historique.

## Données Hub'Eau

### Référentiel des stations

Le fichier `public/stations.json` est un `FeatureCollection` GeoJSON. Chaque entité est un point et contient notamment les propriétés suivantes :

| Propriété | Rôle |
| --- | --- |
| `code_bss` | Code de la station dans le référentiel BSS |
| `bss_id` | Identifiant BSS unique |
| `urn_bss` | Lien vers la fiche technique ADES |
| `nom_commune`, `nom_departement` | Localisation administrative |
| `longitude`, `latitude` | Coordonnées éventuellement présentes dans les propriétés |
| `profondeur_investigation` | Profondeur d'investigation en mètres |
| `altitude_station`, `altitude_repere` | Altitudes en mètres NGF |
| `date_debut_mesure`, `date_fin_mesure` | Bornes de la couverture temporelle |
| `nb_mesures_piezo` | Nombre de relevés piézométriques |
| `date_maj` | Date de mise à jour de la station |

Les coordonnées utilisées pour le rendu proviennent de `feature.geometry.coordinates`. Les propriétés peuvent être absentes ou nulles : l'interface doit conserver un affichage explicite des valeurs non renseignées.

### Régénérer l'export local

Le script `download-stations.mjs` appelle :

```text
https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/stations?format=geojson&size=20000
```

Il parcourt les pages jusqu'à recevoir moins de 20 000 entités, puis réécrit `public/stations.json`.

```bash
node download-stations.mjs
```

Le fichier est volontairement ignoré par Git selon `.gitignore`, même si une copie est fournie dans l'arborescence de travail pour le POC. Après une régénération, vérifier le nombre d'entités, la structure GeoJSON et la taille du fichier avant de partager le résultat.

### Données chaudes et cible de production

Le détail de la stratégie est décrit dans [docs/DATA_ARCHITECTURE.md](docs/DATA_ARCHITECTURE.md). En résumé :

- le POC conserve le référentiel géographique local pour éviter de solliciter l'API à chaque rechargement ;
- les chroniques doivent être récupérées à la demande auprès de Hub'Eau ;
- en production, un ETL mensuel devrait synchroniser une base persistante, conserver les stations disparues en soft delete et exposer une route interne `/api/stations` avec un cache ISR de 30 jours.

## Technologies

- Next.js 16 avec App Router ;
- React 19 et TypeScript strict ;
- Tailwind CSS 4 et `tw-animate-css` ;
- composants UI Base UI, selon la configuration shadcn/ui ;
- Lucide React pour les icônes ;
- MapLibre GL via `react-map-gl` ;
- `supercluster` pour le regroupement géospatial ;
- ECharts et `echarts-for-react`, installés pour les futures vues analytiques ;
- API publique Hub'Eau / Eaufrance pour les données de stations et les futures chroniques.

## Contribuer

1. Créer une branche dédiée depuis la branche de travail courante.
2. Installer les dépendances avec `npm install`.
3. Lire [docs/DATA_ARCHITECTURE.md](docs/DATA_ARCHITECTURE.md) avant de modifier le modèle ou le chargement des données.
4. Conserver les types de station compatibles avec `HubEauStationProperties` ou les faire évoluer avec les composants consommateurs.
5. Lancer `npm run lint` et `npm run build` avant d'ouvrir une proposition de changement.
6. Décrire dans la proposition les modifications d'interface, les sources de données utilisées et les limites connues.

Pour ajouter une nouvelle page, créer un dossier sous `app/` avec un `page.tsx`, puis ajouter son entrée dans `NAV` dans `components/layout/app-shell.tsx` si elle doit apparaître dans la navigation. Pour une fonctionnalité qui dépend de MapLibre, garder le code navigateur dans un composant client et éviter le rendu serveur de la carte.

## Points d'attention

- L'API Hub'Eau et les tuiles OpenStreetMap sont des services externes : le chargement peut échouer ou être limité sans connexion réseau.
- Le référentiel local n'est pas une base de données et ne fournit pas de versionnement applicatif des stations.
- Le statut affiché sur le tableau de bord est actuellement statique ; il ne reflète pas encore un contrôle de disponibilité du réseau.
- La carte désactive le cache navigateur lors du chargement de `stations.json` (`cache: "no-store"`) et reconstruit le cluster lorsque les données changent.
- Aucun secret, aucune variable d'environnement et aucun backend applicatif ne sont nécessaires pour exécuter le POC actuel.

## Licence

Voir [LICENSE](LICENSE). Les données et services externes restent soumis à leurs propres conditions d'utilisation et attributions, notamment Hub'Eau/Eaufrance et OpenStreetMap.
