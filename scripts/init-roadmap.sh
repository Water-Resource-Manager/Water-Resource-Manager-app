#!/bin/bash

echo "🚀 Création des labels personnalisés..."
gh label create "phase-3-sig" --color "0E8A16" --description "Enrichissement SIG & Filtres" -f
gh label create "phase-4-analytics" --color "0052CC" --description "Analytique et Tableaux de bord" -f

echo "🗺️ Injection des tickets Phase 3 (SIG)..."
gh issue create --title "Ajouter la couche Hydrométrie (Cours d'eau)" --body "Intégrer les stations hydrométriques dans config/map-layers.ts pour croiser les données avec les nappes souterraines." --label "enhancement,phase-3-sig"
gh issue create --title "Ajouter une barre de recherche" --body "Permettre de chercher une commune ou un code BSS et centrer la carte dessus." --label "enhancement,phase-3-sig"

echo "📊 Injection des tickets Phase 4 (Analytics)..."
gh issue create --title "Créer le squelette de la page /analytics" --body "Mettre en place le layout de la page d'analyse temporelle." --label "enhancement,phase-4-analytics"
gh issue create --title "Intégrer ECharts multi-séries sur /analytics" --body "Permettre la comparaison de plusieurs chroniques piézométriques sur un même graphique." --label "enhancement,phase-4-analytics"
gh issue create --title "Dynamiser les KPI du tableau de bord" --body "Remplacer les données codées en dur sur la page racine par des agrégats issus du store." --label "enhancement,phase-4-analytics"

echo "✅ Roadmap injectée avec succès dans GitHub !"