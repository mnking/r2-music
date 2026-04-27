import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface Song {
  key: string;
  title: string;
  size: number;
  lastModified: Date;
  url: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function sanitizeTitle(key: string): string {
  return key
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function listSongs(prefix?: string): Promise<Song[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: prefix || "",
  });

  const response = await r2Client.send(command);
  const audioExtensions = [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"];

  const songs: Song[] =
    response.Contents?.filter((obj) => {
      const key = obj.Key || "";
      return audioExtensions.some((ext) => key.toLowerCase().endsWith(ext));
    }).map((obj) => ({
      key: obj.Key!,
      title: sanitizeTitle(obj.Key!),
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
      url: "", // Will be populated later
    })) || [];

  // Generate URLs for each song
  for (const song of songs) {
    song.url = await getSongUrl(song.key);
  }

  return songs;
}

export async function getSongUrl(key: string): Promise<string> {
  // If public URL is configured, use it directly
  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.endsWith("/") ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
    return `${baseUrl}/${encodeURIComponent(key)}`;
  }

  // Otherwise use the proxy API route (no expiration issues)
  return `/api/songs/${encodeURIComponent(key)}`;
}

export async function streamSong(key: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);
  return response;
}
