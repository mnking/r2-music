import { createClient, Client } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

export const isTursoConfigured = !!TURSO_DATABASE_URL;

let client: Client | null = null;

export function getTursoClient(): Client | null {
  if (!isTursoConfigured) return null;
  if (client) return client;

  client = createClient({
    url: TURSO_DATABASE_URL!,
    authToken: TURSO_AUTH_TOKEN,
  });

  return client;
}

export async function initTursoSchema(): Promise<void> {
  const db = getTursoClient();
  if (!db) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS song_plays (
      song_key TEXT PRIMARY KEY,
      song_title TEXT NOT NULL,
      play_count INTEGER NOT NULL DEFAULT 0,
      last_played_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_song_plays_count ON song_plays(play_count DESC)
  `);
}

export interface SongPlay {
  song_key: string;
  song_title: string;
  play_count: number;
  last_played_at: string | null;
}

export async function incrementPlayCount(
  songKey: string,
  songTitle: string
): Promise<void> {
  const db = getTursoClient();
  if (!db) return;

  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO song_plays (song_key, song_title, play_count, last_played_at)
      VALUES (?, ?, 1, ?)
      ON CONFLICT(song_key) DO UPDATE SET
        play_count = play_count + 1,
        last_played_at = excluded.last_played_at,
        song_title = excluded.song_title
    `,
    args: [songKey, songTitle, now],
  });
}

export async function getMostPlayedSongs(limit: number = 10): Promise<SongPlay[]> {
  const db = getTursoClient();
  if (!db) return [];

  const result = await db.execute({
    sql: `
      SELECT song_key, song_title, play_count, last_played_at
      FROM song_plays
      ORDER BY play_count DESC, last_played_at DESC
      LIMIT ?
    `,
    args: [limit],
  });

  return result.rows.map((row) => ({
    song_key: String(row.song_key),
    song_title: String(row.song_title),
    play_count: Number(row.play_count),
    last_played_at: row.last_played_at ? String(row.last_played_at) : null,
  }));
}
