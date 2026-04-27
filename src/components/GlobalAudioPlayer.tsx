"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/components/PlayerProvider";

export default function GlobalAudioPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-white/10 px-4 py-3 z-50">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto gap-4">
        {/* Song info */}
        <div className="flex items-center gap-4 w-[30%] min-w-0">
          <div className="w-14 h-14 bg-[#282828] rounded flex items-center justify-center flex-shrink-0">
            {currentSong ? (
              <Music2 className="w-6 h-6 text-[#b3b3b3]" />
            ) : (
              <Music2 className="w-6 h-6 text-[#535353]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentSong?.title || "No song selected"}
            </p>
            <p className="text-xs text-[#b3b3b3] truncate">
              {currentSong
                ? `${(currentSong.size / 1024 / 1024).toFixed(1)} MB`
                : "Select a song to play"}
            </p>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[40%]">
          <div className="flex items-center gap-4">
            <button
              className="text-[#b3b3b3] hover:text-white transition-colors"
              onClick={playPrevious}
              disabled={!currentSong}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
              onClick={togglePlay}
              disabled={!currentSong}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5" />
              )}
            </button>
            <button
              className="text-[#b3b3b3] hover:text-white transition-colors"
              onClick={playNext}
              disabled={!currentSong}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-[#b3b3b3] w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={(v) => seek(Array.isArray(v) ? v[0] : v)}
              className="flex-1 cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_.bg-primary]:bg-white [&_.bg-primary]:opacity-100 hover:[&_.bg-primary]:bg-[#1db954]"
            />
            <span className="text-xs text-[#b3b3b3] w-10 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-[30%] justify-end">
          <button
            className="text-[#b3b3b3] hover:text-white transition-colors"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
            className="w-24 cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_.bg-primary]:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
