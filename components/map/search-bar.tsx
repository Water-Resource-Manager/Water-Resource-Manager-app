"use client";

import { useState, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { Search, MapPin, Loader2, X } from "lucide-react";

type SearchResult = {
  id: string;
  label: string;
  context: string;
  type: "address";
  coordinates: [number, number]; // [longitude, latitude]
  zoom: number;
};

export function SearchBar() {
  const { current: map } = useMap(); 
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Moteur de recherche via la Base Adresse Nationale (BAN)
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const newResults: SearchResult[] = [];

      try {
        const banRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
        const banData = await banRes.json();
        
        if (banData.features) {
          banData.features.forEach((f: any) => {
            newResults.push({
              id: f.properties.id,
              label: f.properties.label,
              context: f.properties.context,
              type: "address",
              coordinates: f.geometry.coordinates,
              zoom: f.properties.type === "municipality" ? 12 : 15,
            });
          });
        }

        setResults(newResults);
        if (newResults.length > 0) setIsOpen(true);
      } catch (err) {
        console.error("Erreur de recherche d'adresse:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const [longitude, latitude] = result.coordinates;
    
    if (map) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: result.zoom,
        duration: 2500,
        essential: true
      });
    }

    setQuery(result.label);
    setIsOpen(false);
  };

  // UI Améliorée : Centrage (left-1/2 -translate-x-1/2), largeur (w-96) et arrondi (rounded-full)
  return (
    <div ref={wrapperRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-96">
      <div className="relative flex items-center w-full bg-white/95 backdrop-blur rounded-full border border-slate-200 shadow-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
        <div className="pl-4 text-slate-400">
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          placeholder="Rechercher une commune, une adresse..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 3) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="pr-4 text-slate-400 hover:text-slate-600 outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu déroulant des résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="flex items-start text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{result.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{result.context}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}