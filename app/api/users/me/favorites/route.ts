import { NextResponse } from "next/server";

// Pour un POC, une simple variable en mémoire est suffisante.
// (Elle se videra juste si tu redémarres complètement ton serveur de dev)
let mockFavorites: any[] = [];

// LIRE LE PANIER
export async function GET() {
  return NextResponse.json(mockFavorites);
}

// AJOUTER AU PANIER
export async function POST(request: Request) {
  try {
    const station = await request.json();
    
    const exists = mockFavorites.find((f) => f.id === station.id);
    if (!exists) {
      mockFavorites.push(station);
    }
    
    return NextResponse.json(mockFavorites);
  } catch (error) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
}

// SUPPRIMER DU PANIER
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (id) {
    mockFavorites = mockFavorites.filter((f) => f.id !== id);
  }
  
  return NextResponse.json(mockFavorites);
}