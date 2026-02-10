import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { VideoFormat } from '@/lib/types';

const execAsync = promisify(exec);

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

        // Call yt-dlp to get JSON info
        // Using --dump-single-json to get flat JSON for playlists too (or handle playlists separate)
        // --flat-playlist to not download video info for every video in playlist if it is a playlist
        const command = `python -m yt_dlp --dump-single-json --no-warnings --no-call-home "${url}"`;

        // In production, you might need to set the path to yt-dlp binary if not in PATH
        // locally we installed it via pip so it should be in PATH or we use 'python -m yt_dlp'

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            console.warn('yt-dlp stderr:', stderr);
        }

        const videoData = JSON.parse(stdout);

        // Initial simple mapping
        const info = {
            id: videoData.id,
            title: videoData.title,
            thumbnail: videoData.thumbnail,
            duration: videoData.duration,
            uploader: videoData.uploader,
            view_count: videoData.view_count,
            description: videoData.description,
            tags: videoData.tags,
            formats: videoData.formats?.map((f: VideoFormat) => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution,
                filesize: f.filesize,
                vcodec: f.vcodec,
                acodec: f.acodec,
                url: f.url
            })) || [],
            _type: videoData._type || 'video'
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
