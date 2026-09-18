"use client";

import { useEffect, useState } from "react";
import { fetchIndianChannels } from "@/lib/api";
import { MergedChannel } from "@/lib/types";
import VideoPlayer from "@/components/VideoPlayer";
import { Tv, Search, X, Play, Hash, Menu } from "lucide-react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [activeStream, setActiveStream] = useState<{url: string, name: string, id: string} | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchIndianChannels();
        setChannels(data);
        setFilteredChannels(data.slice(0, 60));

        if (typeof window !== "undefined") {
          // Default to closed on mobile
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }

          const params = new URLSearchParams(window.location.search);
          const channelId = params.get("channel");
          if (channelId) {
            const initial = data.find(c => c.id === channelId);
            if (initial) {
              setActiveStream({ url: initial.streamUrl, name: initial.name, id: initial.id });
            }
          }
        }
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
      result = result.filter(c => (c.name || "").toLowerCase().includes(search.toLowerCase()));
    }

    setFilteredChannels(result.slice(0, 60));
  }, [search, category, channels]);

  const handlePlay = (channel: MergedChannel) => {
    setActiveStream({ url: channel.streamUrl, name: channel.name, id: channel.id });
    
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("channel", channel.id);
      window.history.pushState({}, "", url.toString());
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main pb-20">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border py-3 px-4 lg:px-6">
        <div className="w-full flex items-center justify-between gap-6">
          <div 
            className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setActiveStream(null);
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.delete("channel");
                window.history.pushState({}, "", url.toString());
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Tv className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold tracking-tight">Live<span className="text-primary">TV</span></h1>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-text-muted" />
            </div>
            <input 
              type="text" 
              placeholder="Search channels, aarti, cricket, shows..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-surface border border-border text-text-main rounded-full py-2.5 pl-11 pr-12 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm transition-all placeholder:text-text-muted relative z-50" 
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors z-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Live Search Dropdown */}
            {isSearchFocused && search.trim() && (
              <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-[100] max-h-[60vh] flex flex-col">
                <div className="overflow-y-auto p-2 flex flex-col gap-1 w-full">
                  {filteredChannels.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-sm font-semibold">No channels found for "{search}"</div>
                  ) : (
                    filteredChannels.slice(0, 8).map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => {
                          handlePlay(channel);
                          setSearch("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg transition-colors text-left group border border-transparent hover:border-border"
                      >
                         <div className="w-10 h-10 shrink-0 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden">
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
                         <div className="flex-1 min-w-0">
                           <div className="font-bold text-sm truncate text-text-main group-hover:text-primary transition-colors">{channel.name}</div>
                           <div className="text-xs text-text-muted truncate flex items-center gap-1">
                             <span className="w-1 h-1 rounded-full bg-live animate-pulse"></span>
                             {channel.categories?.[0] || 'General'}
                           </div>
                         </div>
                         <Play className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0 mr-2" />
                      </button>
                    ))
                  )}
                </div>
                {filteredChannels.length > 8 && (
                  <div className="bg-surface-hover p-2 text-center border-t border-border">
                    <span className="text-xs font-semibold text-text-muted">Press Enter to see all {filteredChannels.length} results below</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => {
                document.getElementById('all-channels-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border hover:border-primary/50 text-text-main hover:text-primary rounded-xl font-semibold transition-all text-sm flex items-center gap-2 shadow-sm"
            >
              <Tv className="w-4 h-4" />
              All Channels
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 lg:px-6 py-6 flex flex-col gap-10 mt-2">
        
        {/* HERO SECTION: Split Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Closed State Toggle Button (Hamburger) */}
          {!isSidebarOpen && (
            <div className="order-2 lg:order-1 flex shrink-0 pt-1 lg:self-start">
               <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 bg-surface border border-border hover:border-primary rounded-xl text-text-muted hover:text-primary transition-all shadow-sm flex items-center gap-2"
                title="Open Sidebar"
              >
                 <Menu className="w-5 h-5" />
                 <span className="lg:hidden font-semibold text-sm">View Broadcast Channels</span>
               </button>
            </div>
          )}

          {/* Left Sidebar: Channel List */}
          <div className={`order-3 lg:order-2 shrink-0 flex flex-col gap-4 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-full lg:w-[350px] opacity-100" : "w-0 lg:w-0 opacity-0 overflow-hidden h-0 lg:h-auto"
          }`}>
            <div className="flex items-center justify-between w-[350px] pt-1">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 -ml-2 bg-surface border border-border hover:border-primary rounded-xl transition-all text-text-muted hover:text-primary shadow-sm"
                  title="Close Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">
                  Broadcast Channels
                </h2>
              </div>
              <span className="text-xs font-semibold text-live bg-live/10 px-2 py-1 rounded-md">Live Feeds</span>
            </div>
            
            <div className="bg-surface border border-border rounded-2xl h-[500px] w-[350px] overflow-y-auto scrollbar-hide flex flex-col p-2 gap-1 relative">
              {loading && <div className="p-4 text-text-muted text-sm text-center mt-10">Loading guide...</div>}
              {error && <div className="p-4 text-live text-sm text-center mt-10">Error loading guide.</div>}
              
              {!loading && !error && filteredChannels.slice(0, 50).map(channel => {
                const isActive = activeStream?.id === channel.id;
                return (
                  <button
                    key={channel.id}
                    onClick={() => handlePlay(channel)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left w-full group ${
                      isActive 
                        ? 'bg-surface-hover border border-primary/50' 
                        : 'hover:bg-surface-hover border border-transparent'
                    }`}
                  >
                    <div className="w-12 h-12 shrink-0 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-text-muted">CH</span>
                        <span className="text-xs font-bold text-live flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-live"></span> LIVE
                        </span>
                      </div>
                      <h3 className={`font-semibold truncate text-sm ${isActive ? 'text-primary' : 'text-text-main group-hover:text-primary'}`}>
                        {channel.name}
                      </h3>
                    </div>
                    {isActive ? (
                      <div className="flex gap-[2px] items-end h-4 w-4 shrink-0">
                        <div className="w-[3px] bg-primary rounded-t-sm animate-[bounce_1s_infinite_0ms] h-full"></div>
                        <div className="w-[3px] bg-primary rounded-t-sm animate-[bounce_1s_infinite_200ms] h-2/3"></div>
                        <div className="w-[3px] bg-primary rounded-t-sm animate-[bounce_1s_infinite_400ms] h-3/4"></div>
                      </div>
                    ) : (
                      <Play className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </button>
                );
              })}
              
              <div className="sticky bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-surface via-surface to-transparent flex justify-center pb-4 pt-10 pointer-events-none">
                <span className="text-xs font-semibold text-text-muted">Scroll for more</span>
              </div>
            </div>
          </div>

          {/* Right Main Area: Video Player or Welcome Banner */}
          <div className="order-1 lg:order-3 flex-1 w-full flex flex-col">
            {activeStream ? (
              <VideoPlayer 
                url={activeStream.url} 
                name={activeStream.name} 
                onToggleTheater={() => setIsSidebarOpen(!isSidebarOpen)}
                isTheaterMode={!isSidebarOpen}
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-surface via-background to-surface rounded-2xl border border-border relative overflow-hidden flex flex-col items-center justify-center p-6 lg:p-8">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[100px] animate-pulse"></div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-live rounded-full blur-[100px] animate-[pulse_3s_infinite_1s]"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center w-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-surface-hover border border-border flex items-center justify-center mb-4 lg:mb-6 shadow-2xl">
                    <Tv className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-2 lg:mb-3">Welcome to Live<span className="text-primary">TV</span></h2>
                  <p className="text-text-muted mb-6 lg:mb-8 max-w-md text-sm lg:text-base">Experience premium live broadcasting. Select a channel from the sidebar or start watching a trending stream below.</p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4 w-full max-w-2xl">
                    {channels.filter(c => c.logo).slice(0, 3).map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => handlePlay(channel)}
                        className="flex items-center gap-3 bg-surface/80 backdrop-blur-md border border-border hover:border-primary/50 hover:bg-surface-hover rounded-xl p-2.5 lg:p-3 transition-all group/btn shadow-lg hover:-translate-y-1 hover:shadow-primary/20 w-[45%] sm:w-48"
                      >
                        <img src={channel.logo} alt={channel.name} className="w-8 h-8 lg:w-10 lg:h-10 object-contain bg-white rounded p-1 shrink-0" />
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-bold text-xs lg:text-sm truncate text-white group-hover/btn:text-primary transition-colors">{channel.name}</div>
                          <div className="text-[10px] lg:text-xs text-text-muted truncate flex items-center gap-1 mt-0.5">
                             <span className="w-1 h-1 rounded-full bg-live animate-pulse"></span>
                             LIVE
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Content Rows */}
        <div className="flex flex-col gap-8 mt-4">
          
          {/* Categories / Trending Row */}
          <div>
            <div className="flex items-center gap-3 mb-4 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold">Trending Categories</h2>
              <span className="text-sm text-text-muted hidden sm:inline">Explore curated streams</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl font-semibold flex-shrink-0 transition-all shadow-sm ${
                    category === cat.id 
                      ? "bg-primary text-white" 
                      : "bg-surface border border-border hover:border-text-muted text-text-main"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channels Grid (Now styled as premium cards) */}
          <div id="all-channels-grid" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6 border-l-4 border-primary pl-3">
              <h2 className="text-xl font-bold">All Channels</h2>
            </div>
            
            {loading ? (
              <p className="text-center py-10 text-text-muted">Loading Guide...</p>
            ) : filteredChannels.length === 0 ? (
              <p className="text-center py-10 text-text-muted">No channels found in this category.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredChannels.slice(0, 30).map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handlePlay(channel)}
                    className="flex flex-col items-center justify-between gap-0 p-0 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all group focus:outline-none overflow-hidden relative shadow-md hover:shadow-primary/10 hover:-translate-y-1"
                  >
                    <div className="absolute top-2 left-2 bg-live text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm z-10">
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                    </div>
                    
                    <div className="w-full aspect-video bg-white flex items-center justify-center overflow-hidden p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={channel.logo || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/TV-icon-2.svg/512px-TV-icon-2.svg.png"} 
                        alt={channel.name} 
                        className="max-w-full max-h-[80%] object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/TV-icon-2.svg/512px-TV-icon-2.svg.png";
                        }}
                      />
                    </div>
                    <div className="w-full p-3 bg-surface border-t border-border flex flex-col gap-1 items-start">
                      <h3 className="text-sm font-bold text-left group-hover:text-primary transition-colors line-clamp-1 w-full">
                        {channel.name}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-1 text-left w-full">
                        {channel.categories?.[0] || 'General'} • India
                      </p>
                      
                      <div className="w-full mt-3 bg-surface-hover hover:bg-primary border border-border hover:border-primary text-text-main hover:text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                        <Play className="w-3 h-3" /> Watch Now
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
