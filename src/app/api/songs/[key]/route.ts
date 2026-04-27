import { NextResponse } from "next/server";
import { streamSong } from "@/lib/r2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const response = await streamSong(decodedKey);

    const headers = new Headers();
    if (response.ContentType) {
      headers.set("Content-Type", response.ContentType);
    }
    if (response.ContentLength) {
      headers.set("Content-Length", response.ContentLength.toString());
    }
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(response.Body as ReadableStream, {
      headers,
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error streaming song:", error);
    return NextResponse.json(
      { error: "Failed to stream song", details: message },
      { status: 500 }
    );
  }
}
