import { create } from "zustand";
import { MAP_LAYERS } from "@/config/map-layers";

type MapState = {
  // Tableau contenant les ID des couches actuellement cochées/actives
  activeLayerIds: string[];
  
  // Fonction pour cocher/décocher une couche
  toggleLayer: (layerId: string) => void;
};

export const useMapStore = create<MapState>((set) => ({
  // Par défaut, on active les couches qui ont "visibleByDefault: true" dans la config
  activeLayerIds: MAP_LAYERS.filter((layer) => layer.visibleByDefault).map((l) => l.id),

  toggleLayer: (layerId) =>
    set((state) => {
      const isAlreadyActive = state.activeLayerIds.includes(layerId);
      if (isAlreadyActive) {
        // Si elle est active, on la retire
        return { activeLayerIds: state.activeLayerIds.filter((id) => id !== layerId) };
      } else {
        // Sinon, on l'ajoute
        return { activeLayerIds: [...state.activeLayerIds, layerId] };
      }
    }),
}));