"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Song } from "@/lib/r2";

interface AudioPlayerProps {
  currentSong: Song | null;
  songs: Song[];
  onSongChange: (song: Song) => void;
}

export default function AudioPlayer({
  currentSong,
  songs,
  onSongChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentSong]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((value: number | readonly number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    if (audioRef.current && typeof time === "number") {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number | readonly number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    if (typeof newVolume === "number") {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.key === currentSong.key);
    const nextIndex = (currentIndex + 1) % songs.length;
    onSongChange(songs[nextIndex]);
    setIsPlaying(true);
  }, [currentSong, songs, onSongChange]);

  const playPrevious = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.key === currentSong.key);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    onSongChange(songs[prevIndex]);
    setIsPlaying(true);
  }, [currentSong, songs, onSongChange]);

  const handleEnded = useCallback(() => {
    playNext();
  }, [playNext]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 px-4 py-3 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Progress bar */}
      <div className="mb-3">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Song info */}
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <ListMusic className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {currentSong?.title || "No song selected"}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {currentSong ? `${(currentSong.size / 1024 / 1024).toFixed(1)} MB` : "Select a song to play"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 justify-center w-1/3">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={playPrevious}
            disabled={songs.length === 0}
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 text-zinc-100 hover:text-white hover:bg-zinc-800"
            onClick={togglePlay}
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={playNext}
            disabled={songs.length === 0}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 justify-end w-1/3">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
