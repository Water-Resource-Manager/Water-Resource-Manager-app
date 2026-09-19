import Link from "next/link";
import { ArrowRight, AlertTriangle, Activity, Database, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          DSP Eau - Bassin Hydrologique
        </p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          HydroManager
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Pilotez la ressource en eau : cartographie des ouvrages, chroniques piézométriques et prévisions de recharge de nappe.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors shadow-sm"
          >
            Ouvrir la carte <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Analyse temporelle
          </Link>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Stations actives</span>
            <Database className="h-4 w-4 text-teal-700" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">1 000</p>
          <p className="text-xs text-slate-500 mt-1">Capteurs piézométriques Hub&apos;Eau</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Statut du réseau</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">Normal</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Flux de données API synchrone</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Suivi Sécheresse</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">Vigilance</p>
          <p className="text-xs text-slate-500 mt-1">Seuils préfectoraux suivis</p>
        </div>
      </div>

      {/* Section des actions guidées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Situation des ouvrages</h2>
          <div className="space-y-3">
            {["Forage F1 - Les Aires", "Piézomètre PZ-12", "Station de jaugeage - Orb"].map((station, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-800">{station}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Normal
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Parcours rapides</h2>
          <div className="space-y-3">
            <Link
              href="/map"
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all group"
            >
              <Activity className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 group-hover:text-teal-900">
                  Visualiser le réseau sur la carte SIG
                </p>
                <p className="text-xs text-slate-500">Consultez les 1 000 stations piézométriques nationales.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}