# 🏙️ SIPHON | Media Harvesting Laboratory
### Built for the Future by [Bilal Salmani](https://github.com/bilal9897)

![SIPHON Banner](https://raw.githubusercontent.com/bilal9897/Social-Media-Content-Downloader/master/public/logo.svg)

**SIPHON** is a premium, AI-driven media extraction utility designed for high-performance harvesting of content across the digital arsenal. From YouTube 4K extractions to Instagram Reels and Stories, SIPHON provides a glassmorphic, ultra-fast interface for the modern web.

---

## 🛡️ Technical Arsenal

- **🚀 Performance Engine**: Native-speed streaming using `yt-dlp` and `ffmpeg` for multi-threaded harvesting.
- **📸 Social Integration**: Full support for **Instagram Reels**, **Stories**, and **IGTV**.
- **🎧 High-Fidelity Audio**: Extract crystal clear MP3s at **320kbps** or standard **128kbps**.
- **📺 Multiformat Video**: Precision selection for **1080p**, **720p**, and **360p** resolutions.
- **🧠 Media Insights**: AI-ready metadata extraction. View **Captions** and **Hashtags** instantly.
- **🎨 Glassmorphic UI**: A dynamic, premium interface that adapts its accent colors to your media thumbnails.
- **📱 Standalone PWA**: Install SIPHON as a native application on any OS (iOS, Android, Windows, macOS).

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js 18+**
- **Python 3** (Required for `yt-dlp`)
- **FFmpeg** (Required for high-quality merging and MP3 transcoding)

### Quick Start
1. **Clone the laboratory**:
   ```bash
   git clone https://github.com/bilal9897/Social-Media-Content-Downloader.git
   cd Social-Media-Content-Downloader
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Deploy the local engine**:
   ```bash
   npm run dev
   ```

---

## 🚀 Deployment (Production)

Because SIPHON requires system-level binaries (`python` and `ffmpeg`), standard serverless platforms like Netlify/Vercel are not recommended for the full feature set.

### Recommended: Render / Railway / VPS
We provide a **Dockerfile** for containerized deployment.

1. Connect your repository to **Render.com**.
2. Select **Web Service**.
3. Render will detect the `Dockerfile` and automatically:
   - Install Node.js & dependencies.
   - Install Python 3 & `yt-dlp`.
   - Install FFmpeg.
   - Build and serve the SIPHON Laboratory.

---

## 📜 License & Acknowledgments

- **License**: MIT License - Created by Bilal Salmani (2026).
- **Engine**: Powered by the legendary `yt-dlp` and `ffmpeg` libraries.

---

### 🛡️ Secure. Fast. Premium. Welcome to **SIPHON**.
