# Deployment Guide

To take your Media Downloader project live, follow these steps. 

## 1. Hosting Options & Trade-offs

### ⚠️ IMPORTANT: Vercel vs. Railway/Render

| Feature | Vercel (Serverless) | Railway / Render (Docker/VPS) |
| :--- | :--- | :--- |
| **YouTube** | ✅ Supported (via Node-native fallback) | ✅ Fully Supported (via yt-dlp) |
| **Instagram** | ❌ Limited (Ip blocking + no Python) | ✅ Fully Supported |
| **TeraBox/Others** | ❌ Not Supported (no Python) | ✅ Fully Supported |
| **Video Stabilization** | ⚠️ Moderate | ✅ High |

### Vercel (Best for quick YouTube-only)
1. **Connect GitHub**: Push your code to a GitHub repository and connect it to Vercel.
2. **Fallback Logic**: I've added a fallback to `youtubei.js` (Innertube) which is Node-native. This allows YouTube downloads to work even though Vercel has no Python.
3. **Limitations**: Instagram and TeraBox extraction will likely fail on Vercel because they require `yt-dlp` (Python).

### Railway / Render (RECOMMENDED for full features)
1. **Docker Support**: These platforms support the existing `Dockerfile`.
2. **Environment**: They provide a full Linux environment where Python 3 and FFmpeg can be installed.
3. **Stability**: This is the only way to get full support for Instagram, TeraBox, and high-quality YouTube processing.

## 2. AdSense Setup

1.  **AdSense Account**: Ensure you have an approved Google AdSense account.
2.  **Replace IDs**: Open `src/components/ui/AdSlot.tsx` and replace the placeholder `data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"` with your actual AdSense Publisher ID.
3.  **Manage Units**: I've placed two ad units:
    - `TOP-BANNER`: Appears above the link input.
    - `BOTTOM-BANNER`: Appears at the bottom of the page.
4.  **Auto Ads**: If you prefer Google's "Auto Ads", you can add the AdSense script tag to `src/app/layout.tsx`.

## 3. Important Considerations

- **Streaming Proxy**: The project uses a streaming proxy to bypass CORS and 403 errors. Ensure your hosting provider doesn't have strict timeout limits for long streaming requests (most support this).
- **Disk Usage**: `yt-dlp` might use temporary space. Serverless environments like Vercel have limited `/tmp` space (usually 512MB), which should be enough for most video downloads.
