"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Trash2, CheckCircle, AlertCircle, Loader2, List } from "lucide-react";
import { QueueItem } from "@/hooks/useQueue";
import Image from "next/image";

interface QueueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    queue: QueueItem[];
    onRemove: (id: string) => void;
    onProcess: (id: string) => void;
    onClearCompleted: () => void;
}

export default function QueueDrawer({
    isOpen,
    onClose,
    queue,
    onRemove,
    onProcess,
    onClearCompleted
}: QueueDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-black/90 border-l border-white/10 z-[120] flex flex-col shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <List className="w-5 h-5 text-neon-blue" />
                                <h2 className="text-xl font-bold text-white">Download Queue</h2>
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-white/60">
                                    {queue.length}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {queue.length > 0 ? (
                                queue.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-4 group"
                                    >
                                        <div className="relative w-24 aspect-video rounded-md overflow-hidden shrink-0">
                                            <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                                            {item.status === 'processing' && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h4 className="text-sm font-medium text-white line-clamp-1">{item.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded">
                                                    {item.format}
                                                </span>
                                                <span className="text-[10px] text-white/40">
                                                    {item.status === 'pending' && 'Pending'}
                                                    {item.status === 'processing' && `Processing... ${Math.round(item.progress)}%`}
                                                    {item.status === 'completed' && 'Completed'}
                                                    {item.status === 'failed' && 'Failed'}
                                                </span>
                                            </div>

                                            {item.status === 'processing' && (
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                                    <motion.div
                                                        className="h-full bg-neon-blue"
                                                        animate={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.status === 'pending' && (
                                                <button onClick={() => onProcess(item.id)} className="p-1.5 hover:bg-neon-blue/20 rounded text-neon-blue transition-colors">
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => onRemove(item.id)} className="p-1.5 hover:bg-red-500/20 rounded text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                    <div className="p-4 bg-white/5 rounded-full">
                                        <List className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-white/40 text-sm">Your queue is empty. Add videos to start bulk downloading.</p>
                                </div>
                            )}
                        </div>

                        {queue.some(i => i.status === 'completed') && (
                            <div className="p-4 border-t border-white/10">
                                <button
                                    onClick={onClearCompleted}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear Completed
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
