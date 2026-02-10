"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/Slider";
import { Scissors } from "lucide-react";

interface ClipCreatorProps {
    duration: number; // in seconds
    onClipChange: (start: number, end: number) => void;
}

export default function ClipCreator({ duration, onClipChange }: ClipCreatorProps) {
    const [range, setRange] = useState([0, duration]);

    useEffect(() => {
        onClipChange(range[0], range[1]);
    }, [range[0], range[1], onClipChange]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-neon-pink font-medium">
                <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    <span>Smart Clip Mode</span>
                </div>
                <div className="bg-neon-pink/10 px-2 py-1 rounded text-xs border border-neon-pink/20">
                    {formatTime(range[0])} - {formatTime(range[1])}
                </div>
            </div>

            <Slider
                defaultValue={[0, duration]}
                max={duration}
                step={1}
                minStepsBetweenThumbs={1}
                value={range}
                onValueChange={setRange}
                className="py-4"
            />

            <div className="flex justify-between text-xs text-white/30">
                <span>0:00</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
}
