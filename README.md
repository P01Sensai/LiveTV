# LiveTV 📺

A sleek, modern web application for streaming live IPTV broadcasts directly in your browser with zero CORS blocks and high-performance ambient lighting.

---

## ✨ Features

- **📺 Smooth HLS Streaming:** Custom video player powered by `hls.js` with live-edge syncing, theater mode, and instant catch-up.
- **🛡️ Built-in CORS Edge Proxy:** Dynamically rewrites `.m3u8` playlists and video chunks on the fly using Next.js Edge APIs to bypass browser CORS blocking.
- **🎨 Dynamic Ambilight:** Real-time 4-corner edge color sync that casts a soft, responsive backlight around the video player with $< 1\%$ GPU overhead.
- **🎴 3D Interactive Cards:** Hardware-accelerated 3D perspective tilt with specular glass glare across the channel guide.
- **🎌 Dedicated Anime Section:** Curated 24/7 global animation channels with custom cel-shaded comic styling.
- **🔍 Instant Live Search:** Fast autocomplete search dropdown and multi-category filtering (News, Sports, Movies, Anime, Music, etc.).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Video Engine:** [HLS.js](https://github.com/video-dev/hls.js/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Guide Data:** [iptv-org](https://github.com/iptv-org/iptv)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/LiveTV.git
cd LiveTV
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

MIT License. Streams and logos are sourced from publicly available channels via `iptv-org`.
