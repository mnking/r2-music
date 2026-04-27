import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Play,
  Music,
  HardDrive,
  Clock,
  Calendar,
  FileAudio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSongByKey } from "@/lib/r2";

interface Props {
  params: Promise<{ key: string }>;
}

export default async function SongDetailPage({ params }: Props) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);
  const song = await getSongByKey(decodedKey);

  if (!song) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileExtension = (key: string) => {
    const ext = key.split(".").pop()?.toUpperCase() || "UNKNOWN";
    return ext;
  };

  const getMimeType = (key: string) => {
    const ext = key.split(".").pop()?.toLowerCase();
    const types: Record<string, string> = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      flac: "audio/flac",
      aac: "audio/aac",
      ogg: "audio/ogg",
      m4a: "audio/mp4",
      wma: "audio/x-ms-wma",
    };
    return types[ext || ""] || "audio/mpeg";
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      {/* Header gradient */}
      <div className="bg-gradient-to-b from-[#1a3a2e] via-[#16213e]/60 to-[#121212] pb-8">
        <div className="max-w-3xl mx-auto px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to library</span>
          </Link>

          <div className="flex items-end gap-6">
            {/* Album art */}
            <div className="w-52 h-52 bg-[#282828] rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0">
              <Music className="w-20 h-20 text-[#535353]" />
            </div>

            {/* Info */}
            <div className="pb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                {getFileExtension(song.key)}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {song.title}
              </h1>
              <p className="text-[#b3b3b3] text-sm">
                {(song.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                {getFileExtension(song.key)} · Uploaded{" "}
                {formatDate(song.lastModified)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-10">
          <Link href={`/?play=${encodeURIComponent(song.key)}`}>
            <Button className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 transition-all flex items-center justify-center">
              <Play className="w-6 h-6 text-black ml-0.5" />
            </Button>
          </Link>

          <a
            href={song.url}
            download={song.key}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:border-white hover:bg-white/5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>

        {/* Details grid */}
        <div className="bg-[#181818] rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">File Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[#282828] rounded-lg">
              <FileAudio className="w-5 h-5 text-[#1db954]" />
              <div>
                <p className="text-xs text-[#b3b3b3]">File Name</p>
                <p className="text-sm font-medium truncate">{song.key}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#282828] rounded-lg">
              <HardDrive className="w-5 h-5 text-[#1db954]" />
              <div>
                <p className="text-xs text-[#b3b3b3]">File Size</p>
                <p className="text-sm font-medium">
                  {(song.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#282828] rounded-lg">
              <Music className="w-5 h-5 text-[#1db954]" />
              <div>
                <p className="text-xs text-[#b3b3b3]">Format</p>
                <p className="text-sm font-medium">{getFileExtension(song.key)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#282828] rounded-lg">
              <Calendar className="w-5 h-5 text-[#1db954]" />
              <div>
                <p className="text-xs text-[#b3b3b3]">Uploaded</p>
                <p className="text-sm font-medium">
                  {formatDate(song.lastModified)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Audio preview */}
        <div className="mt-6 bg-[#181818] rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Preview</h2>
          <audio
            controls
            className="w-full [&::-webkit-media-controls-panel]:bg-[#282828] [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white"
            src={song.url}
          />
        </div>
      </div>
    </main>
  );
}
