import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface AppSettings {
    backgroundImage: string;
    backgroundType: 'image' | 'video' | 'color' | 'preset';
    blurLevel: number; // 0-20px
    enableEffects: boolean;
    musicVolume: number;
    showLyrics: boolean; // Future proofing
    ossConfig: {
        region: string;
        accessKeyId: string;
        accessKeySecret: string;
        bucket: string;
    };
    aiConfig: {
        enabled: boolean;
        apiKey: string;
        baseURL: string;
        model: string;
        systemPrompt: string;
    };
    walineServerURL: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    backgroundImage: '', // Empty means default theme/gradient
    backgroundType: 'preset',
    blurLevel: 0,
    enableEffects: true,
    musicVolume: 0.5,
    showLyrics: true,
    ossConfig: {
        region: 'oss-cn-hangzhou',
        accessKeyId: '',
        accessKeySecret: '',
        bucket: ''
    },
    aiConfig: {
        enabled: false,
        apiKey: '',
        baseURL: 'https://api.deepseek.com/v1', // Default to DeepSeek or generic compatible
        model: 'deepseek-chat',
        systemPrompt: 'You are a romantic and helpful relationship assistant. Your tone is warm, empathetic, and slightly poetic.'
    },
    walineServerURL: '', // User needs to provide this
};

export const useSettings = () => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const saved = localStorage.getItem('app_settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    const [siteSettings, setSiteSettings] = useState<any>({});

    useEffect(() => {
        localStorage.setItem('app_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        api.getSettings().then(setSiteSettings).catch(console.error);
    }, []);

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('app_settings');
    };

    return { settings, updateSetting, resetSettings, siteSettings };
};
