"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Vue initiale centrée sur la France (pas encore de données métier)
const FRANCE_VIEW = {
  longitude: 2.2137,
  latitude: 46.2276,
  zoom: 5.5,
};

// Fond de carte clair, open source (Carto Positron)
const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

export function WaterMap() {
  return (
    <div className="absolute inset-0">
      <Map
        initialViewState={FRANCE_VIEW}
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
        cooperativeGestures={false}
      >
        {/* Zoom en haut à gauche, sous la barre de recherche (voir globals.css) */}
        <NavigationControl position="bottom-right" showCompass={false} />
      </Map>
    </div>
  );
}
