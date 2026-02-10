import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
// @ts-ignore
import instagramGetUrl from 'instagram-url-direct';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const isYouTube = ytdl.validateURL(url);
        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\//);

        if (isYouTube) {
            const info = await ytdl.getInfo(url);

            // Extract formats
            const formats = info.formats.map((f: any) => ({
                format_id: f.itag?.toString(),
                ext: f.container,
                resolution: f.qualityLabel || 'audio only',
                filesize: f.contentLength ? parseInt(f.contentLength) : 0,
                vcodec: f.videoCodec,
                acodec: f.audioCodec,
                url: f.url,
                hasAudio: f.hasAudio,
                hasVideo: f.hasVideo
            }));

            return NextResponse.json({
                id: info.videoDetails.videoId,
                title: info.videoDetails.title,
                thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
                duration: parseInt(info.videoDetails.lengthSeconds),
                uploader: info.videoDetails.author.name,
                view_count: parseInt(info.videoDetails.viewCount),
                description: info.videoDetails.description,
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
                title: 'Instagram Post', // Instagram API doesn't always give title easily
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
            { error: 'Failed to fetch video info', details: error.message },
            { status: 500 }
        );
    }
}
