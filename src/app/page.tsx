"use client";

import { useEffect, useState } from "react";
import { fetchIndianChannels } from "@/lib/api";
import { MergedChannel } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import { Tv, Search, X } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Channels" },
  { id: "news", label: "News" },
  { id: "movies", label: "Movies" },
  { id: "sports", label: "Sports" },
  { id: "religious", label: "Religious" },
  { id: "music", label: "Music" },
  { id: "kids", label: "Kids" },
];

export default function Home() {
  const [channels, setChannels] = useState<MergedChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<MergedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  
  const [activeStream, setActiveStream] = useState<{url: string, name: string} | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchIndianChannels();
        setChannels(data);
        setFilteredChannels(data.slice(0, 60));
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = channels;

    if (category !== "all") {
      result = result.filter(c => {
        const catStr = (c.categories || []).map(x => x.toLowerCase()).join(" ");
        if (category === "news" && catStr.includes("news")) return true;
        if (category === "movies" && catStr.includes("movies")) return true;
        if (category === "sports" && catStr.includes("sports")) return true;
        if (category === "religious" && catStr.includes("religious")) return true;
        if (category === "music" && catStr.includes("music")) return true;
        if (category === "kids" && (catStr.includes("kids") || catStr.includes("children"))) return true;
        return false;
      });
    }

    if (search.trim()) {
      result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }

    setFilteredChannels(result.slice(0, 60));
  }, [search, category, channels]);

  const handlePlay = (channel: MergedChannel) => {
    setActiveStream({ url: channel.streamUrl, name: channel.name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-surface-container shadow-md sticky top-0 z-50 p-4 border-b border-white/10">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
              <Tv className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-primary">Live TV</h1>
          </div>
          
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 text-on-surface rounded-full py-3 pl-12 pr-12 focus:ring-2 focus:ring-primary-container focus:outline-none text-lg transition-all" 
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6">
        <VideoPlayer url={activeStream?.url || null} name={activeStream?.name || null} />

        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full font-semibold flex-shrink-0 transition-colors ${
                category === cat.id 
                  ? "bg-primary-container text-on-primary" 
                  : "bg-surface-container-high border border-white/10 hover:border-primary/50 text-on-surface"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Channels Grid */}
        {loading ? (
          <p className="text-center py-10 text-xl text-on-surface-variant">Loading Channels...</p>
        ) : error ? (
          <p className="text-center py-10 text-error">Failed to load channels. Please try again later.</p>
        ) : filteredChannels.length === 0 ? (
          <p className="text-center py-10 text-on-surface-variant">No channels found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => handlePlay(channel)}
                className="flex flex-col items-center justify-between gap-3 p-4 bg-surface-container-high border border-white/5 rounded-xl hover:bg-surface-container-highest hover:border-primary-container/50 transition-all group focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <div className="w-full aspect-video bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={channel.logo || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/TV-icon-2.svg/512px-TV-icon-2.svg.png"} 
                    alt={channel.name} 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/TV-icon-2.svg/512px-TV-icon-2.svg.png";
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-center group-hover:text-primary transition-colors line-clamp-2">
                  {channel.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
