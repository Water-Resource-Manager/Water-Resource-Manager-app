"use client";

import { useState } from "react";
import { WaterMap } from "@/components/water-map"; // Adapte le chemin si besoin
import { AssetSidePanel, type SelectedFeature } from "@/components/map/asset-side-panel";

export default function MapPage() {
  // L'état qui stocke l'élément cliqué et sa couche d'origine
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      
      {/* Conteneur principal de la carte */}
      <div className="relative flex-1">
        <WaterMap onFeatureSelect={setSelectedFeature} />
      </div>
      
      {/* Panneau latéral dynamique de droite */}
      <AssetSidePanel 
        feature={selectedFeature} 
        onClose={() => setSelectedFeature(null)} 
      />
      
    </div>
  );
}