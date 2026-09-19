"use client";

import { useState } from "react";
import { WaterMap, type HubEauStationProperties } from "@/components/water-map";
import { AssetSidePanel } from "@/components/map/asset-side-panel";

export default function MapPage() {
  const [selectedStation, setSelectedStation] = useState<HubEauStationProperties | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative flex-1 h-full">
        <WaterMap onStationSelect={(station) => setSelectedStation(station)} />
      </div>
      <AssetSidePanel
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  );
}