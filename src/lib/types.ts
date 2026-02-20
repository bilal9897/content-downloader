export interface VideoFormat {
    format_id: string;
    ext: string;
    resolution: string;
    filesize: number;
    vcodec: string;
    acodec: string;
    url: string;
}

export interface VideoInfo {
    id: string;
    title: string;
    thumbnail: string;
    duration: number; // in seconds
    formats: VideoFormat[];
    uploader: string;
    view_count: number;
    description: string;
    tags?: string[];
    platform?: 'youtube' | 'instagram' | 'other';
    _type?: string; // 'playlist' or 'video'
}

export type DownloadFormat = 'video' | 'audio';
