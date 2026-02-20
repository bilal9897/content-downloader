# Deployment Guide

To take your Media Downloader project live, follow these steps. 

## 1. Hosting Options

### Vercel (Recommended)
1.  **Connect GitHub**: Push your code to a GitHub repository and connect it to Vercel.
2.  **Environment Variables**: No special environment variables are required for basic functionality unless you want to add custom API keys.
3.  **Automatic Build**: Vercel will detect the Next.js project and build it automatically.
4.  **Self-Hosting Binary**: The `yt-dlp` binary is managed via `yt-dlp-exec`. I've updated the code to detect the Linux environment on Vercel and use the correct binary automatically.

### Railway / Render
1.  **Docker Support**: You can use the existing `Dockerfile` if you prefer containerized deployment.
2.  **Binary Path**: Ensure that the `yt-dlp` binary is accessible in the container.

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
