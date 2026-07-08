"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  quote: string;
  filename?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src, quote, filename }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Also try to update duration on time update in case metadata wasn't loaded
      updateDuration();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      updateDuration();
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    // Try to get duration immediately if already loaded
    updateDuration();

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayFilename = filename || src.split("/").pop() || "audio.wav";

  return (
    <div className="rounded-[20px] bg-[#B8C6B0] p-6">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Quote */}
      <p className="text-[#313131] text-lg leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Controls Row */}
      <div className="flex items-center gap-3 mt-4">
        {/* Play/Stop Button */}
        <button
          onClick={togglePlayPause}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className={`flex-shrink-0 flex items-center justify-center w-[25px] h-[25px] transition-transform duration-100 ease-out cursor-pointer ${
            isPressed ? "scale-[0.85]" : "scale-100"
          }`}
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            // Stop SVG
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="20" rx="4" fill="#596647"/>
            </svg>
          ) : (
            // Play SVG
            <svg width="22" height="25" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.25 9.49967C22.25 10.6544 22.25 13.5411 20.25 14.6958L4.5 23.7891C2.5 24.9438 -1.00947e-07 23.5004 0 21.191L7.94957e-07 3.00447C8.95904e-07 0.69507 2.5 -0.7483 4.5 0.4064L20.25 9.49967Z" fill="#596647"/>
            </svg>
          )}
        </button>

        {/* Progress Bar Track */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative flex-1 h-[3px] bg-[#596647]/30 rounded-full cursor-pointer group"
        >
          {/* Progress Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-[#596647] rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber Head - visible on hover */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#596647] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-sm"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>

      {/* Filename and Timestamps Row */}
      <div className="flex justify-between items-center mt-2 pl-[37px]">
        <span className="text-sm text-[#596647] font-medium">
          {displayFilename}
        </span>
        <span className="text-sm text-[#596647]/70 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

