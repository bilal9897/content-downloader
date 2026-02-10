"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastVariant = "default" | "success" | "destructive" | "info";

export interface ToastProps {
    id: string;
    title?: string;
    description?: string;
    variant?: ToastVariant;
}

let toastCount = 0;
let observers: ((toasts: ToastProps[]) => void)[] = [];
let toasts: ToastProps[] = [];

export const toast = (props: Omit<ToastProps, "id">) => {
    const id = (++toastCount).toString();
    toasts = [...toasts, { ...props, id }];
    observers.forEach((cb) => cb(toasts));

    setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        observers.forEach((cb) => cb(toasts));
    }, 5000);
};

export function Toaster() {
    const [activeToasts, setActiveToasts] = useState<ToastProps[]>([]);

    useEffect(() => {
        const observer = (newToasts: ToastProps[]) => setActiveToasts(newToasts);
        observers.push(observer);
        return () => {
            observers = observers.filter((o) => o !== observer);
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
            <AnimatePresence mode="popLayout">
                {activeToasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`
              p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3
              ${t.variant === 'destructive' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                                t.variant === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' :
                                    'bg-black/80 border-white/10 text-white'}
            `}
                    >
                        <div className="mt-0.5">
                            {t.variant === 'destructive' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {t.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {(t.variant === 'default' || !t.variant) && <Info className="w-5 h-5 text-neon-blue" />}
                        </div>

                        <div className="flex-1 space-y-1">
                            {t.title && <h4 className="font-bold text-sm">{t.title}</h4>}
                            {t.description && <p className="text-xs opacity-70 leading-relaxed">{t.description}</p>}
                        </div>

                        <button
                            onClick={() => {
                                toasts = toasts.filter((toast) => toast.id !== t.id);
                                observers.forEach((cb) => cb(toasts));
                            }}
                            className="opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
