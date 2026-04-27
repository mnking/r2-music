export async function trackPlay(songKey: string, songTitle: string): Promise<void> {
  try {
    await fetch("/api/plays/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songKey, songTitle }),
    });
  } catch (error) {
    console.error("Failed to track play:", error);
  }
}

export interface MostPlayedSong {
  song_key: string;
  song_title: string;
  play_count: number;
  last_played_at: string | null;
}

export async function getMostPlayed(limit: number = 10): Promise<MostPlayedSong[]> {
  try {
    const response = await fetch(`/api/plays/most-played?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch most played");
    const data = await response.json();
    return data.songs || [];
  } catch (error) {
    console.error("Failed to get most played:", error);
    return [];
  }
}
