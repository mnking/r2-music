import { NextResponse } from "next/server";
import { initTursoSchema, getMostPlayedSongs, isTursoConfigured } from "@/lib/turso";

export async function GET(request: Request) {
  try {
    if (!isTursoConfigured) {
      return NextResponse.json({ songs: [] });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    await initTursoSchema();
    const songs = await getMostPlayedSongs(limit);

    return NextResponse.json({ songs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching most played songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch most played songs", details: message },
      { status: 500 }
    );
  }
}
