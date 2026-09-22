"use client";

// Assure-toi que le chemin d'import correspond bien à l'endroit où tu as créé la Sidebar
import { Sidebar } from "@/components/layout/sidebar"; 

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900">
      
      {/* Nouvelle barre de navigation latérale gauche repliable */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="min-w-0 flex-1 relative flex flex-col">
        {children}
      </main>
      
    </div>
  );
}