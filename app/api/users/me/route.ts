import { NextResponse } from "next/server";
import mockUser from "@/data/mock-user.json";

export async function GET() {
  // Optionnel : On simule une latence réseau de 500ms pour rendre le POC plus réaliste
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Renvoie le JSON avec le bon Content-Type HTTP
  return NextResponse.json(mockUser);
}