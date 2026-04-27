"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Clock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/lib/r2";

interface NewestSongsProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
}

export default function NewestSongs({
  currentSong,
  isPlaying,
  onSongSelect,
}: NewestSongsProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNewest = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/songs/newest");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Error fetching newest songs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewest();
  }, [fetchNewest]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Newest Uploads
          </h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-20 bg-zinc-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (songs.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Newest Uploads
          </h2>
          <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
            Top {songs.length}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {songs.map((song, index) => {
          const isCurrent = currentSong?.key === song.key;
          return (
            <button
              key={song.key}
              onClick={() => onSongSelect(song)}
              className={`group flex-shrink-0 w-64 text-left rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                isCurrent
                  ? "bg-violet-950/30 border-violet-800/50"
                  : "bg-zinc-900/60 border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Rank badge */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-400"
                      : index === 1
                      ? "bg-zinc-400/20 text-zinc-300"
                      : index === 2
                      ? "bg-orange-600/20 text-orange-400"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Play icon / indicator */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCurrent && isPlaying
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {isCurrent && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3.5">
                      <div className="w-0.5 bg-current animate-[bounce_1s_infinite] h-2" />
                      <div className="w-0.5 bg-current animate-[bounce_1.2s_infinite] h-3.5" />
                      <div className="w-0.5 bg-current animate-[bounce_0.8s_infinite] h-2.5" />
                    </div>
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isCurrent ? "text-violet-300" : "text-zinc-200"
                    }`}
                  >
                    {song.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(song.lastModified)}
                    </span>
                    <span>{(song.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
