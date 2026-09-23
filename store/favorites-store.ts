import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FavoriteStation = {
  id: string;
  name: string;
  type: 'piezometrie' | 'qualite-nappes';
  coordinates: [number, number]; // Très utile pour le bouton "Centrer sur la carte" du futur tableau de bord
};

type FavoritesState = {
  favorites: FavoriteStation[];
  addFavorite: (station: FavoriteStation) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (station: FavoriteStation) => void;
  isFavorite: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (station) => set((state) => {
        // On évite les doublons
        if (state.favorites.some((f) => f.id === station.id)) return state;
        return { favorites: [...state.favorites, station] };
      }),
      
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== id)
      })),
      
      toggleFavorite: (station) => set((state) => {
        const exists = state.favorites.some((f) => f.id === station.id);
        if (exists) {
          return { favorites: state.favorites.filter((f) => f.id !== station.id) };
        }
        return { favorites: [...state.favorites, station] };
      }),
      
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
    }),
    {
      name: 'hydro-favorites-storage', // Le nom de la clé dans le localStorage
    }
  )
);