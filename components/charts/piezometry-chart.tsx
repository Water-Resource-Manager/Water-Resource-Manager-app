"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Loader2 } from "lucide-react";

type PiezometryChartProps = {
  bssId: string;
};

export function PiezometryChart({ bssId }: PiezometryChartProps) {
  const [data, setData] = useState<any[]>([]);
  // État pour stocker la couleur de la courbe en fonction de la tendance
  const [trendColor, setTrendColor] = useState({ line: "#0d9488", area: "rgba(13, 148, 136, 0.1)" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bssId) return;

    setIsLoading(true);
    setError(null);

    const url = `https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${bssId}&size=1000&sort=desc`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement des niveaux");
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          
          const latestDateStr = json.data[0].date_mesure;
          const latestDate = new Date(latestDateStr);

          const oneYearAgo = new Date(latestDate);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          const filteredData = json.data.filter((item: any) => {
            const itemDate = new Date(item.date_mesure);
            return itemDate >= oneYearAgo && itemDate <= latestDate;
          });

          const sorted = [...filteredData].reverse();
          
          // --- CALCUL DE LA COULEUR (Rouge/Vert) ---
          if (sorted.length > 0) {
            const isNGF = sorted[0].niveau_eau_ngf !== undefined && sorted[0].niveau_eau_ngf !== null;
            const oldestVal = sorted[0].niveau_eau_ngf ?? sorted[0].profondeur_nappe;
            const latestVal = sorted[sorted.length - 1].niveau_eau_ngf ?? sorted[sorted.length - 1].profondeur_nappe;
            
            let isPositive = true;
            if (isNGF) {
              isPositive = latestVal >= oldestVal; // NGF monte = Vert
            } else {
              isPositive = latestVal <= oldestVal; // Profondeur descend = Vert
            }

            if (isPositive) {
              setTrendColor({ line: "#10b981", area: "rgba(16, 185, 129, 0.1)" }); // Vert (Recharge)
            } else {
              setTrendColor({ line: "#ef4444", area: "rgba(239, 68, 68, 0.1)" }); // Rouge (Baisse)
            }
          }
          // ------------------------------------------

          const chartData = sorted.map((item: any) => [
            item.date_mesure,
            item.niveau_eau_ngf ?? item.profondeur_nappe
          ]);
          setData(chartData);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les niveaux d'eau.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [bssId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-teal-600" />
        <p className="text-xs">Chargement de la chronique (1 an glissant)...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-500 bg-slate-50 rounded-lg border border-slate-100 p-4 text-center">
        <p className="text-sm font-medium">Aucun relevé de niveau pour cette station.</p>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        const date = new Date(params[0].value[0]).toLocaleDateString("fr-FR");
        const val = params[0].value[1]?.toFixed(2);
        return `<b>${date}</b><br/>Niveau : ${val} m`;
      }
    },
    grid: { left: "12%", right: "5%", bottom: "15%", top: "10%" },
    xAxis: {
      type: "time",
      axisLabel: { 
        color: "#64748b",
        hideOverlap: true,
        formatter: { year: '{yyyy}', month: '{MMM} {yyyy}', day: '{d} {MMM}' }
      }
    },
    yAxis: {
      type: "value",
      name: "m",
      scale: true,
      min: (value: any) => {
        const margin = Math.max((value.max - value.min) * 0.1, 0.1);
        return (value.min - margin).toFixed(2);
      },
      max: (value: any) => {
        const margin = Math.max((value.max - value.min) * 0.1, 0.1);
        return (value.max + margin).toFixed(2);
      },
      axisLabel: { 
        color: "#64748b",
        formatter: (val: number) => val.toFixed(2) 
      },
      splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } },
      nameTextStyle: { color: "#64748b", align: "right" }
    },
    series: [
      {
        name: "Niveau d'eau",
        type: "line",
        showSymbol: false,
        data: data,
        // Utilisation de la couleur dynamique
        lineStyle: { width: 2, color: trendColor.line },
        areaStyle: { color: trendColor.area }
      }
    ]
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-slate-700 text-sm">Niveau d'eau (NGF / Profondeur)</h3>
        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          1 an glissant
        </span>
      </div>
      <div className="border border-slate-100 rounded-lg bg-white p-2">
        <ReactECharts option={option} style={{ height: "250px", width: "100%" }} />
      </div>
    </div>
  );
}