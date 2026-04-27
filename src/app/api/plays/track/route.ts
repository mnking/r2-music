import { NextResponse } from "next/server";
import { initTursoSchema, incrementPlayCount, isTursoConfigured } from "@/lib/turso";

export async function POST(request: Request) {
  try {
    if (!isTursoConfigured) {
      return NextResponse.json(
        { error: "Turso is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { songKey, songTitle } = body;

    if (!songKey || typeof songKey !== "string") {
      return NextResponse.json(
        { error: "songKey is required" },
        { status: 400 }
      );
    }

    await initTursoSchema();
    await incrementPlayCount(songKey, songTitle || songKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error tracking play:", error);
    return NextResponse.json(
      { error: "Failed to track play", details: message },
      { status: 500 }
    );
  }
}
