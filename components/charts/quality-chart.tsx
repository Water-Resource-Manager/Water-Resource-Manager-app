"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Loader2 } from "lucide-react";

type QualityChartProps = {
  bssId: string;
};

// Code SANDRE pour les Nitrates
const PARAM_NITRATES = "1340";

export function QualityChart({ bssId }: QualityChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bssId) return;

    setIsLoading(true);
    setError(null);

    const url = `https://hubeau.eaufrance.fr/api/v1/qualite_nappes/analyses?bss_id=${bssId}&code_parametre=${PARAM_NITRATES}&size=100&sort=asc`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des analyses");
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          const chartData = json.data.map((item: any) => [
            item.date_debut_prelevement,
            item.resultat
          ]);
          setData(chartData);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger l'historique de qualité.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [bssId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-500" />
        <p className="text-sm">Recherche des analyses de nitrates...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 p-4 text-center">
        <p className="text-sm font-medium">Aucune analyse de Nitrates (NO3) récente pour cette station.</p>
        <p className="text-xs mt-1 text-slate-400">Le dernier prélèvement est peut-être trop ancien ou concerne d'autres polluants.</p>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        const date = new Date(params[0].value[0]).toLocaleDateString("fr-FR");
        const val = params[0].value[1];
        return `<b>${date}</b><br/>Nitrates : ${val} mg/L`;
      }
    },
    grid: { left: "12%", right: "5%", bottom: "15%", top: "10%" },
    xAxis: {
      type: "time",
      axisLabel: {
        formatter: "{yyyy}",
        color: "#64748b"
      }
    },
    yAxis: {
      type: "value",
      name: "mg/L",
      nameTextStyle: { color: "#64748b", align: "right" },
      axisLabel: { color: "#64748b" },
      splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } }
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 0, lte: 25, color: "#10b981" },
        { gt: 25, lte: 50, color: "#f59e0b" },
        { gt: 50, color: "#ef4444" }
      ],
      outOfRange: { color: "#ef4444" }
    },
    series: [
      {
        name: "Nitrates",
        type: "line",
        showSymbol: true,
        symbolSize: 6,
        data: data,
        lineStyle: { width: 2 },
        markLine: {
          silent: true,
          lineStyle: { type: "solid", color: "#ef4444", width: 1.5 },
          data: [{ yAxis: 50, name: "Seuil (50 mg/L)" }],
          label: { show: false }
        }
      }
    ]
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-semibold text-slate-700 text-sm">Évolution des Nitrates (NO3)</h3>
        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          100 Dernières mesures
        </span>
      </div>
      <div className="border border-slate-100 rounded-lg bg-white p-2">
        <ReactECharts option={option} style={{ height: "250px", width: "100%" }} />
      </div>
    </div>
  );
}