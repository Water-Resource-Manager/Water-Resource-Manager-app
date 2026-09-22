// Définition de la structure standard d'une couche cartographique
export interface MapLayerConfig {
  id: string;
  name: string;
  description?: string;
  type: "points" | "polygons" | "lines";
  sourceUrl: string;
  color: string;
  visibleByDefault: boolean;
}

// Le catalogue de toutes les couches disponibles dans l'application
export const MAP_LAYERS: MapLayerConfig[] = [
  {
    id: "hubeau-piezometrie",
    name: "Réseau Piézométrique (Hub'Eau)",
    description: "Stations nationales de mesure des nappes souterraines.",
    type: "points",
    sourceUrl: "/stations.json",
    color: "#0f766e",
    visibleByDefault: false,
  },

  {
    id: "qualite-nappes",
    name: "Qualité des nappes (Analyses)",
    type: "points",
    sourceUrl: "/stations-qualite.json",
    description: "Stations de prélèvement physico-chimique (ADES/Naïades)",
    color: "#8B5CF6",
    visibleByDefault: false,
  }
];