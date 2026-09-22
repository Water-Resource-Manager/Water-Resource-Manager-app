#!/bin/bash

echo "🚀 Création des labels d'historique..."
gh label create "phase-1-fondations" --color "B60205" --description "Socle technique et carte" -f
gh label create "phase-2-multicouche" --color "D93F0B" --description "Architecture et temps réel" -f

# Petite fonction magique pour créer et fermer un ticket immédiatement
create_and_close() {
  echo "⏳ Création de : $1..."
  # On crée le ticket et on récupère son URL
  ISSUE_URL=$(gh issue create --title "$1" --body "$2" --label "$3")
  
  # On ferme immédiatement le ticket avec le statut "completed"
  gh issue close "$ISSUE_URL" -r "completed"
  echo "✅ Terminé : $ISSUE_URL"
}

echo "🧱 Injection de la Phase 1 (Fondations)..."
create_and_close "Initialisation de l'environnement" "Mise en place de Next.js 16, Tailwind v4 et structure de base." "phase-1-fondations"
create_and_close "Layout principal (AppShell)" "Création de la structure globale et du menu de navigation." "phase-1-fondations"
create_and_close "Intégration de MapLibre GL" "Affichage de la carte de base avec les tuiles raster OpenStreetMap." "phase-1-fondations"
create_and_close "Clustering des stations" "Implémentation de supercluster pour gérer 20 000 points de manière fluide." "phase-1-fondations"
create_and_close "Script d'aspiration Hub'Eau" "Génération du référentiel local stations.json (données géographiques froides)." "phase-1-fondations"

echo "⚡ Injection de la Phase 2 (Architecture Multicouche)..."
create_and_close "Store global (Zustand)" "Mise en place d'un state manager pour piloter la carte de l'extérieur." "phase-2-multicouche"
create_and_close "Sélecteur de couches dynamique" "Interface flottante pour activer/désactiver les réseaux de mesure." "phase-2-multicouche"
create_and_close "Sidebar repliable" "Refonte de la navigation pour éviter les vibrations et redimensionnements de la carte." "phase-2-multicouche"
create_and_close "Routeur de données (AssetSidePanel)" "Panneau latéral intelligent s'adaptant automatiquement à la couche cliquée." "phase-2-multicouche"
create_and_close "Connexion API temps réel" "Appel dynamique à Hub'Eau pour récupérer la chronique sur 1 an glissant au clic." "phase-2-multicouche"
create_and_close "Intégration ECharts" "Composant Sparkline pour visualiser la tendance directement dans le panneau." "phase-2-multicouche"

echo "🎉 Historique injecté avec succès !"