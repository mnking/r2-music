import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Play history types
export interface PlayHistory {
  id?: number;
  song_key: string;
  song_title: string;
  played_at: string;
}

export async function trackPlay(songKey: string, songTitle: string) {
  if (!supabase) return;

  try {
    await supabase.from("play_history").insert({
      song_key: songKey,
      song_title: songTitle,
      played_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to track play:", error);
  }
}

export async function getRecentPlays(limit: number = 10): Promise<PlayHistory[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("play_history")
    .select("*")
    .order("played_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to get recent plays:", error);
    return [];
  }

  return data || [];
}
