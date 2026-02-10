import { NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';

// @ts-ignore
const { instagramGetUrl } = require('instagram-url-direct');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, format } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\//);
        const isYouTube = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//);

        let downloadUrl = '';
        let ext = 'mp4';
        let filename = 'download';

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

            const info = await yt.getInfo(videoId);
            filename = (info.basic_info.title || 'video').replace(/[^a-z0-9]/gi, '_').substring(0, 50);

            const streamingData = info.streaming_data;
            if (!streamingData) throw new Error("No streaming data found");

            const formats = [
                ...(streamingData.formats || []),
                ...(streamingData.adaptive_formats || [])
            ];

            if (format === 'audio') {
                // Find best audio
                // Filter for audio-only or formats with audio
                const audioFormats = formats.filter((f: any) => f.has_audio);
                // Sort by bitrate (approximate quality)
                audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

                if (audioFormats.length > 0) {
                    downloadUrl = audioFormats[0].url;
                    // Usually we get m4a or webm. 
                    const mime = audioFormats[0].mime_type || '';
                    if (mime.includes('webm')) ext = 'webm';
                    else ext = 'm4a';
                    // Frontend might treat it as mp3 extension for saving, but browser plays it fine.
                }
            } else {
                // Video: Try to find a muxed format (audio+video) first (usually 720p or 360p)
                // Innertube 'formats' array usually contains these legacy muxed formats.
                // 'adaptive_formats' are separate streams.

                const muxedFormats = (streamingData.formats || []).filter((f: any) => f.has_audio && f.has_video);

                if (muxedFormats.length > 0) {
                    // Pick the highest quality one (itag 22 is 720p often)
                    // Sort by quality label if possible? or just pick first (usually best)
                    downloadUrl = muxedFormats[0].url;
                    ext = 'mp4';
                } else {
                    // If no muxed format found, default to highest quality video stream (might lack audio!)
                    // In a real app we'd need to merge on server, but serverless can't easily do that.
                    // Improving fallback: Just try to get any video url.
                    const videoFormats = formats.filter((f: any) => f.has_video);
                    if (videoFormats.length > 0) {
                        downloadUrl = videoFormats[0].url;
                        ext = 'mp4';
                    }
                }
            }
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

        return NextResponse.json({
            success: true,
            url: downloadUrl,
            title: filename,
            ext: ext
        });

    } catch (error: any) {
        console.error('Download API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Download failed' },
            { status: 500 }
        );
    }
}
