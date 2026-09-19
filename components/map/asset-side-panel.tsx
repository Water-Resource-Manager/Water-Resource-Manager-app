"use client";

import { X, ExternalLink, Calendar, MapPin, Gauge, Database } from "lucide-react";
import type { HubEauStationProperties } from "@/components/water-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type AssetSidePanelProps = {
  station: HubEauStationProperties | null;
  onClose: () => void;
};

export function AssetSidePanel({ station, onClose }: AssetSidePanelProps) {
  if (!station) {
    return (
      <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 p-5 backdrop-blur z-20">
        <p className="text-lg font-semibold text-slate-900">Fiche station Hub&apos;Eau</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Sélectionnez un piézomètre sur la carte pour consulter ses coordonnées, la profondeur d&apos;investigation et l&apos;historique de suivi.
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800">Légende de la carte</p>
          <ul className="list-disc space-y-1 pl-4">
            <li><span className="text-blue-600 font-medium">Points bleus</span> : Stations piézométriques nationales</li>
            <li>Recherche rapide par commune en haut à gauche</li>
          </ul>
        </div>
      </aside>
    );
  }

  // Utilitaire pour sécuriser l'affichage des dates et éviter les "Invalid Date"
  const safeFormatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
  };

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-l border-slate-200/80 bg-white/95 backdrop-blur z-20 h-full overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 p-5 shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Code BSS : {station.code_bss ?? "Non renseigné"}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900">
            {station.nom_commune ?? "Commune inconnue"}
          </h2>
        </div>
        <Button variant="ghost" size="icon" aria-label="Fermer" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* 1. Identification */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <Database className="h-3.5 w-3.5" />
            Identification
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Identifiant unique (BSS ID)</span>
              <span className="font-medium text-slate-900">{station.bss_id || "—"}</span>
            </div>
            {station.urn_bss && (
              <div className="pt-1">
                <a
                  href={station.urn_bss}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium"
                >
                  Fiche technique nationale ADES <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 2. Localisation */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5" />
            Localisation
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Département</span>
              <span className="font-medium text-slate-900">
                {station.nom_departement ? `${station.nom_departement} (${station.code_departement ?? ""})` : "—"}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 flex justify-between items-center">
              <span className="text-slate-500">Coordonnées GPS</span>
              <span className="font-medium tabular-nums text-slate-900">
                {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Caractéristiques techniques */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <Gauge className="h-3.5 w-3.5" />
            Caractéristiques techniques
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 col-span-2 flex justify-between items-center">
              <span className="text-slate-500">Profondeur de l&apos;ouvrage</span>
              <span className="font-semibold text-slate-900">
                {station.profondeur_investigation != null ? `${station.profondeur_investigation} m` : "—"}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-slate-500">Altitude du sol</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {station.altitude_station != null ? `${station.altitude_station} m NGF` : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-slate-500">Altitude repère</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {station.altitude_repere != null ? `${station.altitude_repere} m NGF` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Couverture temporelle */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            Couverture temporelle
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Première mesure</span>
              <span className="font-medium text-slate-900">{safeFormatDate(station.date_debut_mesure)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dernière mesure</span>
              <span className="font-medium text-slate-900">{safeFormatDate(station.date_fin_mesure)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-2">
              <span className="text-slate-500">Dernière mise à jour</span>
              <span className="font-medium text-slate-900">{safeFormatDate(station.date_maj)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/60 pt-2">
              <span className="text-slate-500">Total des relevés</span>
              <span className="font-semibold text-teal-800">
                {station.nb_mesures_piezo ? new Intl.NumberFormat("fr-FR").format(station.nb_mesures_piezo) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions d'analyse */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href={`/analytics?code_bss=${station.code_bss}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 transition-colors shadow-sm"
          >
            Consulter la chronique historique
          </Link>
        </div>
      </div>
    </aside>
  );
}