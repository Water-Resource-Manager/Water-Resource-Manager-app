import { NextResponse } from "next/server";
import { MAP_LAYERS } from "@/config/map-layers";

export async function GET() {
  // Optionnel : On peut imaginer qu'en Phase 6, ce code fera un "SELECT * FROM layers" dans PostgreSQL
  return NextResponse.json(MAP_LAYERS);
}