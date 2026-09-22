"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  LineChart,
  Sparkles,
  LayoutTemplate,
  Settings,
  ChevronLeft,
  ChevronRight,
  Droplets,
  HelpCircle
} from "lucide-react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  
  // On détecte si on est sur la carte pour adapter le comportement de la cale
  const isMapPage = pathname === "/map";

  const navItems = [
    { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
    { name: "Carte SIG", href: "/map", icon: MapIcon },
    { name: "Analyse temporelle", href: "/analytics", icon: LineChart },
    { name: "Prédictions IA", href: "/predictions", icon: Sparkles },
    { name: "Synoptique", href: "/synoptic", icon: LayoutTemplate },
    { name: "Configuration", href: "/settings", icon: Settings },
    // TODO: Intégrer l'icône de l'API Météo-France dans le menu latéral
  ];

  return (
    <>
      {/* 1. La Cale (Spacer) : Maintient l'espace pour ne pas casser la mise en page */}
      <div 
        className={`shrink-0 h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[80px]" : (isMapPage ? "w-[80px]" : "w-[280px]")
        }`} 
      />

      {/* 2. La vraie barre latérale (Flottante par-dessus le contenu via "fixed") */}
      <aside
        className={`fixed left-0 top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? "w-[80px]" : "w-[280px]"
        }`}
      >
        {/* Bouton de repli/dépliage */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-teal-700 z-50 transition-transform"
          aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* En-tête : Logo */}
        <div className="flex h-20 shrink-0 items-center justify-center border-b border-slate-100 px-4">
          <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "w-full"}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-white shadow-sm">
              <Droplets className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-base font-bold text-slate-900 leading-tight">HydroManager</span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  Ressource en eau
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center rounded-lg px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } ${isCollapsed ? "justify-center" : "gap-3"}`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pied de page : Aide métier */}
        <div className="p-4">
          <div
            className={`overflow-hidden rounded-xl bg-teal-50/50 border border-teal-100/50 transition-all duration-300 ${
              isCollapsed ? "flex h-12 w-12 items-center justify-center mx-auto p-0 cursor-pointer hover:bg-teal-100/50" : "p-4"
            }`}
            title={isCollapsed ? "Aide métier" : undefined}
          >
            {isCollapsed ? (
              <HelpCircle className="h-5 w-5 text-teal-700" />
            ) : (
              <>
                <div className="flex items-center gap-2 text-teal-900 mb-2 whitespace-nowrap">
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Aide métier</span>
                </div>
                <p className="text-xs leading-relaxed text-teal-800/80">
                  Surveillez les piézomètres Hub'Eau, les seuils de sécheresse et l'évolution des nappes en temps réel.
                </p>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}