import { create } from 'zustand';

export type FavoriteStation = {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
};

type FavoritesStore = {
  favorites: FavoriteStation[];
  isLoaded: boolean;
  // Nouvelles méthodes synchronisées avec l'API
  fetchFavorites: () => Promise<void>;
  addFavorite: (station: FavoriteStation) => Promise<void>;
  removeFavorite: (id: string) => void; // void car optimistic update
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  isLoaded: false,

  fetchFavorites: async () => {
    if (get().isLoaded) return;
    
    try {
      const res = await fetch('/api/users/me/favorites');
      
      // On vérifie que la réponse du serveur est un succès (Code 200)
      if (!res.ok) {
        throw new Error(`Erreur serveur HTTP ${res.status}`);
      }

      // On lit le texte brut d'abord pour éviter l'erreur de parse si c'est vide
      const text = await res.text();
      if (!text) return; 

      const data = JSON.parse(text);
      set({ favorites: data, isLoaded: true });
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error);
    }
  },

  addFavorite: async (station) => {
    const prevFavorites = get().favorites;
    
    // Optimistic UI : On met à jour l'interface instantanément
    if (!prevFavorites.find(f => f.id === station.id)) {
      set({ favorites: [...prevFavorites, station] });
    }

    // Appel API en arrière-plan
    try {
      await fetch('/api/users/me/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(station),
      });
    } catch (error) {
      console.error("Erreur d'ajout", error);
      set({ favorites: prevFavorites }); // Rollback en cas d'erreur
    }
  },

  removeFavorite: async (id) => {
    const prevFavorites = get().favorites;
    
    // Optimistic UI
    set({ favorites: prevFavorites.filter(f => f.id !== id) });

    // Appel API en arrière-plan
    try {
      await fetch(`/api/users/me/favorites?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Erreur de suppression", error);
      set({ favorites: prevFavorites }); // Rollback
    }
  }
}));