"use client";

import { useEffect, useState } from "react";
import { Map, MousePointerClick, X, Info, Droplets, FlaskConical, MapPin, Loader2 } from "lucide-react";
import { useMapStore } from "@/store/map-store";
import { MAP_LAYERS } from "@/config/map-layers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QualityChart } from "@/components/charts/quality-chart";
import { PiezometryChart } from "@/components/charts/piezometry-chart";

export type SelectedFeature = {
  layerId: string;
  properties: any;
};

type AssetSidePanelProps = {
  feature: SelectedFeature | null;
  onClose: () => void;
};

// Sous-composant : Gestion dynamique de l'onglet Niveaux avec fallback sur le plus proche
function LevelsTabContent({ feature }: { feature: SelectedFeature }) {
  const { layerId, properties } = feature;
  const [nearest, setNearest] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const bssId = properties.id || properties.code_bss;
  const lat = properties.latitude;
  const lon = properties.longitude;

  useEffect(() => {
    if (layerId === "qualite-nappes" && lat && lon) {
      setIsSearching(true);
      fetch(`https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/stations?latitude=${lat}&longitude=${lon}&distance=25&size=1`)
        .then((r) => r.json())
        .then((json) => {
          setNearest(json.data?.[0] || null);
        })
        .catch(() => setNearest(null))
        .finally(() => setIsSearching(false));
    } else {
      setNearest(null);
    }
  }, [layerId, lat, lon]);

  if (layerId === "hubeau-piezometrie") {
    return <PiezometryChart bssId={bssId} />;
  }

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-teal-600" />
        <p className="text-xs">Recherche du piézomètre le plus proche...</p>
      </div>
    );
  }

  if (nearest) {
    const dist = nearest.distance ? nearest.distance.toFixed(1) : "?";
    return (
      <div className="space-y-3">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Piézomètre le plus proche (à {dist} km)</p>
            <p className="text-teal-700 font-medium">{nearest.nom_commune || nearest.code_bss} ({nearest.code_bss})</p>
          </div>
        </div>
        <PiezometryChart bssId={nearest.code_bss} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-48 bg-slate-50 border border-slate-100 rounded-lg p-4 text-center text-slate-500 text-xs">
      Aucun piézomètre trouvé dans un rayon de 25 km autour de cette station.
    </div>
  );
}

// Sous-composant : Gestion dynamique de l'onglet Qualité avec fallback sur le plus proche
function QualityTabContent({ feature }: { feature: SelectedFeature }) {
  const { layerId, properties } = feature;
  const [nearest, setNearest] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const bssId = properties.id || properties.code_bss;
  const lat = properties.latitude;
  const lon = properties.longitude;

  useEffect(() => {
    if (layerId === "hubeau-piezometrie" && lat && lon) {
      setIsSearching(true);
      fetch(`https://hubeau.eaufrance.fr/api/v1/qualite_nappes/stations?latitude=${lat}&longitude=${lon}&distance=25&size=1`)
        .then((r) => r.json())
        .then((json) => {
          setNearest(json.data?.[0] || null);
        })
        .catch(() => setNearest(null))
        .finally(() => setIsSearching(false));
    } else {
      setNearest(null);
    }
  }, [layerId, lat, lon]);

  if (layerId === "qualite-nappes") {
    return <QualityChart bssId={bssId} />;
  }

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-600" />
        <p className="text-xs">Recherche de la station qualité la plus proche...</p>
      </div>
    );
  }

  if (nearest) {
    const dist = nearest.distance ? nearest.distance.toFixed(1) : "?";
    return (
      <div className="space-y-3">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-900 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Station de qualité la plus proche (à {dist} km)</p>
            <p className="text-purple-700 font-medium">{nearest.nom_commune || nearest.bss_id} ({nearest.bss_id})</p>
          </div>
        </div>
        <QualityChart bssId={nearest.bss_id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-48 bg-slate-50 border border-slate-100 rounded-lg p-4 text-center text-slate-500 text-xs">
      Aucune station de qualité trouvée dans un rayon de 25 km autour de ce piézomètre.
    </div>
  );
}

export function AssetSidePanel({ feature, onClose }: AssetSidePanelProps) {
  const { activeLayerIds } = useMapStore();

  if (feature) {
    const { layerId, properties } = feature;
    const isGroundwaterResource = layerId === "hubeau-piezometrie" || layerId === "qualite-nappes";
    const isQualityPrimary = layerId === "qualite-nappes";

    if (isGroundwaterResource) {
      return (
        <aside className="flex w-[420px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 backdrop-blur z-20 h-full overflow-hidden animate-in slide-in-from-right duration-300">
          
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg leading-tight">
                {properties.nom || properties.nom_commune || "Station Inconnue"}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                BSS : {properties.id || properties.code_bss || "N/A"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <Tabs defaultValue="identity" className="flex flex-col h-full w-full">
              
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100/50">
                <TabsTrigger value="identity" className="text-xs data-[state=active]:bg-white">
                  <Info className="w-3.5 h-3.5 mr-1.5" />
                  Identité
                </TabsTrigger>

                {isQualityPrimary ? (
                  <>
                    <TabsTrigger value="quality" className="text-xs data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                      <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                      Qualité
                    </TabsTrigger>
                    <TabsTrigger value="levels" className="text-xs data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                      <Droplets className="w-3.5 h-3.5 mr-1.5" />
                      Niveaux
                    </TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="levels" className="text-xs data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                      <Droplets className="w-3.5 h-3.5 mr-1.5" />
                      Niveaux
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="text-xs data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                      <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                      Qualité
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                
                {/* ONGLET 1 : Identité */}
                <TabsContent value="identity" className="m-0 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Informations générales</h3>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <dt className="text-slate-500">Commune</dt>
                        <dd className="font-medium text-slate-900">{properties.nom_commune || properties.nom || "N/A"}</dd>
                      </div>
                      {properties.code_commune_insee && (
                        <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                          <dt className="text-slate-500">Code INSEE</dt>
                          <dd className="font-medium text-slate-900">{properties.code_commune_insee}</dd>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <dt className="text-slate-500">Département</dt>
                        <dd className="font-medium text-slate-900">{properties.departement || properties.nom_departement || "N/A"}</dd>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                        <dt className="text-slate-500">Profondeur</dt>
                        <dd className="font-medium text-slate-900">
                          {properties.profondeur ?? properties.profondeur_investigation ?? "Non renseignée"}
                          {(properties.profondeur || properties.profondeur_investigation) ? " m" : ""}
                        </dd>
                      </div>
                      {properties.altitude_station && (
                        <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                          <dt className="text-slate-500">Altitude sol</dt>
                          <dd className="font-medium text-slate-900">{properties.altitude_station} m</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {(properties.nb_mesures_piezo || properties.date_debut_mesure) && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Historique des mesures</h3>
                      <dl className="space-y-2.5 text-sm">
                        {properties.nb_mesures_piezo && (
                          <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                            <dt className="text-slate-500">Nombre de mesures</dt>
                            <dd className="font-semibold text-teal-700">
                              {new Intl.NumberFormat("fr-FR").format(properties.nb_mesures_piezo)}
                            </dd>
                          </div>
                        )}
                        {properties.date_debut_mesure && (
                          <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                            <dt className="text-slate-500">Première mesure</dt>
                            <dd className="font-medium text-slate-900">
                              {new Date(properties.date_debut_mesure).toLocaleDateString("fr-FR")}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </TabsContent>

                {/* ONGLET 2 : Niveaux */}
                <TabsContent value="levels" className="m-0">
                  <LevelsTabContent feature={feature} />
                </TabsContent>

                {/* ONGLET 3 : Qualité */}
                <TabsContent value="quality" className="m-0">
                  <QualityTabContent feature={feature} />
                </TabsContent>

              </div>
            </Tabs>
          </div>
        </aside>
      );
    }

    return (
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 backdrop-blur z-20 h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Détails de l'élément</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 text-sm text-slate-500 text-center mt-10">
          Aucun template défini pour cette couche ({feature.layerId}).
        </div>
      </aside>
    );
  }

  if (activeLayerIds.length === 0) {
    return (
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 p-8 backdrop-blur z-20 h-full justify-center items-center text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Map className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Explorateur de données</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Aucune donnée affichée. Choisissez un élément à afficher grâce au sélecteur de couches en haut à droite de la carte.
        </p>
      </aside>
    );
  }

  const activeLayersDetails = MAP_LAYERS.filter((l) => activeLayerIds.includes(l.id));

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 p-8 backdrop-blur z-20 h-full justify-center items-center text-center">
      <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-4 transition-transform hover:scale-105">
        <MousePointerClick className="h-8 w-8 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        {activeLayerIds.length === 1 ? activeLayersDetails[0]?.name : "Analyse multicouche"}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {activeLayerIds.length === 1
          ? "Sélectionnez une station sur la carte pour consulter ses relevés et sa chronique temporelle."
          : `${activeLayerIds.length} couches actives. Cliquez sur un élément de la carte pour en afficher les détails.`}
      </p>

      {activeLayerIds.length > 1 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {activeLayersDetails.map((layer) => (
            <span
              key={layer.id}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: layer.color }}></span>
              {layer.name}
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}