"use client";

import { useState } from "react";
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

// Composant utilitaire pour uniformiser l'affichage des lignes de données
const DataRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col py-1.5">
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="text-sm font-medium break-words">
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
        <div className="pointer-events-auto absolute top-4 left-4 w-[min(calc(100%-2rem),20rem)]">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher une ressource…"
            aria-label="Rechercher une ressource"
            className="h-10 bg-background/95 shadow-md backdrop-blur-sm"
          />
        </div>

        <div className="pointer-events-auto absolute top-4 right-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 bg-background/95 shadow-md backdrop-blur-sm"
            onClick={() => onOpenChange(true)}
          >
            Station sélectionnée
          </Button>
        </div>
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col sm:max-w-md w-full overflow-hidden">
          <SheetHeader className="pb-4 border-b shrink-0">
            <SheetTitle>Détails de la ressource</SheetTitle>
            <SheetDescription>
              {selectedStation
                ? `Station de surveillance sur ${stationName}`
                : "Sélectionnez une station pour afficher ses détails."}
            </SheetDescription>
          </SheetHeader>

          {selectedStation && (
            <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
              {/* 1. Identification de l'ouvrage */}
              <section>
                <h3 className="text-sm font-bold text-primary mb-2">Identification de l'ouvrage</h3>
                <div className="space-y-1 bg-muted/50 p-3 rounded-lg">
                  <DataRow label="Identification de la station (code BSS)" value={selectedStation.code_bss} />
                  <DataRow label="Identifiant unique (bss_id)" value={selectedStation.bss_id} />
                  <DataRow 
                    label="Lien vers la fiche technique (ADES)" 
                    value={
                      selectedStation.urn_bss ? (
                        <a href={selectedStation.urn_bss} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Consulter la fiche technique ↗
                        </a>
                      ) : null
                    } 
                  />
                </div>
              </section>

              {/* 2. Localisation géographique */}
              <section>
                <h3 className="text-sm font-bold text-primary mb-2">Localisation géographique</h3>
                <div className="space-y-1 bg-muted/50 p-3 rounded-lg">
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
                    label="Coordonnées GPS de la station" 
                    value={
                      selectedStation.longitude && selectedStation.latitude ? (
                        <div className="flex flex-col">
                          <span>Lon / Lat : {selectedStation.longitude} / {selectedStation.latitude}</span>
                          {selectedStation.x && selectedStation.y && (
                            <span className="text-muted-foreground text-xs mt-0.5">Lambert 93 : {selectedStation.x} / {selectedStation.y}</span>
                          )}
                        </div>
                      ) : null
                    } 
                  />
                </div>
              </section>

              {/* 3. Caractéristiques techniques de la station */}
              <section>
                <h3 className="text-sm font-bold text-primary mb-2">Caractéristiques techniques</h3>
                <div className="space-y-1 bg-muted/50 p-3 rounded-lg">
                  <DataRow 
                    label="Profondeur de l'ouvrage" 
                    value={selectedStation.profondeur_investigation ? `${selectedStation.profondeur_investigation} mètres` : null} 
                  />
                  <DataRow 
                    label="Altitude du sol au niveau de l'ouvrage" 
                    value={selectedStation.altitude_station ? `${selectedStation.altitude_station} m NGF` : null} 
                  />
                  <DataRow 
                    label="Altitude de référence du repère" 
                    value={selectedStation.altitude_repere ? `${selectedStation.altitude_repere} m NGF` : null} 
                  />
                </div>
              </section>

              {/* 4. Couverture temporelle des données */}
              <section>
                <h3 className="text-sm font-bold text-primary mb-2">Couverture temporelle</h3>
                <div className="space-y-1 bg-muted/50 p-3 rounded-lg">
                  <DataRow 
                    label="Date de première mesure" 
                    value={selectedStation.date_debut_mesure ? new Date(selectedStation.date_debut_mesure).toLocaleDateString("fr-FR") : null} 
                  />
                  <DataRow 
                    label="Date de la dernière mesure relevée" 
                    value={selectedStation.date_fin_mesure ? new Date(selectedStation.date_fin_mesure).toLocaleDateString("fr-FR") : null} 
                  />
                  <DataRow 
                    label="Nombre de relevés disponibles" 
                    value={selectedStation.nb_mesures_piezo ? new Intl.NumberFormat('fr-FR').format(selectedStation.nb_mesures_piezo) : null} 
                  />
                  <DataRow 
                    label="Dernière mise à jour administrative" 
                    value={selectedStation.date_maj ? new Date(selectedStation.date_maj).toLocaleDateString("fr-FR") : null} 
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