"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, RefreshCcw, Maximize, Play, Pause, Volume2, VolumeX, RectangleHorizontal } from "lucide-react";

interface VideoPlayerProps {
  url: string | null;
  name: string | null;
  onToggleTheater?: () => void;
  isTheaterMode?: boolean;
}

export default function VideoPlayer({ url, name, onToggleTheater, isTheaterMode }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAtLiveEdge, setIsAtLiveEdge] = useState(true);

  const goLive = () => {
    if (videoRef.current) {
      const seekable = videoRef.current.seekable;
      if (seekable.length > 0) {
        // Seek near the end of the buffer to jump back to live
        videoRef.current.currentTime = seekable.end(seekable.length - 1) - 1;
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const seekable = videoRef.current.seekable;
      if (seekable.length > 0) {
        const end = seekable.end(seekable.length - 1);
        // If they are more than 15 seconds behind the absolute live edge
        const isLive = (end - videoRef.current.currentTime) < 15;
        if (isLive !== isAtLiveEdge) {
          setIsAtLiveEdge(isLive);
        }
      }
    }
  };

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

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!url) {
    return (
      <div className="w-full aspect-video bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4 border border-border">
          <Play className="w-6 h-6 text-text-muted ml-1" />
        </div>
        <p className="text-text-muted text-lg font-medium">Select a channel to start watching</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-border group">
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-primary mb-4" />
            <p className="text-text-main font-medium mb-2">{error}</p>
            <p className="text-sm text-text-muted">Many free IPTV streams go offline frequently.</p>
            <button 
              onClick={() => { setError(null); videoRef.current?.load(); }}
              className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-surface border border-border hover:border-primary/50 hover:text-primary rounded-full text-sm font-semibold transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Custom Controls Overlay (Hover) */}
        {!error && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg drop-shadow-md">{name}</span>
                <button 
                  onClick={goLive}
                  className={`flex items-center gap-2 hover:opacity-80 transition-opacity w-fit mt-0.5 ${isAtLiveEdge ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                  title={isAtLiveEdge ? "Playing Live" : "You are behind. Click to catch up to Live edge."}
                >
                  <span className="relative flex h-2 w-2">
                    {isAtLiveEdge && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isAtLiveEdge ? 'bg-live' : 'bg-text-muted'}`}></span>
                  </span>
                  <span className={`text-xs font-bold tracking-widest uppercase ${isAtLiveEdge ? 'text-live' : 'text-text-muted hover:text-white transition-colors'}`}>
                    Live
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {onToggleTheater && (
                <button 
                  onClick={onToggleTheater} 
                  className={`text-white hover:text-primary transition-colors p-2 rounded-full backdrop-blur-md ${isTheaterMode ? 'bg-primary/20 text-primary' : 'bg-white/10'}`}
                  title="Theater Mode"
                >
                  <RectangleHorizontal className="w-5 h-5" />
                </button>
              )}
              <button onClick={toggleMute} className="text-white hover:text-primary transition-colors p-2 bg-white/10 rounded-full backdrop-blur-md">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button onClick={toggleFullScreen} className="text-white hover:text-primary transition-colors p-2 bg-white/10 rounded-full backdrop-blur-md">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Title & Metadata (Below Video) */}
      <div className="mt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-main">{name}</h2>
          <p className="text-text-muted mt-1">LiveTV Broadcast</p>
        </div>
      </div>
    </div>
  );
}
