import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Validate config on first use
function validateConfig() {
  const missing: string[] = [];
  if (!R2_ACCOUNT_ID) missing.push("R2_ACCOUNT_ID");
  if (!R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID");
  if (!R2_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY");
  if (!R2_BUCKET_NAME) missing.push("R2_BUCKET_NAME");

  if (missing.length > 0) {
    throw new Error(`Missing R2 environment variables: ${missing.join(", ")}`);
  }
}

function getClient(): S3Client {
  validateConfig();
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
}

export interface Song {
  key: string;
  title: string;
  size: number;
  lastModified: string;
  url: string;
}

function sanitizeTitle(key: string): string {
  return key
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function listSongs(prefix?: string): Promise<Song[]> {
  const client = getClient();
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME!,
    Prefix: prefix || "",
  });

  const response = await client.send(command);
  const audioExtensions = [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"];

  const songs: Song[] =
    response.Contents?.filter((obj) => {
      const key = obj.Key || "";
      return audioExtensions.some((ext) => key.toLowerCase().endsWith(ext));
    }).map((obj) => ({
      key: obj.Key!,
      title: sanitizeTitle(obj.Key!),
      size: obj.Size || 0,
      lastModified: (obj.LastModified || new Date()).toISOString(),
      url: "", // Will be populated later
    })) || [];

  // Generate URLs for each song
  for (const song of songs) {
    song.url = await getSongUrl(song.key);
  }

  return songs;
}

export async function getNewestSongs(limit: number = 10): Promise<Song[]> {
  const songs = await listSongs();
  return songs
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, limit);
}

export async function getSongByKey(key: string): Promise<Song | null> {
  const client = getClient();
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME!,
    Prefix: key,
    MaxKeys: 1,
  });

  const response = await client.send(command);
  const obj = response.Contents?.[0];
  if (!obj || obj.Key !== key) return null;

  const audioExtensions = [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"];
  if (!audioExtensions.some((ext) => key.toLowerCase().endsWith(ext))) {
    return null;
  }

  return {
    key: obj.Key!,
    title: sanitizeTitle(obj.Key!),
    size: obj.Size || 0,
    lastModified: (obj.LastModified || new Date()).toISOString(),
    url: await getSongUrl(obj.Key!),
  };
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
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
  });

  const response = await client.send(command);
  return response;
}
