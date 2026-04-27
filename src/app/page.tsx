"use client";

import { useState, useEffect, useCallback } from "react";
import { Music2, RefreshCw, AlertCircle } from "lucide-react";
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
        setIsPlaying((p) => !p);
        return prev;
      }
      setIsPlaying(true);
      trackPlay(song.key, song.title);
      return song;
    });
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <main className="min-h-screen bg-[#121212] text-white pb-32">
      {/* Hero gradient header */}
      <div className="bg-gradient-to-b from-[#1a1a2e] via-[#16213e]/80 to-[#121212] pb-8">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg shadow-[#1db954]/20">
                <Music2 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">R2 Music</h1>
                <p className="text-sm text-[#b3b3b3]">
                  Stream from Cloudflare R2
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#b3b3b3] hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
              onClick={fetchSongs}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#2a1215] border border-[#5c1c1c] rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#e22134] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-white">Error loading songs</p>
                <p className="text-sm text-[#b3b3b3] mt-0.5">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-[#1db954] hover:text-[#1ed760] hover:bg-[#1db954]/10 h-auto py-1.5 px-3"
                  onClick={fetchSongs}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
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
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onSongChange={handleSongSelect}
      />
    </main>
  );
}
