"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFavoritesStore } from "@/store/favorites-store";
import { Droplets, FlaskConical, Trash2, Map as MapIcon, TrendingDown, TrendingUp } from "lucide-react";

// TODO: Refacto - Calcul des tendances Piézométriques côté backend
// body: Le sous-composant `CompactTrend` effectue actuellement 2 appels API Hub'Eau (client-side) par station favorite pour calculer l'évolution N / N-1. Pour la mise en production, ce calcul doit être déporté sur le backend pour renvoyer directement la valeur agrégée et améliorer les performances.
// labels: phase-6-production, refacto

function CompactTrend({ bssId }: { bssId: string }) {
  const [trend, setTrend] = useState<{ diff: number, percentDiff: number, isDecline: boolean } | null>(null);

  useEffect(() => {
    async function fetchTrend() {
      try {
        const res1 = await fetch(`https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${bssId}&size=1&sort=desc`);
        const data1 = await res1.json();
        const latest = data1.data?.[0];
        if (!latest) return;

        const date = new Date(latest.date_mesure);
        date.setFullYear(date.getFullYear() - 1);
        const pastDateStr = date.toISOString().split('T')[0];

        const res2 = await fetch(`https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${bssId}&date_debut_mesure=${pastDateStr}&size=1&sort=asc`);
        const data2 = await res2.json();
        const past = data2.data?.[0];

        if (latest && past) {
          // La différence absolue se calcule sur l'altitude de la nappe
          const diff = latest.niveau_nappe_eau - past.niveau_nappe_eau;
          
          // Le pourcentage se calcule par rapport à la profondeur de la nappe sous la surface
          const percentDiff = past.profondeur_nappe && past.profondeur_nappe !== 0 
            ? (diff / past.profondeur_nappe) * 100 
            : 0;

          setTrend({ diff, percentDiff, isDecline: diff < 0 });
        }
      } catch (e) {
        console.error("Erreur lors du calcul de la tendance pour le favori:", e);
      }
    }
    fetchTrend();
  }, [bssId]);

  if (!trend) return null;

  const isDecline = trend.isDecline;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ml-2 shrink-0 ${isDecline ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
      {isDecline ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      <span>{trend.diff > 0 ? '+' : ''}{trend.diff.toFixed(2)} m</span>
      <span className="opacity-75 font-medium ml-0.5 whitespace-nowrap">
        ({trend.percentDiff > 0 ? '+' : ''}{trend.percentDiff.toFixed(1)}% Vs N-1)
      </span>
    </span>
  );
}

export function StationsFavorites() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (favorites.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-full">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <MapIcon className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">Votre panier est vide</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
          Explorez la carte SIG et cliquez sur l'étoile pour sauvegarder vos stations importantes.
        </p>
      </div>
    );
  }

  // Redirection avec paramètres d'URL pour la carte
  const handleNavigateToMap = (station: any) => {
    const { id, type, coordinates } = station;
    router.push(`/map?focusId=${id}&layerId=${type}&lat=${coordinates[1]}&lng=${coordinates[0]}`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Mes stations suivies</h3>
        <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
          {favorites.length}
        </span>
      </div>
      
      <div className="divide-y divide-slate-100 overflow-y-auto p-2">
        {favorites.map((station) => {
          // Correction de la vérification : on prend en compte l'ID technique exact de la couche
          const isPiezo = station.type === 'piezometrie' || (station.type as string) === 'hubeau-piezometrie';

          return (
            <div 
              key={`${station.type}-${station.id}`} 
              onClick={() => handleNavigateToMap(station)}
              className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center space-x-3 overflow-hidden w-full">
                {/* Icône dynamique selon le type */}
                <div className={`p-1.5 rounded-md shrink-0 ${isPiezo ? 'bg-teal-50 text-teal-600' : 'bg-purple-50 text-purple-600'}`}>
                  {isPiezo ? <Droplets className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={station.name}>
                      {station.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide truncate">
                      {station.id}
                    </p>
                  </div>
                  
                  {/* Pastille de tendance miniature pour les piézomètres uniquement */}
                  {isPiezo && <CompactTrend bssId={station.id} />}
                </div>
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Évite de déclencher le clic qui renvoie vers la carte
                    removeFavorite(station.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Retirer du panier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}