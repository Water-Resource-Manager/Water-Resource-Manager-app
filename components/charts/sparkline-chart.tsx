"use client";

import ReactECharts from "echarts-for-react";

type SparklineChartProps = {
  data: [string, number][]; // Tableau de points [date, valeur]
  color?: string;
  unit?: string;
};

export function SparklineChart({ data, color = "#0f766e", unit = "m" }: SparklineChartProps) {
  const option = {
    grid: { left: 0, right: 0, top: 5, bottom: 5 },
    xAxis: { type: "time", show: false },
    yAxis: { type: "value", show: false, scale: true },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const date = new Date(params[0].value[0]).toLocaleDateString("fr-FR");
        const val = params[0].value[1].toFixed(2);
        return `<div style="font-size:11px;font-weight:600;color:#334155;">${date}</div>
                <div style="font-size:12px;color:${color};">${val} ${unit}</div>`;
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e2e8f0",
      padding: [8, 12],
      textStyle: { color: "#334155" }
    },
    series: [
      {
        type: "line",
        data: data,
        smooth: 0.3,
        showSymbol: false,
        lineStyle: { width: 2.5, color: color },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: "rgba(255,255,255,0)" }
            ]
          },
          opacity: 0.15
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: 110, width: "100%" }} />;
}