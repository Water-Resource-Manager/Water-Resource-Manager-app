"use client";

import { Layers } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { MAP_LAYERS } from "@/config/map-layers";

export function LayerSelector() {
  const { activeLayerIds, toggleLayer } = useMapStore();

  return (
    <div className="absolute top-4 right-4 z-10 w-72 rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <Layers className="h-5 w-5 text-teal-700" />
        <h3 className="text-sm font-semibold text-slate-800">Couches cartographiques</h3>
      </div>
      
      <div className="space-y-3">
        {MAP_LAYERS.map((layer) => (
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
  );
}