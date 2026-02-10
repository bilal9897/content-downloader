import { motion } from 'framer-motion';
import { BarChart, Download, HardDrive, X } from 'lucide-react';
import { AnalyticsData } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/Button';

export default function AnalyticsDashboard({
    isOpen,
    onClose,
    analytics
}: {
    isOpen: boolean;
    onClose: () => void;
    analytics: AnalyticsData;
}) {
    if (!isOpen) return null;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-black/90 border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-neon-purple/20 rounded-lg">
                        <BarChart className="w-5 h-5 text-neon-purple" />
                    </div>
                    <h2 className="text-xl font-bold">Download Statistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 text-white/60 mb-2">
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-medium">Total Downloads</span>
                        </div>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            {analytics.totalDownloads}
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 text-white/60 mb-2">
                            <HardDrive className="w-4 h-4" />
                            <span className="text-sm font-medium">Data Saved</span>
                        </div>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                            {formatSize(analytics.filesizeSaved)}
                        </div>
                    </div>
                </div>

                <h3 className="text-sm font-medium text-white/60 mb-4">Formats Distribution</h3>
                <div className="space-y-3">
                    {Object.entries(analytics.formats).map(([format, count]) => (
                        <div key={format} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="capitalize">{format}</span>
                                <span className="text-white/40">{count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / analytics.totalDownloads) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                                />
                            </div>
                        </div>
                    ))}
                    {Object.keys(analytics.formats).length === 0 && (
                        <div className="text-center py-8 text-white/20 text-sm">
                            No downloads yet
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
