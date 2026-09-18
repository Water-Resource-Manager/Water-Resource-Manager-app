"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MapInterface() {
  // État local uniquement pour tester l'ouverture du panneau
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* Calque d'interface au-dessus de la carte, sans bloquer le déplacement */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute top-4 left-4 w-[min(calc(100%-2rem),20rem)]">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher une ressource…"
            aria-label="Rechercher une ressource"
            className="h-10 bg-background/95 shadow-md backdrop-blur-sm"
          />
        </div>

        <div className="pointer-events-auto absolute top-4 right-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 bg-background/95 shadow-md backdrop-blur-sm"
            onClick={() => setIsDetailsOpen(true)}
          >
            Test Panneau
          </Button>
        </div>
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Détails de la ressource</SheetTitle>
            <SheetDescription>
              Les informations de la ressource s’afficheront ici. Aucune donnée
              n’est encore connectée.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
