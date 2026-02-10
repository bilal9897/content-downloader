import { NextResponse } from 'next/server';
import ytdl from 'yt-dlp-exec';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL (basic check supporting YouTube and Instagram)
        const isYouTube = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\/(reels?|stories|p|tv)\/.+$/);

        if (!isYouTube && !isInstagram) {
            return NextResponse.json({ error: 'Invalid URL. Supported: YouTube, Instagram' }, { status: 400 });
        }

        // Call yt-dlp using yt-dlp-exec
        const videoData = await ytdl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        // Map the data
        const info = {
            id: videoData.id,
            title: videoData.title,
            thumbnail: videoData.thumbnail,
            duration: videoData.duration,
            uploader: videoData.uploader,
            view_count: videoData.view_count,
            description: videoData.description,
            tags: videoData.tags,
            formats: videoData.formats?.map((f: any) => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution,
                filesize: f.filesize,
                vcodec: f.vcodec,
                acodec: f.acodec,
                url: f.url
            })) || [],
            _type: (videoData as any)._type || 'video'
        };

        return NextResponse.json(info);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video info', details: errorMessage },
            { status: 500 }
        );
    }
}
