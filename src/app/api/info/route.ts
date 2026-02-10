import { NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';

// @ts-ignore
const { instagramGetUrl } = require('instagram-url-direct');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\//);
        const isYouTube = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//);

        if (isYouTube) {
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
            const result = await instagramGetUrl(url);

            // Map Instagram result to common format
            const formats = [];

            // Handle video/image URLs from library
            if (result.url_list && result.url_list.length > 0) {
                formats.push({
                    format_id: 'best',
                    ext: 'mp4',
                    resolution: 'best',
                    url: result.url_list[0],
                    hasAudio: true,
                    hasVideo: true
                });
            }

            return NextResponse.json({
                id: 'instagram-' + Date.now(),
                title: 'Instagram Post',
                thumbnail: result.media_details?.thumbnail || '',
                duration: 0,
                uploader: 'Instagram User',
                formats: formats,
                _type: 'video',
                platform: 'instagram'
            });
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
