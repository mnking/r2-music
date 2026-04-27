"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Play, Pause, TrendingUp } from "lucide-react";
import { usePlayer } from "@/components/PlayerProvider";
import { getMostPlayed, MostPlayedSong } from "@/lib/plays";

export default function MostPlayedSongs() {
  const { songs, currentSong, isPlaying, playSong } = usePlayer();
  const [mostPlayed, setMostPlayed] = useState<MostPlayedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const data = await getMostPlayed(10);
        if (active) setMostPlayed(data);
      } catch (error) {
        console.error("Error fetching most played songs:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // Match most played keys with actual songs from context
  const matchedSongs = useMemo(() => {
    const songMap = new Map(songs.map((s) => [s.key, s]));
    return mostPlayed
      .map((mp) => {
        const song = songMap.get(mp.song_key);
        if (!song) return null;
        return { song, playCount: mp.play_count };
      })
      .filter(Boolean) as { song: (typeof songs)[0]; playCount: number }[];
  }, [mostPlayed, songs]);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  if (isLoading && matchedSongs.length === 0) {
    return (
      <div className="mb-10">
        <div className="h-8 bg-[#181818] rounded animate-pulse w-48 mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#181818] rounded-lg p-4 animate-pulse">
              <div className="w-full aspect-square bg-[#282828] rounded-md mb-4" />
              <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#282828] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (matchedSongs.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold tracking-tight mb-5">
        Most Played
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {matchedSongs.map(({ song, playCount }) => {
          const isCurrent = currentSong?.key === song.key;
          const isHovered = hoveredSong === song.key;
          return (
            <div
              key={song.key}
              className="group relative bg-[#181818] hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-colors duration-300"
              onClick={() => playSong(song)}
              onMouseEnter={() => setHoveredSong(song.key)}
              onMouseLeave={() => setHoveredSong(null)}
            >
              <div className="relative w-full aspect-square bg-[#282828] group-hover:bg-[#383838] rounded-md mb-4 flex items-center justify-center transition-colors">
                <svg className="w-12 h-12 text-[#535353]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>

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

                {isCurrent && isPlaying && !isHovered && (
                  <div className="absolute bottom-2 right-2 flex gap-0.5 items-end h-4 bg-black/60 rounded px-1.5 py-1">
                    <div className="w-0.5 bg-[#1db954] animate-[bounce_1s_infinite] h-2" />
                    <div className="w-0.5 bg-[#1db954] animate-[bounce_1.2s_infinite] h-4" />
                    <div className="w-0.5 bg-[#1db954] animate-[bounce_0.8s_infinite] h-3" />
                  </div>
                )}
              </div>

              <Link
                href={`/songs/${encodeURIComponent(song.key)}`}
                onClick={(e) => e.stopPropagation()}
                className={`text-sm font-semibold truncate mb-1 hover:underline block ${
                  isCurrent ? "text-[#1db954]" : "text-white"
                }`}
              >
                {song.title}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3]">
                <TrendingUp className="w-3 h-3" />
                <span>{formatNumber(playCount)} plays</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
