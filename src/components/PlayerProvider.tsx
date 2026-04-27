"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { Song } from "@/lib/r2";
import { trackPlay } from "@/lib/plays";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load song when currentSong changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
    }
  }, [currentSong?.key]);

  // Play/pause when isPlaying changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Play failed:", err.message);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong?.key]);

  const playSong = useCallback((song: Song) => {
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

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    setIsPlaying((p) => !p);
  }, [currentSong]);

  const playNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.key === currentSong.key);
    const next = songs[(idx + 1) % songs.length];
    setCurrentSong(next);
    setIsPlaying(true);
    trackPlay(next.key, next.title);
  }, [currentSong, songs]);

  const playPrevious = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.key === currentSong.key);
    const prev = songs[(idx - 1 + songs.length) % songs.length];
    setCurrentSong(prev);
    setIsPlaying(true);
    trackPlay(prev.key, prev.title);
  }, [currentSong, songs]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
        songs,
        setSongs,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={playNext}
      />
      {children}
    </PlayerContext.Provider>
  );
}
