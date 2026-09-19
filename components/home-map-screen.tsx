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
      <div className="pointer-events-none absolute inset-0 hydro-pattern opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(153,246,228,0.45),_transparent_36%),radial-gradient(ellipse_at_bottom_right,_rgba(191,219,254,0.42),_transparent_42%)]" />

      <div className="pointer-events-none absolute left-5 top-5 z-20 max-w-sm rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-700/80">
          DSP Eau Vallée de l&apos;Orb
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-teal-950 sm:text-4xl"
        >
          HydroManager
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Suivi des nappes et stations hydrométriques en temps réel.
        </p>
      </div>

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
