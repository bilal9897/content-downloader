import { useState, useEffect } from 'react';

export interface Settings {
    fileNamingPattern: string;
    incognitoMode: boolean;
    defaultFormat: 'video' | 'audio';
    theme: 'dark' | 'neon'; // Future proofing
}

const DEFAULT_SETTINGS: Settings = {
    fileNamingPattern: '{title}',
    incognitoMode: false,
    defaultFormat: 'video',
    theme: 'neon',
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('neoload_settings');
        if (stored) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setLoaded(true);
    }, []);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            if (!updated.incognitoMode) {
                localStorage.setItem('neoload_settings', JSON.stringify(updated));
            }

            return updated;
        });
    };

    return { settings, updateSettings, loaded };
}
