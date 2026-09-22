"use client";

import { useEffect, useState, useMemo } from "react";
import { X, ExternalLink, Calendar, MapPin, Gauge, Database, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SparklineChart } from "@/components/charts/sparkline-chart";

type PiezometerTemplateProps = {
  data: any; // Les propriétés de la station
  onClose: () => void;
};

export function PiezometerTemplate({ data: station, onClose }: PiezometerTemplateProps) {
  const [chroniques, setChroniques] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!station?.code_bss) return;

    setIsLoading(true);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const formatDateForApi = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const encodedBss = encodeURIComponent(station.code_bss.trim());
    const fetchUrl = `https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${encodedBss}&date_debut_mesure=${formatDateForApi(oneYearAgo)}&date_fin_mesure=${formatDateForApi(today)}&size=2000&sort=desc`;

    fetch(fetchUrl)
      .then(res => res.ok ? res.json() : { data: [] })
      .then(data => setChroniques(data?.data || []))
      .catch(err => {
        console.error("Erreur récupération chroniques:", err);
        setChroniques([]);
      })
      .finally(() => setIsLoading(false));
  }, [station]);

  const { chartData, latestMeasurement } = useMemo(() => {
    if (chroniques.length === 0) return { chartData: [], latestMeasurement: null };

    const latest = chroniques[0];
    const isNGF = latest.niveau_nappe_eau != null;
    const unit = isNGF ? "m NGF" : "m (profondeur)";

    const points = chroniques
      .map(c => [
        c.date_mesure,
        isNGF ? c.niveau_nappe_eau : c.profondeur_nappe
      ] as [string, number])
      .reverse();

    return {
      chartData: points,
      latestMeasurement: {
        value: isNGF ? latest.niveau_nappe_eau : latest.profondeur_nappe,
        date: latest.date_mesure,
        unit,
        qualification: latest.qualification === "Correcte" ? "Validée" : "Provisoire"
      }
    };
  }, [chroniques]);

  const safeFormatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
  };

  return (
    <div className="flex h-full flex-col">
      {/* En-tête du template */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 p-5 shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Code BSS : {station.code_bss ?? "Non renseigné"}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-snug text-slate-900">
            {station.nom_commune ?? "Commune inconnue"}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenu défilant */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-8 scrollbar-hide">
        
        {/* BLOC : DONNÉES EN TEMPS RÉEL (ECHARTS) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5" />
            Suivi temps réel
          </div>
          
          {isLoading ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 h-48 animate-pulse flex items-center justify-center text-sm text-slate-500">
              Récupération des mesures (1 an)...
            </div>
          ) : latestMeasurement ? (
            <div className="rounded-xl border border-teal-200/70 bg-teal-50/50 p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-800/70">Dernière mesure</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {latestMeasurement.qualification}
                </span>
              </div>
              <p className="font-bold text-3xl tabular-nums text-teal-950 mt-1">
                {latestMeasurement.value?.toFixed(2)} <span className="text-sm font-medium text-teal-800/80">{latestMeasurement.unit}</span>
              </p>
              <p className="text-xs text-teal-800/70 mt-1">Relevé du {safeFormatDate(latestMeasurement.date)}</p>
              
              <div className="mt-4 border-t border-teal-200/50 pt-2 -mx-2">
                <p className="text-[11px] font-semibold text-teal-800 mb-1 ml-2">Tendance (12 derniers mois)</p>
                <SparklineChart data={chartData} unit={latestMeasurement.unit} />
              </div>
            </div>
          ) : (
             <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
               Aucune chronique récente disponible sur la dernière année glissante.
             </div>
          )}
        </div>

        {/* BLOC 1 : IDENTIFICATION */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <Database className="h-3.5 w-3.5" />
            Identification
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Identifiant (BSS ID)</span>
              <span className="font-medium text-slate-900">{station.bss_id || "—"}</span>
            </div>
            {station.urn_bss && (
              <div className="pt-1">
                <a href={station.urn_bss} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium">
                  Fiche technique ADES <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* BLOC 2 : LOCALISATION */}
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

        {/* BLOC 3 : CARACTÉRISTIQUES */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 uppercase tracking-wider">
            <Gauge className="h-3.5 w-3.5" />
            Caractéristiques
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 col-span-2 flex justify-between items-center">
              <span className="text-slate-500">Profondeur ouvrage</span>
              <span className="font-semibold text-slate-900">
                {station.profondeur_investigation != null ? `${station.profondeur_investigation} m` : "—"}
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-slate-500">Altitude sol</p>
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

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 pt-2">
          <Link href={`/analytics?code_bss=${encodeURIComponent(station.code_bss ?? "")}`} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 transition-colors shadow-sm">
            Analyse temporelle avancée
          </Link>
        </div>
      </div>
    </div>
  );
}