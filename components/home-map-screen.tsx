"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { MapInterface } from "@/components/map-interface";
import type { HubEauStationProperties } from "@/components/water-map";

// Chargé uniquement dans le navigateur : MapLibre ne fonctionne pas côté serveur
const WaterMap = dynamic(
  () => import("@/components/water-map").then((module) => module.WaterMap),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-muted" />,
  },
);

export function HomeMapScreen() {
  const [selectedStation, setSelectedStation] =
    useState<HubEauStationProperties | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStationSelect = (station: HubEauStationProperties) => {
    setSelectedStation(station);
    setIsDetailsOpen(true);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <h1 className="sr-only">Water Resource Manager</h1>
      <WaterMap onStationSelect={handleStationSelect} />
      <MapInterface
        selectedStation={selectedStation}
        isDetailsOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </main>
  );
}
