"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Play, Clock, Pause } from "lucide-react";
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
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);

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
      <div className="mb-8">
        <div className="h-8 bg-[#181818] rounded animate-pulse w-48 mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#181818] rounded-lg p-4 animate-pulse"
            >
              <div className="w-full aspect-square bg-[#282828] rounded-md mb-4" />
              <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#282828] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (songs.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-5">
        Newest Uploads
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {songs.map((song) => {
          const isCurrent = currentSong?.key === song.key;
          const isHovered = hoveredSong === song.key;
          return (
            <div
              key={song.key}
              className="group relative bg-[#181818] hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-colors duration-300"
              onClick={() => onSongSelect(song)}
              onMouseEnter={() => setHoveredSong(song.key)}
              onMouseLeave={() => setHoveredSong(null)}
            >
              {/* Album art placeholder */}
              <div className="relative w-full aspect-square bg-[#282828] group-hover:bg-[#383838] rounded-md mb-4 flex items-center justify-center transition-colors">
                <svg
                  className="w-12 h-12 text-[#535353]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>

                {/* Play button overlay */}
                <div
                  className={`absolute bottom-2 right-2 w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-all duration-300 ${
                    isHovered || isCurrent
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-5 h-5 text-black" />
                  ) : (
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  )}
                </div>

                {/* Playing indicator */}
                {isCurrent && isPlaying && !isHovered && (
                  <div className="absolute bottom-2 right-2 flex gap-0.5 items-end h-4 bg-black/60 rounded px-1.5 py-1">
                    <div className="w-0.5 bg-[#1db954] animate-[bounce_1s_infinite] h-2" />
                    <div className="w-0.5 bg-[#1db954] animate-[bounce_1.2s_infinite] h-4" />
                    <div className="w-0.5 bg-[#1db954] animate-[bounce_0.8s_infinite] h-3" />
                  </div>
                )}
              </div>

              {/* Info */}
              <h3
                className={`text-sm font-semibold truncate mb-1 ${
                  isCurrent ? "text-[#1db954]" : "text-white"
                }`}
              >
                {song.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3]">
                <Clock className="w-3 h-3" />
                <span>{formatDate(song.lastModified)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
