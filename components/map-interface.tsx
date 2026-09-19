"use client";

import { useState } from "react";
import { Search, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { HubEauStationProperties } from "@/components/water-map";

type MapInterfaceProps = {
  selectedStation: HubEauStationProperties | null;
  isDetailsOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const DataRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 py-2">
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </span>
    <span className="text-sm font-medium break-words text-slate-800">
      {value !== null && value !== undefined && value !== "" ? value : "Non renseigné"}
    </span>
  </div>
);

export function MapInterface({
  selectedStation,
  isDetailsOpen,
  onOpenChange,
}: MapInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const stationName = selectedStation?.nom_commune ?? "Station inconnue";

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute left-4 top-4 w-[min(calc(100%-2rem),20rem)]">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur-md">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher une ressource…"
              aria-label="Rechercher une ressource"
              className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>
        </div>

        <div className="pointer-events-auto absolute right-4 top-4">
          <Button
            type="button"
            variant="default"
            className="h-10 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white shadow-[0_10px_25px_rgba(13,148,136,0.22)] hover:bg-teal-800"
            onClick={() => onOpenChange(true)}
          >
            Station sélectionnée
          </Button>
        </div>
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden border-l border-slate-200/80 bg-white/90 sm:max-w-md backdrop-blur-xl"
        >
          <SheetHeader className="shrink-0 border-b border-slate-200/80 pb-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
                <MapPinned className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                Station
              </span>
            </div>
            <SheetTitle className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">
              {selectedStation ? stationName : "Détails de la ressource"}
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              {selectedStation
                ? `Station de surveillance sur ${stationName}`
                : "Sélectionnez une station pour afficher ses détails."}
            </SheetDescription>
          </SheetHeader>

          {selectedStation && (
            <div className="flex-1 space-y-5 overflow-y-auto py-4 pr-4 -mr-4">
              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Identification
                </p>
                <div className="space-y-1">
                  <DataRow label="Code BSS" value={selectedStation.code_bss} />
                  <DataRow label="Identifiant BSS" value={selectedStation.bss_id} />
                  <DataRow
                    label="Fiche technique"
                    value={
                      selectedStation.urn_bss ? (
                        <a
                          href={selectedStation.urn_bss}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-800"
                        >
                          Consulter la fiche ↗
                        </a>
                      ) : null
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Localisation
                </p>
                <div className="space-y-1">
                  <DataRow label="Commune" value={selectedStation.nom_commune} />
                  <DataRow
                    label="Département"
                    value={
                      selectedStation.nom_departement && selectedStation.code_departement
                        ? `${selectedStation.nom_departement} (${selectedStation.code_departement})`
                        : selectedStation.nom_departement || selectedStation.code_departement
                    }
                  />
                  <DataRow
                    label="Coordonnées GPS"
                    value={
                      selectedStation.longitude && selectedStation.latitude ? (
                        <div className="flex flex-col gap-1">
                          <span>Lon / Lat : {selectedStation.longitude} / {selectedStation.latitude}</span>
                          {selectedStation.x && selectedStation.y && (
                            <span className="text-xs text-slate-500">
                              Lambert 93 : {selectedStation.x} / {selectedStation.y}
                            </span>
                          )}
                        </div>
                      ) : null
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Caractéristiques
                </p>
                <div className="space-y-1">
                  <DataRow
                    label="Profondeur"
                    value={
                      selectedStation.profondeur_investigation
                        ? `${selectedStation.profondeur_investigation} m`
                        : null
                    }
                  />
                  <DataRow
                    label="Altitude"
                    value={
                      selectedStation.altitude_station
                        ? `${selectedStation.altitude_station} m NGF`
                        : null
                    }
                  />
                  <DataRow
                    label="Repère"
                    value={
                      selectedStation.altitude_repere
                        ? `${selectedStation.altitude_repere} m NGF`
                        : null
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Couverture temporelle
                </p>
                <div className="space-y-1">
                  <DataRow
                    label="Première mesure"
                    value={
                      selectedStation.date_debut_mesure
                        ? new Date(selectedStation.date_debut_mesure).toLocaleDateString("fr-FR")
                        : null
                    }
                  />
                  <DataRow
                    label="Dernière mesure"
                    value={
                      selectedStation.date_fin_mesure
                        ? new Date(selectedStation.date_fin_mesure).toLocaleDateString("fr-FR")
                        : null
                    }
                  />
                  <DataRow
                    label="Relevés"
                    value={
                      selectedStation.nb_mesures_piezo
                        ? new Intl.NumberFormat("fr-FR").format(selectedStation.nb_mesures_piezo)
                        : null
                    }
                  />
                  <DataRow
                    label="Mise à jour"
                    value={
                      selectedStation.date_maj
                        ? new Date(selectedStation.date_maj).toLocaleDateString("fr-FR")
                        : null
                    }
                  />
                </div>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
