"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Droplets,
  HelpCircle,
  LayoutDashboard,
  Map,
  Settings2,
  Sparkles,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/map", label: "Carte SIG", icon: Map },
  { href: "/analytics", label: "Analyse temporelle", icon: Activity },
  { href: "/predictions", label: "Prédictions IA", icon: Sparkles },
  { href: "/synoptic", label: "Synoptique", icon: Workflow },
  { href: "/admin/config", label: "Configuration", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900">
      {/* Barre de navigation latérale gauche */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-2.5 border-b border-slate-200/80 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none tracking-tight text-teal-950">
              HydroManager
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ressource en eau
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-teal-200/60 bg-teal-50/70 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-teal-900">
            <HelpCircle className="h-3.5 w-3.5" />
            Aide métier
          </div>
          <p className="text-[11px] leading-relaxed text-teal-800/80">
            Surveillez les piézomètres Hub&apos;Eau, les seuils de sécheresse et l&apos;évolution des nappes en temps réel.
          </p>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="min-w-0 flex-1 relative flex flex-col">{children}</main>
    </div>
  );
}