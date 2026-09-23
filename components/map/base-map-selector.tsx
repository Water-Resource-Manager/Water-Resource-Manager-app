"use client";

import { Map as MapIcon, Satellite } from "lucide-react";

type MapType = "plan" | "satellite";

type BaseMapSelectorProps = {
  mapType: MapType;
  onChange: (type: MapType) => void;
};

export function BaseMapSelector({ mapType, onChange }: BaseMapSelectorProps) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur rounded-full border border-slate-200 shadow-sm p-1 flex items-center space-x-1">
      <button
        onClick={() => onChange("plan")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mapType === "plan" 
            ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100" 
            : "text-slate-600 hover:bg-slate-50 border border-transparent"
        }`}
      >
        <MapIcon className="w-4 h-4" />
        <span>Plan</span>
      </button>
      <button
        onClick={() => onChange("satellite")}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mapType === "satellite" 
            ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100" 
            : "text-slate-600 hover:bg-slate-50 border border-transparent"
        }`}
      >
        <Satellite className="w-4 h-4" />
        <span>Satellite</span>
      </button>
    </div>
  );
}