"use client";

import { useState, useMemo } from "react";
import { Search, Play, Music, Clock, HardDrive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-100" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500 px-1">
        <span>
          {filteredSongs.length} song{filteredSongs.length !== 1 ? "s" : ""}
        </span>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-1 text-zinc-500 hover:text-zinc-300"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-2 pr-4">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No songs found</p>
              <p className="text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload audio files to your R2 bucket"}
              </p>
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isCurrentSong = currentSong?.key === song.key;
              return (
                <Card
                  key={song.key}
                  className={`group cursor-pointer border-0 transition-colors ${
                    isCurrentSong
                      ? "bg-zinc-800 hover:bg-zinc-700"
                      : "bg-zinc-900/50 hover:bg-zinc-800"
                  }`}
                  onClick={() => onSongSelect(song)}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCurrentSong
                          ? "bg-zinc-700 text-zinc-100"
                          : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    >
                      {isCurrentSong && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-4">
                          <div className="w-1 bg-current animate-[bounce_1s_infinite] h-2" />
                          <div className="w-1 bg-current animate-[bounce_1.2s_infinite] h-4" />
                          <div className="w-1 bg-current animate-[bounce_0.8s_infinite] h-3" />
                        </div>
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrentSong ? "text-zinc-100" : "text-zinc-300"
                        }`}
                      >
                        {song.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {(song.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(song.lastModified)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
