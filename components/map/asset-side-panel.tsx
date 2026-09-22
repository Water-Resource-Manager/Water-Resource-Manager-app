"use client";

import { Map, MousePointerClick } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { MAP_LAYERS } from "@/config/map-layers";
import { PiezometerTemplate } from "@/components/map/templates/piezometer-template";

// Nouvelle définition générique d'un objet cliqué
export type SelectedFeature = {
  layerId: string;
  properties: any;
};

type AssetSidePanelProps = {
  feature: SelectedFeature | null;
  onClose: () => void;
};

export function AssetSidePanel({ feature, onClose }: AssetSidePanelProps) {
  const { activeLayerIds } = useMapStore();

  // --- ÉTAT 1 : UN ÉLÉMENT EST SÉLECTIONNÉ (ROUTAGE) ---
  if (feature) {
    return (
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 backdrop-blur z-20 h-full overflow-hidden">
        {/* Le switch permet de charger un design différent selon la couche cliquée */}
        {feature.layerId === "hubeau-piezometrie" ? (
          <PiezometerTemplate data={feature.properties} onClose={onClose} />
        ) : (
          <div className="p-5 text-sm text-slate-500 text-center mt-10">
            Aucun template défini pour cette couche.
          </div>
        )}
      </aside>
    );
  }

  // --- ÉTAT 2 : AUCUNE COUCHE ACTIVE ---
  if (activeLayerIds.length === 0) {
    return (
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 p-8 backdrop-blur z-20 h-full justify-center items-center text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Map className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Explorateur de données</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Aucune donnée affichée. Choisissez un élement à afficher grâce au sélecteur de couches en haut à droite de la carte.
        </p>
      </aside>
    );
  }

  // --- ÉTAT 3 : ATTENTE DE CLIC (1 ou plusieurs couches actives) ---
  const activeLayersDetails = MAP_LAYERS.filter(l => activeLayerIds.includes(l.id));

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 p-8 backdrop-blur z-20 h-full justify-center items-center text-center">
      <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 transition-transform hover:scale-105">
        <MousePointerClick className="h-8 w-8 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        {activeLayerIds.length === 1 ? activeLayersDetails[0].name : "Analyse multicouche"}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {activeLayerIds.length === 1 
          ? "Sélectionnez une station sur la carte pour consulter ses relevés et sa chronique temporelle."
          : `${activeLayerIds.length} couches actives. Cliquez sur un élément de la carte pour en afficher les détails.`}
      </p>
      
      {/* Affichage de "puces" de couleur si plusieurs couches sont actives */}
      {activeLayerIds.length > 1 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {activeLayersDetails.map(layer => (
            <span key={layer.id} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }}></span>
              {layer.name}
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}