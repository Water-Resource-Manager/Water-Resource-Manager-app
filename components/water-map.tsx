"use client";

import { useEffect, useState } from "react";
import Map, { NavigationControl, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export type HubEauStationProperties = {
  code_bss: string | null;
  bss_id?: string | null;
  urn_bss?: string | null;
  nom_commune: string | null;
  code_commune_insee?: string | null;
  nom_departement?: string | null;
  code_departement?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  x?: number | null;
  y?: number | null;
  profondeur_investigation: number | null;
  altitude_station?: number | null;
  altitude_repere?: number | null;
  date_debut_mesure?: string | null;
  date_fin_mesure?: string | null;
  nb_mesures_piezo?: number | null;
  date_maj?: string | null;
  [key: string]: any;
};

type WaterMapProps = {
  onStationSelect: (station: HubEauStationProperties) => void;
};

const FRANCE_VIEW = { longitude: 2.2137, latitude: 46.2276, zoom: 5.5 };
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
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

const HUBEAU_STATIONS_URL = "https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/stations?format=geojson&size=1000";

export function WaterMap({ onStationSelect }: WaterMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  // Nouvel état pour surveiller l'API en temps réel
  const [apiStatus, setApiStatus] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    setApiStatus("loading");
    
    // On ajoute 'cache: "no-store"' pour forcer le navigateur et Next.js à récupérer de nouvelles données
    fetch(HUBEAU_STATIONS_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("✅ Données Hub'Eau prêtes !", data.features?.length, "stations trouvées.");
        setGeoData(data);
        setApiStatus("ready");
      })
      .catch((error) => {
        console.error("❌ Erreur de récupération Hub'Eau:", error);
        setApiStatus("error");
      });
  }, []);

  return (
    <div className="absolute inset-0">
      
      {/* Messages d'état superposés à la carte */}
      {apiStatus === "loading" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/90 px-4 py-2 rounded-md shadow-md text-sm font-medium animate-pulse text-gray-700">
          Téléchargement des stations depuis Hub'Eau...
        </div>
      )}
      {apiStatus === "error" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-100 text-red-800 px-4 py-2 rounded-md shadow-md text-sm font-medium border border-red-200">
          Erreur de connexion à l'API Hub'Eau. L'accès est peut-être temporairement limité (attendez 1 minute).
        </div>
      )}

      <Map
        initialViewState={FRANCE_VIEW}
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
        cooperativeGestures={false}
      >
        {geoData?.features?.map((feature: any, index: number) => {
          const coordinates = feature.geometry?.coordinates;
          if (!coordinates) return null;

          return (
            <Marker
              key={feature.properties.code_bss || index}
              longitude={coordinates[0]}
              latitude={coordinates[1]}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                const stationData: HubEauStationProperties = {
                  ...feature.properties,
                  longitude: coordinates[0],
                  latitude: coordinates[1]
                };
                onStationSelect(stationData);
              }}
            >
              <div 
                className="w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-sm cursor-pointer hover:bg-blue-800 hover:scale-125 transition-transform"
                title={feature.properties.nom_commune || "Station"}
              />
            </Marker>
          );
        })}

        <NavigationControl position="bottom-right" showCompass={false} />
      </Map>
    </div>
  );
}