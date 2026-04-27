import { NextResponse } from "next/server";
import { listSongs } from "@/lib/r2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || undefined;

    const songs = await listSongs(prefix);
    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error listing songs:", error);
    return NextResponse.json(
      { error: "Failed to list songs" },
      { status: 500 }
    );
  }
}
