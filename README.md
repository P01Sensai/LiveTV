<div align="center">
  <div style="background-color: #FF5A26; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px;">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
  </div>
  
  # LiveTV 📺
  
  **I just wanted to watch live TV in my browser without dealing with sketchy sites or getting blocked by CORS. So I built this.**
</div>

<br />

Hey there! 👋 Welcome to **LiveTV**. 

I built this project because I was tired of finding `.m3u8` IPTV playlists online only to realize they won't play in a standard web browser because of strict CORS errors. 

To fix that, I wired up a sneaky little proxy using Next.js Edge APIs that strips away those annoying CORS headers and lets the streams play flawlessly. Then, because I'm a bit obsessed with UI, I dressed it all up in a premium, dark-mode, glassmorphic design that feels like a real streaming app (think Netflix or YouTube).

---

## ✨ Why this is cool (Interactive!)

<details>
<summary><b>🎬 It actually feels like a real video player</b> (Click me!)</summary>
<br/>
I didn't just drop in a default HTML5 video tag. I built a custom player powered by <code>hls.js</code>. 
It has a YouTube-style <b>Theater Mode</b>, and I even added logic to detect if you've paused and fallen behind the live broadcast. If you do, a little "LIVE" button pops up so you can instantly catch up to real-time.
</details>

<details>
<summary><b>🔥 The "Anti-CORS" Proxy</b></summary>
<br/>
Browsers hate IPTV streams. If you try to play a stream from another domain, your browser usually blocks it. 
LiveTV routes the video chunks through a Vercel Edge function that essentially tells the browser "hey, it's cool, I'm allowed to play this." It's fast, serverless, and just works. (I also added some SSRF protection so people can't abuse the proxy).
</details>

<details>
<summary><b>📱 It looks genuinely premium</b></summary>
<br/>
I hate clunky UIs. So I added:
<ul>
  <li>A gorgeous <b>Welcome Banner</b> that greets you with trending channels instead of an ugly blank black box.</li>
  <li>A live search bar with a fast dropdown that instantly filters channels as you type.</li>
  <li>A layout that mathematically snaps into place on desktop using CSS Grid, but beautifully collapses into a mobile-friendly view when you're on your phone.</li>
</ul>
</details>

---

## 🚀 How to run it yourself

It's super easy to get this running on your own machine.

```bash
# 1. Grab the code
git clone https://github.com/your-username/LiveTV.git
cd LiveTV

# 2. Install the boring stuff
npm install

# 3. Fire it up!
npm run dev
```

Then just open [http://localhost:3000](http://localhost:3000) and start watching TV!

---

## 🛠 What's under the hood?

- **Next.js (App Router)** - The glue holding everything together, plus the Edge APIs.
- **Tailwind CSS** - For making things look pretty without writing endless CSS files.
- **HLS.js** - The magic that makes Apple's HTTP Live Streaming work natively in standard browsers.
- **Lucide React** - For those crisp, modern icons.

---

## 🎯 What's next?

I'm pretty happy with it so far, but I eventually want to add:
- [ ] User accounts (so you can save your favorites to a "Watchlist").
- [ ] A way to upload your own custom `.m3u8` playlists instead of just relying on the public APIs.

If you like what you see, feel free to use it, fork it, or star it! Enjoy watching! 🍿
