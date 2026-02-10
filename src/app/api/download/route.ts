import { NextResponse } from 'next/server';
import { spawn, execSync } from 'child_process';

let hasFfmpeg = false;
try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    hasFfmpeg = true;
} catch (e) {
    hasFfmpeg = false;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, format, quality, start, end } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const args = [
            '-m', 'yt_dlp',
            '--no-warnings',
            '--no-call-home',
            '--quiet',
            '--no-part', // Avoid .part files when streaming to stdout
            '--output', '-', // Stream to stdout
        ];

        // Format selection
        if (format === 'audio') {
            if (hasFfmpeg) {
                const audioQuality = quality === '320k' ? '0' : '5';
                args.push('-x', '--audio-format', 'mp3', '--audio-quality', audioQuality);
                args.push('-f', 'bestaudio/best');
            } else {
                // If no ffmpeg, we can't transcode to mp3 easily
                args.push('-f', 'bestaudio[ext=m4a]/bestaudio/best');
            }
        } else if (format === 'video') {
            const height = quality ? quality.replace('p', '') : '720';
            if (hasFfmpeg) {
                // Use merging if ffmpeg is available
                args.push('-f', `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`);
                args.push('--merge-output-format', 'mp4');
            } else {
                // Fallback to pre-merged formats if no ffmpeg
                args.push('-f', `best[height<=${height}][ext=mp4]/best`);
            }
        } else if (format === 'subtitles') {
            args.push('--skip-download', '--write-subs', '--write-auto-subs', '--sub-format', 'srt', '--sub-langs', 'en.*');
        }

        // Clip trimming (requires ffmpeg)
        if (hasFfmpeg && start !== undefined && end !== undefined) {
            args.push('--download-sections', `*${start}-${end}`);
            args.push('--force-keyframes-at-cuts');
        }

        args.push(url);

        console.log('Spawning yt-dlp with args:', args.join(' '));

        const ytDlpProcess = spawn('python', args);

        const stream = new ReadableStream({
            start(controller) {
                ytDlpProcess.stdout.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });

                ytDlpProcess.stdout.on('end', () => {
                    controller.close();
                });

                ytDlpProcess.stderr.on('data', (data) => {
                    console.error("yt-dlp stderr:", data.toString());
                });

                ytDlpProcess.on('error', (err) => {
                    console.error("yt-dlp spawn error:", err);
                    controller.error(err);
                });
            },
            cancel() {
                ytDlpProcess.kill();
            },
        });

        const headers = new Headers();
        // Fallback extensions if no ffmpeg for audio
        const isAudioMP4 = format === 'audio' && !hasFfmpeg;

        headers.set('Content-Type', format === 'audio' ? (isAudioMP4 ? 'audio/mp4' : 'audio/mpeg') : 'video/mp4');
        headers.set('Content-Disposition', `attachment; filename="download.${format === 'audio' ? (isAudioMP4 ? 'm4a' : 'mp3') : 'mp4'}"`);

        return new NextResponse(stream, { headers });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Download API Error:', error);
        return NextResponse.json(
            { error: 'Download failed', details: errorMessage },
            { status: 500 }
        );
    }
}
