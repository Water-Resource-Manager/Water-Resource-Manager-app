import { create } from 'zustand';

export type LayerConfig = {
  id: string;
  name: string;
  description?: string;
  color: string;
  sourceUrl?: string;
};

type MapStore = {
  activeLayerIds: string[];
  layers: LayerConfig[];
  isLayersLoaded: boolean;
  toggleLayer: (layerId: string) => void;
  fetchLayers: () => Promise<void>;
};

export const useMapStore = create<MapStore>((set, get) => ({
  activeLayerIds: ['hubeau-piezometrie'], // On active la piézométrie par défaut
  layers: [],
  isLayersLoaded: false,

  toggleLayer: (layerId) =>
    set((state) => ({
      activeLayerIds: state.activeLayerIds.includes(layerId)
        ? state.activeLayerIds.filter((id) => id !== layerId)
        : [...state.activeLayerIds, layerId],
    })),

  // Nouvelle méthode pour appeler l'API
  fetchLayers: async () => {
    if (get().isLayersLoaded) return;
    try {
      const res = await fetch('/api/config/layers');
      if (!res.ok) throw new Error("Erreur réseau");
      
      const data = await res.json();
      set({ layers: data, isLayersLoaded: true });
    } catch (error) {
      console.error("Erreur lors du chargement des couches:", error);
    }
  }
}));