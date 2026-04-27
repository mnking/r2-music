import { NextResponse } from "next/server";
import { getNewestSongs } from "@/lib/r2";

export async function GET() {
  try {
    const songs = await getNewestSongs(10);
    return NextResponse.json({ songs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching newest songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch newest songs", details: message },
      { status: 500 }
    );
  }
}
