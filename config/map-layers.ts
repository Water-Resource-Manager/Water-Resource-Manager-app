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
    sourceUrl: "/stations.json", // Notre fichier local mocké
    color: "#0f766e", // Le "teal-700" de notre UI
    visibleByDefault: true,
  },
  // Exemple d'une future couche que nous pourrions ajouter plus tard :
  // {
  //   id: "bassins-versants",
  //   name: "Bassins Versants",
  //   type: "polygons",
  //   sourceUrl: "/api/bassins",
  //   color: "#3b82f6",
  //   visibleByDefault: false,
  // }
];