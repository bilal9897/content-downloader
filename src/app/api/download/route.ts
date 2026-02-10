import { NextResponse } from 'next/server';
import ytdl from 'yt-dlp-exec';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, format, quality } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const options: any = {
            noWarnings: true,
        };

        // Format selection
        if (format === 'audio') {
            options.extractAudio = true;
            options.audioFormat = 'mp3';
            options.audioQuality = quality === '320k' ? '0' : '5';
            options.format = 'bestaudio/best';
        } else if (format === 'video') {
            const height = quality ? quality.replace('p', '') : '720';
            options.format = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`;
            options.mergeOutputFormat = 'mp4';
        }

        // Get the download URL
        const videoData = await ytdl(url, {
            ...options,
            dumpSingleJson: true,
        });

        // Find the best format URL
        let downloadUrl = videoData.url;
        if (videoData.formats && videoData.formats.length > 0) {
            const bestFormat = videoData.formats[videoData.formats.length - 1];
            downloadUrl = bestFormat.url;
        }

        // Return redirect to the actual video URL
        return NextResponse.json({
            success: true,
            url: downloadUrl,
            title: videoData.title,
            ext: format === 'audio' ? 'mp3' : 'mp4'
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Download API Error:', error);
        return NextResponse.json(
            { error: 'Download failed', details: errorMessage },
            { status: 500 }
        );
    }
}
