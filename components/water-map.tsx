"use client";

import { useEffect, useState } from "react";
import Map, { NavigationControl, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Mise à jour du typage avec toutes tes spécifications métier
export type HubEauStationProperties = {
  // Identification
  code_bss: string | null;
  bss_id?: string | null;
  urn_bss?: string | null;
  
  // Localisation
  nom_commune: string | null;
  code_commune_insee?: string | null;
  nom_departement?: string | null;
  code_departement?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  x?: number | null;
  y?: number | null;
  
  // Caractéristiques techniques
  profondeur_investigation: number | null;
  altitude_station?: number | null;
  altitude_repere?: number | null;
  
  // Couverture temporelle
  date_debut_mesure?: string | null;
  date_fin_mesure?: string | null;
  nb_mesures_piezo?: number | null;
  date_maj?: string | null;
  
  [key: string]: any;
};

type WaterMapProps = {
  onStationSelect: (station: HubEauStationProperties) => void;
};

const FRANCE_VIEW = {
  longitude: 2.2137,
  latitude: 46.2276,
  zoom: 5.5,
};

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

const HUBEAU_STATIONS_URL =
  "https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/stations?format=geojson&size=1000";

export function WaterMap({ onStationSelect }: WaterMapProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(HUBEAU_STATIONS_URL)
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Données Hub'Eau prêtes !", data.features?.length, "stations trouvées.");
        setGeoData(data);
      })
      .catch((error) => console.error("Erreur API:", error));
  }, []);

  return (
    <div className="absolute inset-0">
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
                
                // On enrichit les propriétés avec les coordonnées GPS réelles de la géométrie
                // pour s'assurer que le panneau latéral ait toujours les bonnes valeurs
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