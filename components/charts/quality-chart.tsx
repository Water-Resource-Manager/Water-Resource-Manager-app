"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Loader2 } from "lucide-react";

type QualityChartProps = {
  bssId: string;
};

// Les 10 paramètres hydrologiques majeurs
const QUALITY_PARAMS = [
  { code: "1340", name: "Nitrates (NO3)", unit: "mg/L", threshold: 50 },
  { code: "1337", name: "Chlorures", unit: "mg/L" },
  { code: "1338", name: "Sulfates", unit: "mg/L" },
  { code: "1303", name: "Conductivité", unit: "µS/cm" },
  { code: "1302", name: "pH", unit: "unité pH" },
  { code: "1374", name: "Calcium", unit: "mg/L" },
  { code: "1107", name: "Atrazine (Pesticide)", unit: "µg/L", threshold: 0.1 },
  { code: "1907", name: "AMPA (Pesticide)", unit: "µg/L", threshold: 0.1 },
  { code: "1841", name: "Carbone Org. Total", unit: "mg/L" },
  { code: "1301", name: "Température", unit: "°C" }
];

export function QualityChart({ bssId }: QualityChartProps) {
  const [selectedParam, setSelectedParam] = useState(QUALITY_PARAMS[0]);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bssId) return;

    setIsLoading(true);
    setError(null);
    setData([]);

    // On demande les 100 plus récentes analyses (sort=desc) 
    // avec le bon paramètre (codes_parametres)
    const url = `https://hubeau.eaufrance.fr/api/v1/qualite_nappes/analyses?bss_id=${bssId}&code_parametre=${selectedParam.code}&size=100&sort=desc`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur HTTP");
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          
          // TODO (Phase 6 - Mise en production) : Créer une US.
          // Le nettoyage, le dédoublonnage et l'agrégation des données (ex: moyenne journalière) 
          // devront être réalisés par le backend (PostGIS/API).
          // Pour le POC, le frontend se contente d'afficher la donnée brute renvoyée par Hub'Eau.
          
          let chartData = json.data
            .filter((item: any) => item.resultat !== null && item.date_debut_prelevement)
            .map((item: any) => [
              item.date_debut_prelevement,
              item.resultat
            ]);

          // On trie le tableau par ordre chronologique pour un affichage cohérent (de gauche à droite)
          chartData.sort((a: any, b: any) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

          setData(chartData);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les données.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [bssId, selectedParam]);

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        // En mode scatter, params est parfois un seul objet plutôt qu'un tableau
        const param = Array.isArray(params) ? params[0] : params;
        const date = new Date(param.value[0]).toLocaleDateString("fr-FR");
        const val = param.value[1]?.toFixed(2) || param.value[1];
        return `<b>${date}</b><br/>${selectedParam.name} : ${val} ${selectedParam.unit}`;
      }
    },
    grid: { left: "15%", right: "5%", bottom: "15%", top: "10%" },
    xAxis: {
      type: "time",
      // Gestion native et intelligente d'ECharts pour les dates
      axisLabel: { color: "#64748b", hideOverlap: true } 
    },
    yAxis: {
      type: "value",
      name: selectedParam.unit,
      scale: true, // Détache l'axe de 0
      min: (value: any) => {
        if (value.min === value.max) return value.min;
        const margin = (value.max - value.min) * 0.1;
        return Math.max(0, value.min - margin).toFixed(1);
      },
      max: (value: any) => {
        if (value.min === value.max) return (value.max * 1.1).toFixed(1);
        const margin = (value.max - value.min) * 0.1;
        return (value.max + margin).toFixed(1);
      },
      nameTextStyle: { color: "#64748b", align: "right" },
      axisLabel: { color: "#64748b" },
      splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } }
    },
    visualMap: selectedParam.threshold ? {
      show: false,
      pieces: [
        { gt: 0, lte: selectedParam.threshold / 2, color: "#10b981" },
        { gt: selectedParam.threshold / 2, lte: selectedParam.threshold, color: "#f59e0b" },
        { gt: selectedParam.threshold, color: "#ef4444" }
      ],
      outOfRange: { color: "#ef4444" }
    } : undefined,
    series: [
      {
        name: selectedParam.name,
        // Affichage en nuage de points pour représenter fidèlement les données brutes
        type: "scatter", 
        symbolSize: 6,
        data: data,
        itemStyle: { color: selectedParam.threshold ? undefined : "#8b5cf6" },
        markLine: selectedParam.threshold ? {
          silent: true,
          symbol: ['none', 'none'], // Pas de flèches
          lineStyle: { type: "solid", color: "#ef4444", width: 1.5 },
          data: [{ yAxis: selectedParam.threshold }],
          label: { show: false }
        } : undefined
      }
    ]
  };

  return (
    <div className="w-full flex flex-col h-full space-y-3">
      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block px-1">
          Paramètre analysé
        </label>
        <select
          className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          value={selectedParam.code}
          onChange={(e) => {
            const param = QUALITY_PARAMS.find((p) => p.code === e.target.value);
            if (param) setSelectedParam(param);
          }}
        >
          {QUALITY_PARAMS.map((param) => (
            <option key={param.code} value={param.code}>
              {param.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-slate-100 rounded-lg bg-white p-2 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-500" />
          </div>
        )}
        
        {!isLoading && (error || data.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 text-center px-4">
            <p className="text-sm font-medium">Aucune analyse de {selectedParam.name} récente.</p>
            <p className="text-xs mt-1 text-slate-400">Essayez un autre paramètre dans la liste.</p>
          </div>
        ) : (
          <ReactECharts option={option} notMerge={true} style={{ height: 300, width: "100%" }} />
        )}
      </div>
    </div>
  );
}