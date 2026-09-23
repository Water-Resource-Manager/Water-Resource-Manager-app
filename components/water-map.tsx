"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Map, { NavigationControl, Marker } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import { useMapStore } from "@/store/map-store";
import { MAP_LAYERS } from "@/config/map-layers";
import { LayerSelector } from "@/components/map/layer-selector";
import { SearchBar } from "@/components/map/search-bar";
import { BaseMapSelector } from "@/components/map/base-map-selector";
import { useSearchParams } from "next/navigation";

type WaterMapProps = {
  onFeatureSelect: (feature: { layerId: string; properties: any }) => void;
};

const FRANCE_VIEW = { longitude: 2.2137, latitude: 46.2276, zoom: 5.5 };

// --- FONDS DE CARTE (Styles MapLibre avec tuiles publiques) ---
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

const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    satellite: {
      type: "raster" as const,
      tiles: [
        "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
      ],
      tileSize: 256,
      attribution: "&copy; IGN-F/Géoportail",
      maxzoom: 19,
    },
  },
  layers: [{ id: "satellite", type: "raster" as const, source: "satellite" }],
};

export function WaterMap({ onFeatureSelect }: WaterMapProps) {
  // On récupère toggleLayer en plus de activeLayerIds depuis le store
  const { activeLayerIds, toggleLayer } = useMapStore();
  const mapRef = useRef<MapRef>(null);
  
  // État pour savoir si le WebGL de MapLibre est prêt à recevoir des commandes
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const searchParams = useSearchParams();

  // Écoute des paramètres d'URL pour le recentrage depuis les favoris
  useEffect(() => {
    // Si la carte n'est pas encore dessinée, on attend
    if (!isMapLoaded) return;

    const focusId = searchParams.get("focusId");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const layerId = searchParams.get("layerId");

    if (focusId && lat && lng && layerId && mapRef.current) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      // 1. Activer la couche si elle n'est pas déjà visible
      if (!activeLayerIds.includes(layerId)) {
        toggleLayer(layerId);
      }

      // 2. Léger délai pour s'assurer que la carte et la couche sont prêtes
      setTimeout(() => {
        // Le survol
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          duration: 2500,
          essential: true
        });

        // L'ouverture du panneau latéral
        onFeatureSelect({
          layerId,
          properties: { 
            id: focusId, 
            code_bss: focusId, 
            nom: focusId, // Nom temporaire en attendant le chargement complet des données
            longitude, 
            latitude 
          }
        });
      }, 200);
    }
  }, [searchParams, onFeatureSelect, isMapLoaded, activeLayerIds, toggleLayer]);
  
  const [mapType, setMapType] = useState<"plan" | "satellite">("plan");

  const [datasets, setDatasets] = useState<Record<string, any>>({});
  const [clustersMap, setClustersMap] = useState<Record<string, Supercluster>>({});
  const [loadingLayers, setLoadingLayers] = useState<Set<string>>(new Set());
  
  const [bounds, setBounds] = useState<[number, number, number, number]>([-5.5, 41.3, 9.6, 51.1]);
  const [zoom, setZoom] = useState(FRANCE_VIEW.zoom);

  // MOTEUR DE CHARGEMENT INTELLIGENT
  useEffect(() => {
    activeLayerIds.forEach((layerId) => {
      if (!datasets[layerId] && !loadingLayers.has(layerId)) {
        
        setLoadingLayers((prev) => new Set(prev).add(layerId));
        const config = MAP_LAYERS.find((l) => l.id === layerId);
        
        if (config?.sourceUrl) {
          fetch(config.sourceUrl, { cache: "no-store" })
            .then((res) => {
              if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
              return res.json();
            })
            .then((data) => {
              console.log(`✅ Couche [${layerId}] chargée : ${data.features?.length} points`);
              
              const sc = new Supercluster({ radius: 50, maxZoom: 14 });
              sc.load(data.features);

              setDatasets((prev) => ({ ...prev, [layerId]: data }));
              setClustersMap((prev) => ({ ...prev, [layerId]: sc }));
            })
            .catch((err) => console.error(`❌ Erreur sur ${layerId}:`, err))
            .finally(() => {
              setLoadingLayers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(layerId);
                return newSet;
              });
            });
        }
      }
    });
  }, [activeLayerIds, datasets, loadingLayers]);

  const updateMapState = () => {
    if (!mapRef.current) return;
    const b = mapRef.current.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(mapRef.current.getZoom());
  };

  return (
    <div className="absolute inset-0 bg-slate-50">
      
      {loadingLayers.size > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/95 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse text-teal-800 border border-teal-100">
          Chargement des données spatiales...
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={FRANCE_VIEW}
        mapStyle={mapType === "plan" ? OSM_STYLE : SATELLITE_STYLE}
        style={{ width: "100%", height: "100%" }}
        cooperativeGestures={false}
        onMove={updateMapState}
        onLoad={() => {
          updateMapState();
          setIsMapLoaded(true); // Signal que la carte est prête
        }}
      >
        <SearchBar />

        {MAP_LAYERS.map(layer => {
          if (!activeLayerIds.includes(layer.id)) return null;

          const sc = clustersMap[layer.id];
          if (!sc) return null;

          const visibleClusters = sc.getClusters(bounds, Math.floor(zoom));

          const isQualityLayer = layer.id === "qualite-nappes";
          const markerColor = isQualityLayer ? "bg-purple-600" : "bg-teal-700";
          const pointColor = isQualityLayer ? "bg-purple-500 hover:bg-purple-700" : "bg-teal-500 hover:bg-teal-700";
          const borderStyle = mapType === "satellite" ? "border-2 border-white shadow-lg" : "border-2 border-white shadow-md";

          return visibleClusters.map((cluster, index) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } = cluster.properties || {};

            if (isCluster) {
              const size = Math.min(60, Math.max(30, 25 + (pointCount / 500) * 10));
              return (
                <Marker key={`${layer.id}-cluster-${cluster.id}`} longitude={longitude} latitude={latitude}>
                  <div
                    className={`${markerColor} text-white rounded-full flex items-center justify-center font-bold ${borderStyle} cursor-pointer transition-colors hover:brightness-110`}
                    style={{ width: `${size}px`, height: `${size}px`, fontSize: pointCount > 999 ? '11px' : '13px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const expansionZoom = Math.min(sc.getClusterExpansionZoom(cluster.id as number), 20);
                      mapRef.current?.easeTo({ center: [longitude, latitude], zoom: expansionZoom, duration: 500 });
                    }}
                  >
                    {new Intl.NumberFormat("fr-FR").format(pointCount)}
                  </div>
                </Marker>
              );
            }

            return (
              <Marker key={`${layer.id}-station-${cluster.properties.id || cluster.properties.code_bss || index}`} longitude={longitude} latitude={latitude}>
                <div
                  className={`w-4 h-4 ${pointColor} rounded-full cursor-pointer hover:scale-150 transition-transform ${borderStyle}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFeatureSelect({
                      layerId: layer.id,
                      properties: { ...cluster.properties, longitude, latitude }
                    });
                  }}
                />
              </Marker>
            );
          });
        })}

        <NavigationControl position="bottom-right" showCompass={false} />
        
        <BaseMapSelector mapType={mapType} onChange={setMapType} />
        
      </Map>
      <LayerSelector />
    </div>
  );
}