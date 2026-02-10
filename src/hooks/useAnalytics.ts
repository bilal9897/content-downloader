import { useState, useEffect } from 'react';
import { useSettings } from './useSettings';

export interface AnalyticsData {
    totalDownloads: number;
    filesizeSaved: number; // in bytes (estimated)
    formats: Record<string, number>;
}

const DEFAULT_ANALYTICS: AnalyticsData = {
    totalDownloads: 0,
    filesizeSaved: 0,
    formats: {}
};

export function useAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData>(DEFAULT_ANALYTICS);
    const { settings } = useSettings();

    useEffect(() => {
        const stored = localStorage.getItem('neoload_analytics');
        if (stored) {
            try {
                setAnalytics(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse analytics", e);
            }
        }
    }, [settings.incognitoMode]); // Reload if incognito changes? Actually just load once.

    const trackDownload = (format: string, filesize: number = 0) => {
        if (settings.incognitoMode) return;

        setAnalytics(prev => {
            const updated = {
                totalDownloads: prev.totalDownloads + 1,
                filesizeSaved: prev.filesizeSaved + filesize,
                formats: {
                    ...prev.formats,
                    [format]: (prev.formats[format] || 0) + 1
                }
            };
            localStorage.setItem('neoload_analytics', JSON.stringify(updated));
            return updated;
        });
    };

    return { analytics, trackDownload };
}
