"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";

type PiezometryIndicatorProps = {
  bssId: string;
};

export function PiezometryIndicator({ bssId }: PiezometryIndicatorProps) {
  const [trend, setTrend] = useState<{ diff: number; percent: number; isPositive: boolean | null; unit: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bssId) return;
    
    setIsLoading(true);
    fetch(`https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${bssId}&size=1000&sort=desc`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          const latest = json.data[0];
          const latestDate = new Date(latest.date_mesure);
          
          const oneYearAgo = new Date(latestDate);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          const pastData = json.data.filter((d: any) => new Date(d.date_mesure) >= oneYearAgo);
          const oldest = pastData[pastData.length - 1]; 

          if (latest && oldest) {
            let diff = 0;
            let isPositive = false;
            let percent = 0;

            // Logique environnementale (Recharge = Positif, Baisse = Négatif)
            if (latest.niveau_eau_ngf !== undefined && oldest.niveau_eau_ngf !== undefined && latest.niveau_eau_ngf !== null) {
              diff = latest.niveau_eau_ngf - oldest.niveau_eau_ngf;
              isPositive = diff >= 0;
              percent = oldest.niveau_eau_ngf !== 0 ? (diff / oldest.niveau_eau_ngf) * 100 : 0;
            } 
            else if (latest.profondeur_nappe !== undefined && oldest.profondeur_nappe !== undefined && latest.profondeur_nappe !== null) {
              // Si la profondeur augmente (oldest 20m -> latest 25m), diff = -5 (Négatif)
              diff = oldest.profondeur_nappe - latest.profondeur_nappe;
              isPositive = diff >= 0;
              percent = oldest.profondeur_nappe !== 0 ? (diff / oldest.profondeur_nappe) * 100 : 0;
            }

            setTrend({
              diff: Math.abs(diff),
              percent: Math.abs(percent),
              isPositive: diff === 0 ? null : isPositive,
              unit: "m"
            });
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [bssId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 h-24 bg-slate-50 border border-slate-100 rounded-lg w-full">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600 mr-2" />
        <span className="text-xs text-slate-500">Calcul de la tendance...</span>
      </div>
    );
  }

  if (!trend) return null;

  const bgColor = trend.isPositive === null ? "bg-slate-50" : trend.isPositive ? "bg-emerald-50" : "bg-rose-50";
  const borderColor = trend.isPositive === null ? "border-slate-200" : trend.isPositive ? "border-emerald-200" : "border-rose-200";
  const titleColor = trend.isPositive === null ? "text-slate-600" : trend.isPositive ? "text-emerald-700" : "text-rose-700";
  const valueColor = trend.isPositive === null ? "text-slate-800" : trend.isPositive ? "text-emerald-600" : "text-rose-600";
  const iconBgColor = trend.isPositive === null ? "bg-slate-200" : trend.isPositive ? "bg-emerald-100" : "bg-rose-100";
  const sign = trend.isPositive === null ? "" : trend.isPositive ? "+" : "-";

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${bgColor} ${borderColor}`}>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${titleColor}`}>Évolution sur 1 an</p>
        <div className="flex flex-col">
          <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>
            {sign}{trend.diff.toFixed(2)} <span className="text-sm font-medium opacity-80">{trend.unit}</span>
          </p>
          <p className={`text-xs font-medium mt-0.5 opacity-80 ${valueColor}`}>
            {sign}{trend.percent.toFixed(1)} % par rapport à N-1
          </p>
        </div>
      </div>
      <div className={`p-3 rounded-full ${iconBgColor} ${valueColor}`}>
        {trend.isPositive === null ? (
          <Minus className="w-6 h-6" />
        ) : trend.isPositive ? (
          <TrendingUp className="w-6 h-6" />
        ) : (
          <TrendingDown className="w-6 h-6" />
        )}
      </div>
    </div>
  );
}