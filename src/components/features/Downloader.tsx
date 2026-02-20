"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Link2, Loader2, Sparkles, Download, Settings, BarChart, Trash2, Command, List, ListPlus, ChevronDown, ChevronUp, Hash, Quote } from "lucide-react";
import FormatSelector from "./FormatSelector";
import Image from "next/image";
import { VideoInfo } from "@/lib/types";
import ClipCreator from "./ClipCreator";
import { VideoInfoSkeleton } from "@/components/ui/SkeletonLoader";
import SettingsModal from "./SettingsModal";
import { useSettings } from "@/hooks/useSettings";
import { useAnalytics } from "@/hooks/useAnalytics";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CommandBar from "./CommandBar";
import { useQueue } from "@/hooks/useQueue";
import QueueDrawer from "./QueueDrawer";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import AdSlot from "@/components/ui/AdSlot";

export default function Downloader() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [format, setFormat] = useState<"video" | "audio" | "subtitles">("video");
    const [quality, setQuality] = useState("720p");
    const [clipRange, setClipRange] = useState<[number, number] | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [accentColor, setAccentColor] = useState<string | null>(null);
    const [loadingColor, setLoadingColor] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadSpeed, setDownloadSpeed] = useState(0); // in bytes/s
    const { settings, updateSettings, loaded: settingsLoaded } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { analytics, trackDownload } = useAnalytics();
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const { queue, addToQueue, removeFromQueue, updateItemStatus, clearCompleted } = useQueue();
    const [isQueueOpen, setIsQueueOpen] = useState(false);

    const processItem = async (id: string) => {
        const item = queue.find((i: any) => i.id === id);
        if (!item) return;

        try {
            updateItemStatus(id, { status: 'processing', progress: 0 });

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: item.url,
                    format: item.format,
                    quality: item.quality
                })
            });

            if (!response.ok) throw new Error('Download failed');
            if (!response.body) throw new Error('No body');

            const reader = response.body.getReader();
            const contentLength = +(response.headers.get('Content-Length') || 0);
            let received = 0;
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;
                if (contentLength) updateItemStatus(id, { progress: (received / contentLength) * 100 });
            }

            const blob = new Blob(chunks);
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;

            const disposition = response.headers.get('Content-Disposition');
            let extension = item.format === 'audio' ? 'mp3' : item.format === 'subtitles' ? 'srt' : 'mp4';

            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?(.+?)"?$/);
                if (match && match[1]) {
                    const serverFilename = match[1];
                    extension = serverFilename.split('.').pop() || extension;
                }
            }

            a.download = `${item.title}.${extension}`;
            a.click();

            updateItemStatus(id, { status: 'completed', progress: 100 });
            trackDownload(item.format, blob.size);
            toast({
                title: "Download Complete",
                description: `${item.title.substring(0, 30)}... saved.`,
                variant: "success"
            });
        } catch (error) {
            console.error(error);
            updateItemStatus(id, { status: 'failed', error: 'Download failed' });
            toast({
                title: "Processing Failed",
                description: "The video could not be processed.",
                variant: "destructive"
            });
        }
    };

    const handleClipChange = useCallback((start: number, end: number) => {
        setClipRange([start, end]);
    }, []);

    useEffect(() => {
        if (settingsLoaded) {
            setFormat(settings.defaultFormat);
        }
    }, [settingsLoaded]);

    useEffect(() => {
        if (videoInfo?.thumbnail) {
            setLoadingColor(true);
            import("@/lib/colorUtils").then(({ getDominantColor }) => {
                getDominantColor(videoInfo.thumbnail).then(color => {
                    setAccentColor(color);
                    setLoadingColor(false);
                });
            });
        } else {
            setAccentColor(null);
        }
    }, [videoInfo]);

    const handleFetch = async () => {
        if (!url) {
            toast({ title: "URL Required", description: "Paste a link to begin.", variant: "destructive" });
            return;
        }
        setLoading(true);
        setVideoInfo(null);
        setClipRange(null); // Reset

        try {
            const response = await fetch("/api/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || "Failed to fetch video info";
                const detailedMessage = data.details ? `${errorMessage}: ${data.details}` : errorMessage;
                throw new Error(detailedMessage);
            }

            setVideoInfo(data as VideoInfo);
            setClipRange([0, data.duration]); // Initialize clip range
            toast({ title: "Video Analyzed", description: "Format and details ready.", variant: "success" });
        } catch (error: any) {
            console.error(error);
            toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!videoInfo || !url) return;

        try {
            setLoading(true);
            setDownloadProgress(0);
            setDownloadSpeed(0);

            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    format,
                    quality,
                    start: clipRange ? clipRange[0] : undefined,
                    end: clipRange ? clipRange[1] : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Download failed');
            }
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const contentLength = +(response.headers.get('Content-Length') || 0);

            let receivedLength = 0;
            const chunks = [];
            let lastUpdate = Date.now();
            let lastLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                const now = Date.now();
                if (now - lastUpdate > 200) { // Update every 200ms
                    const deltaLength = receivedLength - lastLength;
                    const deltaTime = (now - lastUpdate) / 1000;
                    setDownloadSpeed(deltaLength / deltaTime);
                    if (contentLength) setDownloadProgress((receivedLength / contentLength) * 100);

                    lastUpdate = now;
                    lastLength = receivedLength;
                }
            }

            const blob = new Blob(chunks);
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;

            // Try to get extension from Content-Disposition if possible
            const disposition = response.headers.get('Content-Disposition');
            let extension = format === 'audio' ? 'mp3' : format === 'subtitles' ? 'srt' : 'mp4';

            if (disposition && disposition.includes('filename=')) {
                const match = disposition.match(/filename="?(.+?)"?$/);
                if (match && match[1]) {
                    const serverFilename = match[1];
                    extension = serverFilename.split('.').pop() || extension;
                }
            }

            const filename = settings.fileNamingPattern
                .replace('{title}', videoInfo.title)
                .replace('{uploader}', videoInfo.uploader)
                .replace('{date}', new Date().toISOString().split('T')[0])
                .replace('{id}', videoInfo.id)
                .replace(/[^a-z0-9 \-_]/gi, '').trim() || videoInfo.id;

            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            trackDownload(format, blob.size);
            toast({ title: "Download Successful", description: `Saved as ${filename}`, variant: "success" });

        } catch (error) {
            console.error(error);
            toast({
                title: "Download Failed",
                description: "Something went wrong. Added to queue for retry.",
                variant: "destructive"
            });
            addToQueue({
                id: videoInfo.id,
                url: url,
                title: videoInfo.title,
                thumbnail: videoInfo.thumbnail,
                format: format,
                quality: quality,
            });

        } finally {
            setLoading(false);
            setDownloadProgress(0);
            setDownloadSpeed(0);
        }
    };

    const actions = [
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, perform: () => setIsSettingsOpen(true) },
        { id: 'analytics', label: 'Analytics', icon: <BarChart className="w-4 h-4" />, perform: () => setIsAnalyticsOpen(true) },
        {
            id: 'paste', label: 'Paste and Fetch', icon: <Link2 className="w-4 h-4" />, perform: async () => {
                const text = await navigator.clipboard.readText();
                if (text) {
                    setUrl(text);
                    // handleFetch would need to be accessible or we just set url and user hits go
                }
            }
        },
        {
            id: 'clear', label: 'Clear All', icon: <Trash2 className="w-4 h-4" />, perform: () => {
                setVideoInfo(null);
                setUrl("");
            }
        },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 px-4 pb-20">
            <CommandBar actions={actions} />

            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 px-2">
                <div className="flex flex-col text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-6xl font-black bg-clip-text text-transparent tracking-tighter transition-all duration-1000"
                        style={{
                            backgroundImage: accentColor
                                ? `linear-gradient(to right, ${accentColor}, #fff)`
                                : 'linear-gradient(to right, #00ffff, #bf00ff, #ff00ff)'
                        }}
                    >
                        SIPHON
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 text-xs md:text-lg font-mono uppercase tracking-widest"
                    >
                        Precision Extraction Engine
                    </motion.p>
                </div>
                <div className="flex items-center gap-3 md:gap-2 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setIsAnalyticsOpen(true)}
                        className="p-3 md:p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-neon-blue active:scale-90"
                        title="Analytics"
                    >
                        <BarChart className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsQueueOpen(true)}
                        className="p-3 md:p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-neon-blue relative active:scale-90"
                        title="Queue"
                    >
                        <List className="w-5 h-5" />
                        {queue.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 md:p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-neon-blue active:scale-90"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AnalyticsDashboard
                isOpen={isAnalyticsOpen}
                onClose={() => setIsAnalyticsOpen(false)}
                analytics={analytics}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                updateSettings={updateSettings}
            />

            {/* Top Ad Slot */}
            <div className="w-full max-w-4xl mx-auto mb-8">
                <AdSlot id="TOP-BANNER" type="horizontal" className="shadow-2xl shadow-neon-blue/5" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative group p-[1px] rounded-2xl shadow-2xl transition-all duration-1000"
                style={{
                    backgroundImage: accentColor
                        ? `linear-gradient(to right, ${accentColor}80, ${accentColor}20)`
                        : 'linear-gradient(to right, rgba(0, 210, 255, 0.5), rgba(255, 0, 122, 0.5))',
                    boxShadow: accentColor ? `0 0 40px -10px ${accentColor}40` : '0 0 40px -10px rgba(0, 210, 255, 0.2)'
                }}
            >
                <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-2 flex items-center gap-2 relative z-10">
                    <div className="pl-3 text-white/50">
                        <Link2 className="w-5 h-5" />
                    </div>
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                        placeholder="Paste YouTube or Instagram Link..."
                        className="border-0 bg-transparent focus-visible:ring-0 h-14 text-lg placeholder:text-white/30"
                    />
                    <Button
                        onClick={handleFetch}
                        variant="neon"
                        size="icon"
                        className="h-12 w-12 rounded-xl shrink-0"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </Button>
                </div>
                <div
                    className="absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 blur-lg transition duration-1000"
                    style={{
                        backgroundImage: accentColor
                            ? `linear-gradient(to right, ${accentColor}, ${accentColor})`
                            : 'linear-gradient(to right, #00d2ff, #ff007a)'
                    }}
                />
            </motion.div>

            <AnimatePresence mode="wait">
                {loading && !videoInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="skeleton"
                    >
                        <VideoInfoSkeleton />
                    </motion.div>
                )}

                {videoInfo && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="p-4 md:p-6 rounded-2xl glass-panel border transition-colors duration-1000 space-y-4 md:space-y-6"
                            style={{
                                borderColor: accentColor ? accentColor : 'rgba(255,255,255,0.1)',
                                boxShadow: accentColor ? `0 0 40px -10px ${accentColor}40` : 'none'
                            }}
                        >
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-lg group/preview"
                                    style={{ borderColor: accentColor ? accentColor : 'rgba(255,255,255,0.1)' }}
                                >
                                    {videoInfo.thumbnail ? (
                                        <Image
                                            src={videoInfo.thumbnail}
                                            alt={videoInfo.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover/preview:opacity-0 transition-opacity"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-white/5 text-white/20">
                                            <Sparkles className="w-8 h-8 opacity-20" />
                                        </div>
                                    )}

                                    {videoInfo.platform === 'youtube' && (
                                        <div className="absolute inset-0 opacity-0 group-hover/preview:opacity-100 transition-opacity bg-black">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoInfo.id}`}
                                                className="w-full h-full pointer-events-none scale-150"
                                                allow="autoplay"
                                            />
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-30">
                                        <button
                                            onClick={() => { toast({ title: "PiP Mode", description: "Picture-in-Picture activated.", variant: "info" }); }}
                                            className="p-2 bg-black/60 rounded-lg opacity-100 md:opacity-0 group-hover/preview:opacity-100 hover:bg-neon-blue transition-all"
                                            title="Picture-in-Picture"
                                        >
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono z-20">
                                        {new Date(videoInfo.duration * 1000).toISOString().substring(11, 19).replace(/^00:/, '')}
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <h3 className="text-xl font-bold line-clamp-2 leading-tight">{videoInfo.title}</h3>
                                    <p className="text-white/50 text-sm line-clamp-1">{videoInfo.uploader} • {videoInfo.view_count?.toLocaleString()} views</p>

                                    <div className="flex items-center gap-2 text-sm text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-full w-fit border border-neon-blue/20">
                                        <Sparkles className="w-4 h-4" />
                                        <span>AI Smart Analysis Ready</span>
                                    </div>

                                    {(videoInfo.description || videoInfo.tags) && (
                                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                            {videoInfo.description && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                        <Quote className="w-3 h-3" />
                                                        <span>Caption</span>
                                                    </div>
                                                    <div className="relative">
                                                        <p className={cn(
                                                            "text-xs text-white/60 leading-relaxed font-medium transition-all duration-300",
                                                            !isDescriptionExpanded && "line-clamp-2"
                                                        )}>
                                                            {videoInfo.description}
                                                        </p>
                                                        {videoInfo.description.length > 100 && (
                                                            <button
                                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                                className="flex items-center gap-1 mt-1 text-[9px] font-bold text-neon-blue hover:text-white transition-colors"
                                                            >
                                                                {isDescriptionExpanded ? (
                                                                    <>Show Less <ChevronUp className="w-3 h-3" /></>
                                                                ) : (
                                                                    <>Read More <ChevronDown className="w-3 h-3" /></>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {videoInfo.tags && videoInfo.tags.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                        <Hash className="w-3 h-3" />
                                                        <span>Hashtags</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {videoInfo.tags.slice(0, 10).map((tag, i) => (
                                                            <span key={i} className="text-[9px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {videoInfo.tags.length > 10 && (
                                                            <span className="text-[9px] font-bold text-white/20">
                                                                +{videoInfo.tags.length - 10} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ClipCreator duration={videoInfo.duration} onClipChange={handleClipChange} />

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                    <FormatSelector
                                        currentFormat={format}
                                        onFormatChange={(f) => {
                                            setFormat(f);
                                            setQuality(f === 'video' ? '720p' : f === 'audio' ? '320k' : '');
                                        }}
                                        currentQuality={quality}
                                        onQualityChange={setQuality}
                                        accentColor={accentColor}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button
                                        onClick={() => {
                                            if (!videoInfo) return;
                                            addToQueue({
                                                id: videoInfo.id,
                                                url: url,
                                                title: videoInfo.title,
                                                thumbnail: videoInfo.thumbnail,
                                                format: format,
                                                quality: quality,
                                            });
                                            setIsQueueOpen(true);
                                        }}
                                        variant="ghost"
                                        className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                                    >
                                        <ListPlus className="w-5 h-5" />
                                        Queue
                                    </Button>
                                    <Button
                                        onClick={handleDownload}
                                        disabled={loading}
                                        variant="neon"
                                        className="flex-1 sm:flex-none h-12 px-8 rounded-xl font-bold shadow-lg shadow-neon-blue/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                        style={{
                                            backgroundColor: accentColor ? accentColor : '',
                                            color: accentColor ? '#000' : ''
                                        }}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-5 h-5" />}
                                        {loading ? "Processing..." : `Get ${format === 'video' ? 'MP4' : format === 'audio' ? 'MP3' : 'SRT'} ${quality}`}
                                    </Button>
                                </div>
                            </div>

                            {loading && downloadSpeed > 0 && (
                                <div className="text-[10px] font-mono text-white/40 flex items-center justify-center sm:justify-end gap-2 w-full pt-2">
                                    <span>{(downloadSpeed / (1024 * 1024)).toFixed(2)} MB/s</span>
                                    {downloadProgress > 0 && (
                                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ width: `${downloadProgress}%` }}
                                                className="h-full bg-neon-blue"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div >
                    </motion.div >
                )
                }
            </AnimatePresence >

            <QueueDrawer
                isOpen={isQueueOpen}
                onClose={() => setIsQueueOpen(false)}
                queue={queue}
                onRemove={removeFromQueue}
                onProcess={processItem}
                onClearCompleted={clearCompleted}
            />

            {/* Bottom Ad Slot */}
            <div className="w-full max-w-4xl mx-auto mt-12 pb-12">
                <AdSlot id="BOTTOM-BANNER" type="horizontal" className="shadow-2xl shadow-neon-purple/5" />
            </div>
        </div >
    );
}
