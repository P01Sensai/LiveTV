"use client";

import React, { useRef } from "react";
import { MergedChannel } from "@/lib/types";
import { Play } from "lucide-react";

interface ChannelCardProps {
  channel: MergedChannel;
  onPlay: (channel: MergedChannel) => void;
  isAnimeMode?: boolean;
}

export default function ChannelCard({ channel, onPlay, isAnimeMode }: ChannelCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Disable on touch devices for native tap feel
    if (e.pointerType === "touch") return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    const rotateY = x * 18;  // up to 9 deg
    const rotateX = -y * 18; // up to 9 deg

    // Ultra-snappy 0.04s response: follows cursor immediately without drag
    card.style.transition = "transform 0.04s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out";
    card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`;

    if (glareRef.current) {
      const gx = ((x + 0.5) * 100).toFixed(1);
      const gy = ((y + 0.5) * 100).toFixed(1);
      glareRef.current.style.opacity = "0.32";
      glareRef.current.style.background = `radial-gradient(circle 140px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.45) 0%, transparent 80%)`;
    }
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (card) {
      // Smooth, natural spring back to rest
      card.style.transition = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease-out, border-color 0.2s ease-out";
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  const handlePointerEnter = () => {
    const card = cardRef.current;
    if (card) {
      card.style.willChange = "transform";
    }
  };

  return (
    <button
      ref={cardRef}
      onClick={() => onPlay(channel)}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`flex flex-col items-center justify-between gap-0 p-0 bg-surface rounded-xl group focus:outline-none overflow-hidden relative shadow-md hover:shadow-primary/25 cursor-pointer text-left ${
        isAnimeMode 
          ? "border-2 border-primary/90 shadow-[4px_4px_0px_0px_rgba(255,90,38,0.7)] hover:shadow-[6px_6px_0px_0px_rgba(255,90,38,0.9)]" 
          : "border border-border hover:border-primary/60"
      }`}
      style={{
        transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Specular Glass Glare Reflection */}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-200 rounded-xl"
        style={{ opacity: 0 }}
      />

      {/* Live Badge */}
      <div className="absolute top-2 left-2 bg-live text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
      </div>

      {/* Cel-Shaded Anime Badge */}
      {isAnimeMode && (
        <div className="absolute top-2 right-2 bg-primary text-white text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-[2px_2px_0px_#000] border border-black z-10">
          アニメ ANIME
        </div>
      )}

      {/* Channel Logo Area */}
      <div className="w-full aspect-video bg-white flex items-center justify-center overflow-hidden p-4 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={channel.logo || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/TV-icon-2.svg/512px-TV-icon-2.svg.png"}
          alt={channel.name}
          className="max-w-full max-h-[80%] object-contain group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/TV-icon-2.svg/512px-TV-icon-2.svg.png";
          }}
        />
      </div>

      {/* Metadata Footer */}
      <div className="w-full p-3 bg-surface border-t border-border flex flex-col gap-1 items-start">
        <h3 className="text-sm font-bold text-left group-hover:text-primary transition-colors duration-150 line-clamp-1 w-full">
          {channel.name}
        </h3>
        <p className="text-xs text-text-muted line-clamp-1 text-left w-full">
          {channel.categories?.[0] || 'General'} • India
        </p>

        <div className="w-full mt-3 bg-surface-hover group-hover:bg-primary border border-border group-hover:border-primary text-text-main group-hover:text-white py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center justify-center gap-1">
          <Play className="w-3 h-3" /> Watch Now
        </div>
      </div>
    </button>
  );
}
