import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
// @ts-ignore
import instagramGetUrl from 'instagram-url-direct';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, format } = body; // removed 'quality' as it's not strictly needed for this logic

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const isYouTube = ytdl.validateURL(url);
        const isInstagram = url.match(/^(https?:\/\/)?(www\.)?instagram\.com\//);

        let downloadUrl = '';
        let ext = 'mp4';
        let filename = 'download';

        if (isYouTube) {
            const info = await ytdl.getInfo(url);
            filename = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);

            if (format === 'audio') {
                const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
                if (audioFormat) {
                    downloadUrl = audioFormat.url;
                    // Usually webm or m4a, but we label as mp3 for user convenience (browser will likely play it)
                    // Real conversion requires ffmpeg which we don't have.
                    // We can just rely on the browser or player handling the container.
                    ext = audioFormat.container || 'mp3';
                }
            } else {
                // Video
                // Try to find a single file with both audio and video (muxed)
                const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
                if (videoFormat && videoFormat.hasAudio && videoFormat.hasVideo) {
                    downloadUrl = videoFormat.url;
                    ext = videoFormat.container;
                } else {
                    // If no muxed format, fallback to highest video (might lack audio)
                    // OR specifically look for one with audio
                    const formatsWithAudio = ytdl.filterFormats(info.formats, 'videoqaudio');
                    if (formatsWithAudio.length > 0) {
                        downloadUrl = formatsWithAudio[0].url;
                        ext = formatsWithAudio[0].container;
                    } else {
                        // Fallback to whatever 'highest' returned
                        if (videoFormat) {
                            downloadUrl = videoFormat.url;
                            ext = videoFormat.container;
                        }
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
                { error: 'Could not resolve a download URL for this video. It might be restricted or require sign-in.' },
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
            { error: 'Download failed', details: error.message },
            { status: 500 }
        );
    }
}
