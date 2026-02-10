"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Search, Settings, BarChart, History, Link, X, Trash2 } from "lucide-react";

interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    perform: () => void;
}

export default function CommandBar({
    actions
}: {
    actions: Action[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
        }
    }, [isOpen]);

    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-xl bg-black/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden"
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-white/10">
                            <Search className="w-5 h-5 text-white/40" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Type a command or search..."
                                className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder:text-white/20 text-lg"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md text-[10px] font-mono text-white/40">
                                <span className="text-xs">ESC</span>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {filteredActions.length > 0 ? (
                                filteredActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            action.perform();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-neon-blue/20 group-hover:text-neon-blue transition-colors">
                                                {action.icon}
                                            </div>
                                            <span className="font-medium text-white/80">{action.label}</span>
                                        </div>
                                        {action.shortcut && (
                                            <span className="text-[10px] font-mono text-white/20">{action.shortcut}</span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center text-white/20">
                                    No commands found
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                <span>Navigate <span className="text-white/50">↑↓</span></span>
                                <span>Select <span className="text-white/50">↵</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-white/20 italic text-[10px]">
                                <Command className="w-3 h-3" />
                                <span>SIPHON Command Palette</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
