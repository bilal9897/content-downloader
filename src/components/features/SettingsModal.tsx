import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/Switch'; // Need to create Switch or use button for now
import { Label } from '@/components/ui/Label'; // Need to create Label

export default function SettingsModal({
    settings,
    updateSettings,
    isOpen,
    onClose
}: {
    settings: any,
    updateSettings: (s: any) => void,
    isOpen: boolean,
    onClose: () => void
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-black/90 border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-neon-blue/20 rounded-lg">
                        <Settings className="w-5 h-5 text-neon-blue" />
                    </div>
                    <h2 className="text-xl font-bold">Settings</h2>
                </div>

                <div className="space-y-6">
                    {/* Incognito Mode */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-neon-pink" />
                                <span className="font-medium">Incognito Mode</span>
                            </div>
                            <p className="text-xs text-white/50">Don't save history or cookies</p>
                        </div>
                        <Button
                            variant={settings.incognitoMode ? "neon" : "outline"}
                            size="sm"
                            onClick={() => updateSettings({ incognitoMode: !settings.incognitoMode })}
                        >
                            {settings.incognitoMode ? "ON" : "OFF"}
                        </Button>
                    </div>

                    {/* File Naming */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                            <FileText className="w-4 h-4" />
                            File Naming Pattern
                        </div>
                        <Input
                            value={settings.fileNamingPattern}
                            onChange={(e) => updateSettings({ fileNamingPattern: e.target.value })}
                            className="bg-white/5 border-white/10"
                            placeholder="{title}"
                        />
                        <p className="text-xs text-white/40">
                            Available: {"{title}"}, {"{uploader}"}, {"{id}"}
                        </p>
                    </div>

                    {/* Default Format */}
                    <div className="space-y-3">
                        <span className="text-sm font-medium text-white/80">Default Format</span>
                        <div className="flex gap-2">
                            {['video', 'audio'].map((fmt) => (
                                <button
                                    key={fmt}
                                    onClick={() => updateSettings({ defaultFormat: fmt })}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${settings.defaultFormat === fmt
                                            ? 'bg-white text-black'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                    <Button onClick={onClose} variant="ghost">
                        Done
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
