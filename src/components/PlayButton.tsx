"use client";

import { Play, Pause } from "lucide-react";
import { usePlayer } from "@/components/PlayerProvider";
import { Song } from "@/lib/r2";

export default function PlayButton({ song }: { song: Song }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const isCurrent = currentSong?.key === song.key;

  return (
    <button
      onClick={() => playSong(song)}
      className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 transition-all flex items-center justify-center"
    >
      {isCurrent && isPlaying ? (
        <Pause className="w-6 h-6 text-black" />
      ) : (
        <Play className="w-6 h-6 text-black ml-0.5" />
      )}
    </button>
  );
}
