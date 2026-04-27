"use client";

import { useState, useEffect, useCallback } from "react";
import { Music2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/AudioPlayer";
import SongList from "@/components/SongList";
import NewestSongs from "@/components/NewestSongs";
import { Song } from "@/lib/r2";
import { trackPlay } from "@/lib/supabase";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/songs");
      if (!response.ok) {
        throw new Error("Failed to fetch songs");
      }
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleSongSelect = useCallback((song: Song) => {
    setCurrentSong((prev) => {
      if (prev?.key === song.key) {
        // Toggle play/pause if same song
        setIsPlaying((p) => !p);
        return prev;
      }
      setIsPlaying(true);
      // Track play in Supabase (if configured)
      trackPlay(song.key, song.title);
      return song;
    });
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-40">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">R2 Music Player</h1>
              <p className="text-sm text-zinc-500">
                Stream from Cloudflare R2
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={fetchSongs}
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-200 rounded-lg p-4 mb-6">
            <p className="font-medium">Error loading songs</p>
            <p className="text-sm text-red-300/80">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-red-200 hover:text-red-100 hover:bg-red-900/50"
              onClick={fetchSongs}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Newest Songs */}
        {!error && (
          <NewestSongs
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSongSelect={handleSongSelect}
          />
        )}

        {/* Song List */}
        <SongList
          songs={songs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onSongSelect={handleSongSelect}
          isLoading={isLoading}
        />
      </div>

      {/* Audio Player */}
      <AudioPlayer
        currentSong={currentSong}
        songs={songs}
        onSongChange={handleSongSelect}
      />
    </main>
  );
}
