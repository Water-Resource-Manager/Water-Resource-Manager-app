"use client";

import { useState, useRef, useEffect } from "react";
import { Layers, X } from "lucide-react";
import { useMapStore } from "@/store/map-store";

export function LayerSelector() {
  // 1. On récupère layers et fetchLayers depuis le store (BFF)
  const { activeLayerIds, toggleLayer, layers, fetchLayers } = useMapStore();
  
  // État pour gérer l'ouverture/fermeture du panneau (fermé par défaut)
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. On charge les couches au montage du composant
  useEffect(() => {
    fetchLayers();
  }, [fetchLayers]);

  // Ferme le panneau si l'utilisateur clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="absolute top-4 right-4 z-10 flex flex-col items-end">
      {/* Bouton de bascule (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 shadow-md backdrop-blur transition-all hover:bg-slate-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        aria-label="Gérer les couches"
        title="Couches cartographiques"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-slate-600 transition-transform duration-200" />
        ) : (
          <Layers className="h-5 w-5 text-teal-700 transition-transform duration-200 hover:scale-110" />
        )}
      </button>

      {/* Panneau déroulant */}
      {isOpen && (
        <div className="mt-2 w-72 origin-top-right animate-in fade-in zoom-in-95 rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="h-5 w-5 text-teal-700" />
            <h3 className="text-sm font-semibold text-slate-800">Couches cartographiques</h3>
          </div>
          
          <div className="space-y-3">
            {/* 3. On utilise "layers" de l'API à la place de "MAP_LAYERS" statique */}
            {layers.map((layer) => (
              <label 
                key={layer.id} 
                className="group flex cursor-pointer items-start gap-3"
              >
                <div className="relative mt-0.5 flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={activeLayerIds.includes(layer.id)}
                    onChange={() => toggleLayer(layer.id)}
                  />
                  <div className="h-4 w-4 rounded border border-slate-300 bg-white transition-colors peer-checked:border-teal-600 peer-checked:bg-teal-600"></div>
                  <svg
                    className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 transition-colors group-hover:text-teal-800">
                    {layer.name}
                  </p>
                  {layer.description && (
                    <p className="mt-0.5 text-xs leading-tight text-slate-500">
                      {layer.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}