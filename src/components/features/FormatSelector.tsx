"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Format = "video" | "audio" | "subtitles";

interface FormatSelectorProps {
    currentFormat: Format;
    onFormatChange: (format: Format) => void;
    currentQuality: string;
    onQualityChange: (quality: string) => void;
    accentColor?: string | null;
}

export default function FormatSelector({
    currentFormat,
    onFormatChange,
    currentQuality,
    onQualityChange,
    accentColor
}: FormatSelectorProps) {
    const formats: Format[] = ["video", "audio", "subtitles"];

    const qualityOptions: Record<string, string[]> = {
        video: ["360p", "720p", "1080p"],
        audio: ["128k", "320k"],
        subtitles: []
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10 w-fit">
                {formats.map((format) => (
                    <button
                        key={format}
                        onClick={() => onFormatChange(format)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-medium transition-colors outline-none",
                            currentFormat === format ? "text-black" : "text-white/70 hover:text-white"
                        )}
                    >
                        {currentFormat === format && (
                            <motion.div
                                layoutId="activeFormat"
                                className="absolute inset-0 bg-neon-blue rounded-lg"
                                style={{ backgroundColor: accentColor || undefined }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 uppercase tracking-wider">{format}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {qualityOptions[currentFormat].length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex bg-white/5 backdrop-blur-md p-1 rounded-lg border border-white/10 w-fit ml-1"
                    >
                        {qualityOptions[currentFormat].map((q) => (
                            <button
                                key={q}
                                onClick={() => onQualityChange(q)}
                                className={cn(
                                    "relative px-3 py-1 text-[10px] font-black tracking-widest uppercase transition-colors outline-none rounded-md",
                                    currentQuality === q
                                        ? "text-neon-blue bg-neon-blue/10"
                                        : "text-white/40 hover:text-white/60"
                                )}
                            >
                                {q}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
