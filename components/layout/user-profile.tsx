"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, User, Settings, LifeBuoy, LogOut } from "lucide-react";

type UserProfile = {
  firstName: string;
  lastName: string;
  role: string;
  avatar: string;
};

export function UserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chargement du profil fictif (BFF)
  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Erreur chargement profil:", err));
  }, []);

  // Fermeture du menu au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return <div className="animate-pulse bg-slate-100 h-11 w-48 rounded-full border border-slate-200"></div>;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton de déclenchement */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-slate-200 rounded-full py-1.5 pl-1.5 pr-3 shadow-sm transition-all hover:shadow-md hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      >
        <div className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
          {user.avatar}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold text-slate-800 leading-tight">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-tight">
            {user.role}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-1 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Connecté en tant que</p>
            <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{user.firstName} {user.lastName}</p>
          </div>
          
          <div className="px-1.5">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors text-left">
              <User className="w-4 h-4" />
              Mon profil
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors text-left">
              <Settings className="w-4 h-4" />
              Préférences
            </button>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors text-left">
              <LifeBuoy className="w-4 h-4" />
              Centre d'aide
            </button>
          </div>
          
          <div className="border-t border-slate-100 mt-1 pt-1 px-1.5">
            <button 
              onClick={() => {
                setIsOpen(false);
                alert("Déconnexion simulée pour le POC. L'auth arrivera en Phase 6 !");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}