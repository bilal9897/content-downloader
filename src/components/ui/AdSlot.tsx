"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface AdSlotProps {
    className?: string;
    id?: string;
    type?: "horizontal" | "vertical" | "square";
}

export default function AdSlot({ className, id, type = "horizontal" }: AdSlotProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn(
                "relative group overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:border-white/10",
                type === "horizontal" && "w-full h-24 md:h-32",
                type === "vertical" && "w-64 h-96",
                type === "square" && "w-full aspect-square md:w-64",
                className
            )}
        >
            {/* Decorative Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex flex-col items-center gap-2 text-white/20 select-none">
                <Shield className="w-5 h-5 opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sponsored Insight</span>
                <div className="text-[8px] font-mono text-white/10">{id || "AD-UNIT-X"}</div>
            </div>

            {/* Actual AdSense Slot Placeholder */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="absolute top-2 left-2 w-1 h-1 bg-neon-blue rounded-full" />
                <div className="absolute top-2 right-2 w-1 h-1 bg-neon-purple rounded-full" />
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-neon-pink rounded-full" />
                <div className="absolute bottom-2 right-2 w-1 h-1 bg-neon-blue rounded-full" />
            </div>

            {/* AdScript Target (Hidden until script loads) */}
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot={id || "XXXXXXXXXX"}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </motion.div>
    );
}
