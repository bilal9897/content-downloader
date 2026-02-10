"use client";

import { useState, useEffect } from "react";

export interface QueueItem {
    id: string;
    url: string;
    title: string;
    thumbnail: string;
    format: "video" | "audio" | "subtitles";
    quality: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error?: string;
}


export function useQueue() {
    const [queue, setQueue] = useState<QueueItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('neoload_queue');
        if (saved) {
            setQueue(JSON.parse(saved));
        }
    }, []);

    const saveQueue = (newQueue: QueueItem[]) => {
        setQueue(newQueue);
        localStorage.setItem('neoload_queue', JSON.stringify(newQueue));
    };

    const addToQueue = (item: Omit<QueueItem, 'status' | 'progress'>) => {
        const newItem: QueueItem = { ...item, status: 'pending', progress: 0 };
        saveQueue([...queue, newItem]);
    };

    const removeFromQueue = (id: string) => {
        saveQueue(queue.filter(item => item.id !== id));
    };

    const updateItemStatus = (id: string, updates: Partial<QueueItem>) => {
        saveQueue(queue.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const clearCompleted = () => {
        saveQueue(queue.filter(item => item.status !== 'completed'));
    };

    return {
        queue,
        addToQueue,
        removeFromQueue,
        updateItemStatus,
        clearCompleted
    };
}
