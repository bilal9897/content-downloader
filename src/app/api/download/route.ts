import { NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';
import ytdlp from 'yt-dlp-exec';
import path from 'path';

// @ts-ignore
const { instagramGetUrl } = require('instagram-url-direct');

// Helper function to get download URL using yt-dlp
async function getDownloadUrlWithYtDlp(url: string, format: string) {
    // Platform-agnostic binary path resolution
    const isWindows = process.platform === 'win32';
    const binaryBase = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin');
    const binaryPath = isWindows ? path.join(binaryBase, 'yt-dlp.exe') : path.join(binaryBase, 'yt-dlp');

    // @ts-ignore
    const ytdlpCustom = require('yt-dlp-exec').create(binaryPath);

    try {
        // Get video info first to get available formats
        const info = await ytdlpCustom(url, {
            dumpSingleJson: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
        });

        const title = (info.title || 'video').replace(/[^a-z0-9]/gi, '_').substring(0, 50);

        // Get the best format based on requested format
        // We force 'best' instead of 'bestvideo+bestaudio' because the proxy can only handle a single URL
        let formatString = 'best';
        if (format === 'audio') {
            formatString = 'bestaudio/best';
        }

        // Get direct URL without downloading
        const result = await ytdlpCustom(url, {
            getUrl: true,
            format: formatString,
            noCheckCertificate: true,
        });

        // yt-dlp returns the URL in stdout (if it's a string)
        const downloadUrl = (typeof result === 'string' ? result : '').trim();

        if (!downloadUrl) {
            throw new Error('Could not get download URL');
        }

        // Determine extension
        let ext = 'mp4';
        if (format === 'audio') {
            ext = 'm4a';
        } else if (info.ext) {
            ext = info.ext;
        }

        return {
            url: downloadUrl,
            filename: title,
            ext: ext
        };
    } catch (error: any) {
        console.error('yt-dlp download error:', error);
        throw new Error(`Failed to get download URL: ${error.message}`);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, format } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\//);
        const isYouTube = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//);

        // Check for other supported sites using yt-dlp
        const isDiskwala = url.includes('diskwala.com');
        const isTeraBox = url.match(/\b(terabox(app)?|nephobox|mirrobox|momix|4shared)\.com\b/i);
        const isRecom = url.includes('recom') || url.includes('re-link') || url.includes('relink');

        let downloadUrl = '';
        let ext = 'mp4';
        let filename = 'download';

        // Use yt-dlp for diskwala, terabox, recom, and any other unsupported sites
        if (isDiskwala || isTeraBox || isRecom || (!isYouTube && !isInstagram)) {
            const result = await getDownloadUrlWithYtDlp(url, format);
            downloadUrl = result.url;
            filename = result.filename;
            ext = result.ext;
        }

        if (isYouTube) {
            // Initialize Innertube (creates a session)
            const yt = await Innertube.create({
                cache: new UniversalCache(false),
                generate_session_locally: true
            });

            // Get video ID
            let videoId = '';
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('shorts/')) {
                videoId = url.split('shorts/')[1]?.split('?')[0];
            }

            if (!videoId) throw new Error("Invalid YouTube URL");

            // Use yt-dlp for YouTube instead of youtubei.js because it's more reliable at deciphering signatures
            const result = await getDownloadUrlWithYtDlp(url, format);
            downloadUrl = result.url;
            filename = result.filename;
            ext = result.ext;
        }
        else if (isInstagram) {
            const result = await instagramGetUrl(url);
            if (result.url_list && result.url_list.length > 0) {
                downloadUrl = result.url_list[0];
                filename = 'instagram_post';
            }
        }

        if (!downloadUrl) {
            return NextResponse.json(
                { error: 'Could not resolve a direct download URL. It might be restricted.' },
                { status: 404 }
            );
        }

        // --- STREAMING PROXY LOGIC ---
        const videoResponse = await fetch(downloadUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.youtube.com/',
            }
        });

        if (!videoResponse.ok) {
            console.error('Failed to fetch from media host:', videoResponse.status, videoResponse.statusText);

            if (videoResponse.status === 403) {
                return NextResponse.json(
                    { error: 'Download access denied by the media host (403). They might be blocking server-side requests. Try again or use a different link.' },
                    { status: 403 }
                );
            }

            return NextResponse.json(
                { error: `Media host error (${videoResponse.status}): ${videoResponse.statusText}. The direct link might have expired.` },
                { status: videoResponse.status }
            );
        }

        // Forward headers
        const headers = new Headers();
        const contentType = videoResponse.headers.get('Content-Type');
        const contentLength = videoResponse.headers.get('Content-Length');

        if (contentType) headers.set('Content-Type', contentType);
        if (contentLength) headers.set('Content-Length', contentLength);

        // --- DYNAMIC EXTENSION DETECTION ---
        let finalExt = ext;
        if (contentType) {
            if (contentType.includes('image/jpeg')) finalExt = 'jpg';
            else if (contentType.includes('image/png')) finalExt = 'png';
            else if (contentType.includes('image/gif')) finalExt = 'gif';
            else if (contentType.includes('image/webp')) finalExt = 'webp';
            else if (contentType.includes('video/mp4')) finalExt = 'mp4';
            else if (contentType.includes('video/webm')) finalExt = 'webm';
            else if (contentType.includes('audio/')) {
                // If it's any audio type, and the requested format was audio, 
                // we can safely call it mp3 for the user's convenience in many cases,
                // or keep m4a if it's already set to that. 
                // But specifically for "still not downloading mp3", let's be more direct.
                finalExt = (format === 'audio') ? 'mp3' : 'm4a';
            }
            else if (contentType.includes('application/x-subrip') || contentType.includes('text/plain')) {
                if (ext !== 'srt') finalExt = 'txt';
            }
        }

        // Set filename for browser download
        headers.set('Content-Disposition', `attachment; filename="${filename}.${finalExt}"`);
        // Allow client to see Content-Length for progress tracking
        headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Disposition');

        return new Response(videoResponse.body, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error('Download API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Download failed' },
            { status: 500 }
        );
    }
}
