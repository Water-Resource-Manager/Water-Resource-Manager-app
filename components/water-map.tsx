"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Map, { NavigationControl, Marker } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import { useMapStore } from "@/store/map-store";
import { MAP_LAYERS } from "@/config/map-layers";
import { LayerSelector } from "@/components/map/layer-selector";

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
  onFeatureSelect: (feature: { layerId: string; properties: any }) => void;};

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

export function WaterMap({ onFeatureSelect }: WaterMapProps) {
  const { activeLayerIds } = useMapStore();
  const mapRef = useRef<MapRef>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "error" | "ready">("loading");
  
  // États pour surveiller la fenêtre de la carte (pour le calcul des clusters)
  const [bounds, setBounds] = useState<[number, number, number, number]>([-5.5, 41.3, 9.6, 51.1]); // Bbox France par défaut
  const [zoom, setZoom] = useState(FRANCE_VIEW.zoom);

  useEffect(() => {
    setApiStatus("loading");
    
    const hubeauConfig = MAP_LAYERS.find(l => l.id === "hubeau-piezometrie");
    fetch(hubeauConfig?.sourceUrl || "/stations.json", { cache: "no-store" })
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

  // 1. Initialisation du moteur de clustering Supercluster
  const supercluster = useMemo(() => {
    if (!geoData?.features) return null;
    const sc = new Supercluster({ radius: 50, maxZoom: 14 });
    sc.load(geoData.features);
    return sc;
  }, [geoData]);

  // 2. Récupération des points à afficher en fonction du zoom et du déplacement
  const clusters = useMemo(() => {
    if (!supercluster || !bounds) return [];
    return supercluster.getClusters(bounds, Math.floor(zoom));
  }, [supercluster, bounds, zoom]);

  // Met à jour les limites de la carte lors des mouvements
  const updateMapState = () => {
    if (!mapRef.current) return;
    const b = mapRef.current.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(mapRef.current.getZoom());
  };

  return (
    <div className="absolute inset-0 bg-slate-50">
      {apiStatus === "loading" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/95 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse text-teal-800 border border-teal-100">
          Téléchargement du réseau national (jusqu'à 20 000 stations)...
        </div>
      )}
      {apiStatus === "error" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-100 text-red-800 px-5 py-3 rounded-xl shadow-lg text-sm font-medium border border-red-200">
          Erreur de connexion à l'API Hub'Eau.
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={FRANCE_VIEW}
        mapStyle={OSM_STYLE}
        style={{ width: "100%", height: "100%" }}
        cooperativeGestures={false}
        onMove={updateMapState}
        onLoad={updateMapState}
      >
        {activeLayerIds.includes("hubeau-piezometrie") && clusters.map((cluster, index) => {
        
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties || {};

          // --- AFFICHAGE D'UN GROUPE (CLUSTER) ---
          if (isCluster) {
            // Calcul de la taille de la bulle selon le nombre de points
            const size = Math.min(60, Math.max(30, 25 + (pointCount / 500) * 10));

            return (
              <Marker key={`cluster-${cluster.id}`} longitude={longitude} latitude={latitude}>
                <div
                  className="bg-teal-700 text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-md cursor-pointer hover:bg-teal-800 transition-colors"
                  style={{ width: `${size}px`, height: `${size}px`, fontSize: pointCount > 999 ? '11px' : '13px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!supercluster) return;
                    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id as number), 20);
                    mapRef.current?.easeTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 500,
                    });
                  }}
                >
                  {new Intl.NumberFormat("fr-FR").format(pointCount)}
                </div>
              </Marker>
            );
          }

          // --- AFFICHAGE D'UNE STATION INDIVIDUELLE ---
          return (
            <Marker key={`station-${cluster.properties.code_bss || index}`} longitude={longitude} latitude={latitude}>
              <div
                className="w-4 h-4 bg-teal-500 border-2 border-white rounded-full shadow-sm cursor-pointer hover:scale-150 transition-transform hover:bg-teal-700"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // NOUVEAU COMPORTEMENT ICI : on envoie la "Feature" avec son layerId
                  onFeatureSelect({
                    layerId: "hubeau-piezometrie",
                    properties: {
                      ...cluster.properties,
                      longitude,
                      latitude,
                    }
                  });
                  
                }}
              />
            </Marker>
          );
        })}

        <NavigationControl position="bottom-right" showCompass={false} />
      </Map>
      <LayerSelector />
    </div>
  );
}