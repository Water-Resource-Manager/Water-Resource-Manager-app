"use client";

import dynamic from "next/dynamic";

import { MapInterface } from "@/components/map-interface";

// Chargé uniquement dans le navigateur : MapLibre ne fonctionne pas côté serveur
const WaterMap = dynamic(
  () => import("@/components/water-map").then((module) => module.WaterMap),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-muted" />,
  },
);

export function HomeMapScreen() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <h1 className="sr-only">Water Resource Manager</h1>
      <WaterMap />
      <MapInterface />
    </main>
  );
}
