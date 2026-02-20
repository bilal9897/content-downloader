import { NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';
import ytdlp from 'yt-dlp-exec';
import path from 'path';

// @ts-ignore
const { instagramGetUrl } = require('instagram-url-direct');
import { execSync } from 'child_process';

// Helper to check if python is available
function hasPython() {
    try {
        // use 'where' on windows to find python
        if (process.platform === 'win32') {
            try { execSync('where python', { stdio: 'ignore' }); return true; } catch (e) { }
            try { execSync('where python3', { stdio: 'ignore' }); return true; } catch (e) { }
        }
        try { execSync('python3 --version', { stdio: 'ignore' }); return true; } catch (e) { }
        try { execSync('python --version', { stdio: 'ignore' }); return true; } catch (e) { }
        return false;
    } catch (e) {
        return false;
    }
}

// Helper function to use yt-dlp for unsupported sites
async function getVideoInfoWithYtDlp(url: string) {
    const isWindows = process.platform === 'win32';
    const binaryBase = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin');
    const binaryPath = isWindows ? path.join(binaryBase, 'yt-dlp.exe') : path.join(binaryBase, 'yt-dlp');

    // @ts-ignore
    const ytdlpCustom = require('yt-dlp-exec').create(binaryPath);

    try {
        const isInstagram = url.includes('instagram.com');
        const args: any = {
            dumpSingleJson: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
        };

        // Add convincing headers for Instagram
        if (isInstagram) {
            args.addHeader = [
                'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer:https://www.instagram.com/',
                'Accept-Language:en-US,en;q=0.9'
            ];
        }

        const result = await ytdlpCustom(url, args);

        // Transform yt-dlp output to our format
        const formats = (result.formats || []).map((f: any) => ({
            format_id: f.format_id,
            ext: f.ext,
            resolution: f.resolution || f.height + 'p' || 'audio only',
            filesize: f.filesize || f.filesize_approx || 0,
            vcodec: f.vcodec || 'none',
            acodec: f.acodec || 'none',
            url: f.url,
            hasAudio: !!f.acodec && f.acodec !== 'none',
            hasVideo: !!f.vcodec && f.vcodec !== 'none'
        }));

        // Sort formats by quality
        formats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

        return {
            id: result.id || 'unknown',
            title: result.title || 'Unknown Title',
            thumbnail: result.thumbnail || '',
            duration: result.duration || 0,
            uploader: result.uploader || result.channel || 'Unknown',
            view_count: result.view_count || 0,
            description: result.description || '',
            tags: result.tags || [],
            formats: formats,
            _type: 'video',
            platform: 'yt-dlp',
            webpage_url: result.webpage_url
        };
    } catch (error: any) {
        console.error('yt-dlp error:', error);
        throw new Error(`Failed to fetch video info: ${error.message}`);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\//);
        const isYouTube = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//);
        const isPythonAvailable = hasPython();

        // Check for other supported sites using yt-dlp
        const isDiskwala = url.includes('diskwala.com');
        const isTeraBox = url.match(/\b(terabox(app)?|nephobox|mirrobox|momix|4shared)\.com\b/i);
        const isRecom = url.includes('recom') || url.includes('re-link') || url.includes('relink');

        // Use yt-dlp for diskwala, terabox, recom, and any other unsupported sites
        if (isDiskwala || isTeraBox || isRecom || (!isYouTube && !isInstagram)) {
            if (!isPythonAvailable) {
                return NextResponse.json({
                    error: 'This platform (Vercel) does not support TeraBox/Other sites because it lacks Python. Please use Railway or Render for full support.'
                }, { status: 400 });
            }
            // Use yt-dlp as a universal fallback
            const info = await getVideoInfoWithYtDlp(url);
            return NextResponse.json(info);
        }

        if (isYouTube) {
            // If on Vercel (no python), always use Innertube for YouTube
            // If python is available, we could still use it, but Innertube is faster for info
            // Initialize Innertube (creates a session)
            const yt = await Innertube.create({
                cache: new UniversalCache(false),
                generate_session_locally: true // Key for serverless environments
            });

            // Get video ID from URL
            // Simple regex for ID extraction
            let videoId = '';
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('shorts/')) {
                videoId = url.split('shorts/')[1]?.split('?')[0];
            }

            if (!videoId) {
                return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
            }

            const info = await yt.getInfo(videoId);

            // Extract formats
            // Innertube returns a complex object, we need to adapt it
            const streamingData = info.streaming_data;
            let formats: any[] = [];

            if (streamingData) {
                const combinedFormats = [
                    ...(streamingData.formats || []),
                    ...(streamingData.adaptive_formats || [])
                ];

                formats = combinedFormats.map((f: any) => ({
                    format_id: f.itag?.toString(),
                    ext: f.mime_type?.split(';')[0]?.split('/')[1] || 'mp4',
                    resolution: f.quality_label || 'audio only',
                    filesize: f.content_length ? parseInt(f.content_length) : 0,
                    vcodec: f.mime_type?.includes('video') ? 'h264' : 'none',
                    acodec: f.mime_type?.includes('audio') ? 'aac' : 'none',
                    url: f.url,
                    hasAudio: f.has_audio,
                    hasVideo: f.has_video
                }));
            }

            const basicInfo = info.basic_info;

            return NextResponse.json({
                id: basicInfo.id,
                title: basicInfo.title,
                thumbnail: basicInfo.thumbnail ? basicInfo.thumbnail[0].url : '',
                duration: basicInfo.duration || 0,
                uploader: basicInfo.author || 'Unknown',
                view_count: basicInfo.view_count || 0,
                description: basicInfo.short_description || '',
                formats: formats,
                _type: 'video',
                platform: 'youtube'
            });
        }

        if (isInstagram) {
            try {
                // Try yt-dlp first for Instagram as it provides better metadata, but ONLY if python is available
                if (!isPythonAvailable) {
                    throw new Error('Python not available');
                }
                const info = await getVideoInfoWithYtDlp(url);
                return NextResponse.json({
                    ...info,
                    platform: 'instagram'
                });
            } catch (error) {
                console.warn('yt-dlp failed or unavailable for Instagram info, falling back to instagram-url-direct:', error);

                try {
                    const result = await instagramGetUrl(url);

                    // Map Instagram result to common format
                    const formats = [];

                    // Handle video/image URLs from library
                    if (result.url_list && result.url_list.length > 0) {
                        const mediaUrl = result.url_list[0];
                        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.mov');

                        formats.push({
                            format_id: 'best',
                            ext: isVideo ? 'mp4' : 'jpg',
                            resolution: 'best',
                            url: mediaUrl,
                            hasAudio: isVideo,
                            hasVideo: isVideo
                        });
                    }

                    return NextResponse.json({
                        id: 'instagram-' + Date.now(),
                        title: 'Instagram Post',
                        thumbnail: result.media_details?.thumbnail || '',
                        duration: 0,
                        uploader: 'Instagram User',
                        formats: formats,
                        _type: formats.length > 0 && formats[0].hasVideo ? 'video' : 'image',
                        platform: 'instagram'
                    });
                } catch (libError) {
                    console.warn('All Instagram libraries failed, attempting direct metadata fallback:', libError);

                    try {
                        // Final fallback: try to scrape metadata directly
                        const response = await fetch(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            }
                        });
                        const html = await response.text();

                        // Simple regex to extract thumbnail and title
                        const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:image"/);
                        const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:title"/);

                        if (ogImage || ogTitle) {
                            return NextResponse.json({
                                id: 'instagram-meta-' + Date.now(),
                                title: (ogTitle && ogTitle[1]) ? ogTitle[1] : 'Instagram Post',
                                thumbnail: (ogImage && ogImage[1]) ? ogImage[1] : '',
                                duration: 0,
                                uploader: 'Instagram User',
                                formats: [],
                                _type: 'video',
                                platform: 'instagram'
                            });
                        }
                    } catch (metaError) {
                        console.error('Metadata fallback also failed:', metaError);
                    }

                    throw libError; // If all failed, throw last library error
                }
            }
        }

        return NextResponse.json({ error: 'Unsupported URL. Please use YouTube or Instagram.' }, { status: 400 });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch video info' },
            { status: 500 }
        );
    }
}
