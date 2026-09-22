"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Loader2 } from "lucide-react";

type PiezometryChartProps = {
  bssId: string;
};

export function PiezometryChart({ bssId }: PiezometryChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bssId) return;

    setIsLoading(true);
    setError(null);

    const url = `https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${bssId}&size=200&sort=desc`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement des niveaux");
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          const sorted = [...json.data].reverse();
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
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-teal-600" />
        <p className="text-xs">Chargement de la chronique piézométrique...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 p-4 text-center">
        <p className="text-sm font-medium">Aucun relevé de niveau récent pour cette station.</p>
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
      axisLabel: { formatter: "{yyyy}", color: "#64748b" }
    },
    yAxis: {
      type: "value",
      name: "m",
      axisLabel: { color: "#64748b" },
      splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } }
    },
    series: [
      {
        name: "Niveau d'eau",
        type: "line",
        showSymbol: false,
        data: data,
        lineStyle: { width: 2, color: "#0d9488" },
        areaStyle: { color: "rgba(13, 148, 136, 0.1)" }
      }
    ]
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-semibold text-slate-700 text-sm">Niveau d'eau (NGF / Profondeur)</h3>
        <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          Chronique récente
        </span>
      </div>
      <div className="border border-slate-100 rounded-lg bg-white p-2">
        <ReactECharts option={option} style={{ height: "250px", width: "100%" }} />
      </div>
    </div>
  );
}