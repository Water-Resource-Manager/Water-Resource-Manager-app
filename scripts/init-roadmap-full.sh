#!/bin/bash

echo "🚀 Création des labels de la roadmap..."
gh label create "phase-3-sig" --color "0E8A16" --description "Enrichissement SIG & Filtres" -f
gh label create "phase-4-analytics" --color "0052CC" --description "Analytique et Tableaux de bord" -f
gh label create "phase-5-ia" --color "8250DF" --description "Intelligence Artificielle & Prédictions" -f
gh label create "phase-6-production" --color "1D76DB" --description "Industrialisation et Déploiement" -f

# On récupère tous les titres des tickets actuellement ouverts pour éviter les doublons
EXISTING_ISSUES=$(gh issue list --limit 100 --json title -q '.[].title')

create_if_not_exists() {
  TITLE="$1"
  BODY="$2"
  LABEL="$3"

  # On vérifie si le titre exact est présent dans la liste des tickets existants
  if echo "$EXISTING_ISSUES" | grep -Fqx "$TITLE"; then
    echo "⏭️  Ignoré (existe déjà) : $TITLE"
  else
    echo "⏳ Création : $TITLE..."
    gh issue create --title "$TITLE" --body "$BODY" --label "$LABEL"
  fi
}

echo ""
echo "🗺️ Injection des tickets Phase 3 (SIG & Couches)..."
create_if_not_exists "Ajouter la couche Hydrométrie (Cours d'eau)" "Intégrer les stations de jaugeage des rivières dans config/map-layers.ts avec un template dédié." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Qualité de l'eau (Naïades)" "Intégrer les stations de mesure physico-chimique." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Pluviométrie / Météo" "Connecter l'API Météo-France pour superposer les précipitations." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Eaux Souterraines" "Afficher les polygones des masses d'eau souterraine (aquifères)." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Périmètres de protection" "Afficher les aires d'alimentation de captages (AAC) et périmètres de protection." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Bassins Versants" "Délimitation hydrographique et typologie des bassins." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Arrêtés Sécheresse" "Intégrer les zones d'alerte (VigiEau / Propluvia) et les niveaux de restriction en cours." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Sites Industriels (ICPE)" "Afficher les installations classées et points de rejets potentiels." "enhancement,phase-3-sig"
create_if_not_exists "Ajouter la couche Parcelles Agricoles (RPG)" "Intégrer le Registre Parcellaire Graphique pour évaluer la pression agricole." "enhancement,phase-3-sig"
create_if_not_exists "Import de couches GeoJSON personnalisées" "Outil de glisser-déposer pour permettre à l'utilisateur d'afficher ses propres fichiers spatiaux." "enhancement,phase-3-sig"
create_if_not_exists "Moteur de recherche géographique" "Recherche par commune, département ou code BSS avec centrage de la carte." "enhancement,phase-3-sig"
create_if_not_exists "Filtrage avancé des stations" "Panneau de filtres dynamiques (ex: nappes en baisse, seuils de crise)." "enhancement,phase-3-sig"

echo ""
echo "📊 Injection des tickets Phase 4 (Analytics)..."
create_if_not_exists "Créer le squelette de la page /analytics" "Développer le layout de la page d'analyse temporelle avec une grille de graphiques." "enhancement,phase-4-analytics"
create_if_not_exists "Intégrer ECharts multi-séries" "Comparaison de plusieurs chroniques piézométriques sur un même graphique interactif." "enhancement,phase-4-analytics"
create_if_not_exists "Historique long terme et corrélation pluie/nappe" "Charger les données sur 10-20 ans et superposer les histogrammes de pluviométrie." "enhancement,phase-4-analytics"
create_if_not_exists "Dynamiser les KPI du tableau de bord" "Remplacer les chiffres statiques de l'accueil par des métriques calculées en direct." "enhancement,phase-4-analytics"
create_if_not_exists "Créer la vue Synoptique (/synoptic)" "Interface schématique des interconnexions (aquifères, forages, usines)." "enhancement,phase-4-analytics"
create_if_not_exists "Fonctionnalité d'export des données" "Export des séries temporelles en CSV et des graphiques en PDF." "enhancement,phase-4-analytics"

echo ""
echo "🧠 Injection des tickets Phase 5 (Intelligence Artificielle)..."
create_if_not_exists "Créer la page Prédictions IA (/predictions)" "Mettre en place le layout pour le tableau de bord d'anticipation." "enhancement,phase-5-ia"
create_if_not_exists "Intégrer un modèle prédictif de niveau de nappe" "Projection à 3 ou 6 mois du niveau d'eau en croisant historique et prévisions météo." "enhancement,phase-5-ia"
create_if_not_exists "Affichage des intervalles de confiance" "Représenter visuellement l'incertitude des prédictions IA sur les graphiques." "enhancement,phase-5-ia"
create_if_not_exists "Génération de synthèses textuelles par LLM" "Générer un bulletin hydrologique automatisé (résumé de la situation du bassin)." "enhancement,phase-5-ia"

echo ""
echo "⚙️ Injection des tickets Phase 6 (Production)..."
create_if_not_exists "Migration vers base de données spatiale (PostGIS)" "Remplacer stations.json par une base PostgreSQL avec l'extension PostGIS." "enhancement,phase-6-production"
create_if_not_exists "Création du pipeline ETL (Synchronisation)" "Script Cron serveur pour mettre à jour la BDD avec l'API Hub'Eau périodiquement." "enhancement,phase-6-production"
create_if_not_exists "Création des API Routes internes" "Développer les routes backend dans Next.js pour interroger la base PostgreSQL." "enhancement,phase-6-production"
create_if_not_exists "Mise en place de l'authentification" "Intégrer Auth.js (NextAuth) pour la gestion des comptes et rôles." "enhancement,phase-6-production"
create_if_not_exists "Espaces de travail privés (Workspaces)" "Permettre de sauvegarder ses propres vues, favoris et calques importés." "enhancement,phase-6-production"
create_if_not_exists "Interface d'administration (/settings)" "Panneau de configuration pour gérer l'état de l'application et les accès." "enhancement,phase-6-production"
create_if_not_exists "CI/CD et Tests automatisés" "Mettre en place Jest, Playwright et un déploiement continu automatisé." "enhancement,phase-6-production"

echo ""
echo "✅ Roadmap synchronisée avec succès ! Les doublons ont été ignorés."