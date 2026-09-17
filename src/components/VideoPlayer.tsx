"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface VideoPlayerProps {
  url: string | null;
  name: string | null;
}

export default function VideoPlayer({ url, name }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setError(null);
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxLoadingDelay: 4,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 1,
      });

      const proxiedUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      
      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Autoplay blocked", e));
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("This stream is currently offline or blocking access (CORS). Please try another channel.");
              hls?.destroy();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setError("An error occurred while trying to play this stream.");
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const proxiedUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      video.src = proxiedUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Autoplay blocked", e));
      });
      video.addEventListener("error", () => {
        setError("This stream is currently offline or blocking access (CORS). Please try another channel.");
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  if (!url) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-2xl border border-white/10 shadow-2xl">
        <p className="text-on-surface-variant text-lg">Select a channel below to start watching</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-highest p-6 text-center z-10">
            <AlertCircle className="w-12 h-12 text-error mb-4" />
            <p className="text-error font-medium mb-2">{error}</p>
            <p className="text-sm text-on-surface-variant">Many free IPTV streams go offline frequently.</p>
            <button 
              onClick={() => { setError(null); videoRef.current?.load(); }}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-sm transition-colors border border-white/10"
            >
              <RefreshCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : null}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          playsInline
        />
      </div>

      <div className="flex items-center gap-3 bg-primary-container/10 border border-primary-container/30 p-4 rounded-xl">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <h2 className="text-xl font-bold text-primary-container">
          Now Playing: <span className="text-white ml-2">{name}</span>
        </h2>
      </div>
    </div>
  );
}
