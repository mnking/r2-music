"use client";

import { useState, useMemo } from "react";
import { Search, Play, Music, Clock, HardDrive, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Song } from "@/lib/r2";

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
  isLoading: boolean;
}

export default function SongList({
  songs,
  currentSong,
  isPlaying,
  onSongSelect,
  isLoading,
}: SongListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.key.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (size: number) => {
    // Rough estimate: 1MB ≈ 1 minute at 128kbps
    const minutes = Math.round(size / 1024 / 1024);
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-[#181818] rounded-lg animate-pulse w-1/3" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg animate-pulse"
          >
            <div className="w-5 h-5 bg-[#282828] rounded" />
            <div className="w-10 h-10 bg-[#282828] rounded" />
            <div className="flex-1 h-4 bg-[#282828] rounded w-1/3" />
            <div className="w-24 h-4 bg-[#282828] rounded" />
            <div className="w-20 h-4 bg-[#282828] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Songs</h2>
          <p className="text-sm text-[#b3b3b3] mt-1">
            {filteredSongs.length} song{filteredSongs.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b3]" />
        <Input
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 bg-white/10 border-transparent text-white placeholder:text-[#b3b3b3] rounded-full focus-visible:bg-white/15 focus-visible:ring-0 focus-visible:border-transparent hover:bg-white/15 transition-colors"
        />
      </div>

      {/* Table header */}
      {filteredSongs.length > 0 && (
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 pb-2 border-b border-white/10 text-sm text-[#b3b3b3] uppercase tracking-wider">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span className="text-right">Date Added</span>
          <span className="text-right w-20">Size</span>
        </div>
      )}

      {/* Song list */}
      <div className="space-y-1">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-5">
              <Music className="w-8 h-8 text-[#b3b3b3]" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery ? "No songs found" : "No songs yet"}
            </h3>
            <p className="text-[#b3b3b3]">
              {searchQuery
                ? "Try a different search term"
                : "Upload audio files to your R2 bucket to see them here"}
            </p>
          </div>
        ) : (
          filteredSongs.map((song, index) => {
            const isCurrentSong = currentSong?.key === song.key;
            return (
              <div
                key={song.key}
                className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-4 py-3 rounded-md cursor-pointer transition-colors ${
                  isCurrentSong
                    ? "bg-[#282828]"
                    : "hover:bg-white/5"
                }`}
                onClick={() => onSongSelect(song)}
              >
                {/* Index / Play button */}
                <div className="w-8 text-center flex items-center justify-center">
                  {isCurrentSong && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3.5">
                      <div className="w-0.5 bg-[#1db954] animate-[bounce_1s_infinite] h-2" />
                      <div className="w-0.5 bg-[#1db954] animate-[bounce_1.2s_infinite] h-3.5" />
                      <div className="w-0.5 bg-[#1db954] animate-[bounce_0.8s_infinite] h-2.5" />
                    </div>
                  ) : (
                    <span className="text-sm text-[#b3b3b3] group-hover:hidden">
                      {index + 1}
                    </span>
                  )}
                  <button className="hidden group-hover:flex items-center justify-center w-8 h-8">
                    {isCurrentSong && isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Title */}
                <div className="min-w-0 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                    isCurrentSong ? "bg-[#1db954]/20" : "bg-[#282828]"
                  }`}>
                    <Music className={`w-4 h-4 ${isCurrentSong ? "text-[#1db954]" : "text-[#b3b3b3]"}`} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrentSong ? "text-[#1db954]" : "text-white"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-[#b3b3b3] truncate">
                      Audio file
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="hidden md:block text-right">
                  <span className="text-sm text-[#b3b3b3]">
                    {formatDate(song.lastModified)}
                  </span>
                </div>

                {/* Size */}
                <div className="text-right w-20">
                  <span className="text-sm text-[#b3b3b3]">
                    {(song.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
