import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Image as ImageIcon, Wand2, Music, Upload, Check, Cloud, Bot, Key, Save, MessageSquare } from 'lucide-react';
import { AppSettings } from '../hooks/useSettings';
import { OSSManager } from '../utils/oss';

interface SettingsPanelProps {
    settings: AppSettings;
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    isNight: boolean;
}

const TABS = [
    { id: 'background', label: '背景', icon: ImageIcon },
    { id: 'effects', label: '特效', icon: Wand2 },
    { id: 'cloud', label: 'Cloud & AI', icon: Cloud },
    // { id: 'music', label: '音乐', icon: Music }, // Reserve for future expansion
];

const PRESET_BACKGROUNDS = [
    { id: 'default', url: '', label: 'Default' },
    { id: 'starry', url: 'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?q=80&w=2070&auto=format&fit=crop', label: 'Starry Night' },
    { id: 'sunset', url: 'https://images.unsplash.com/photo-1472120435266-53113306b2a8?q=80&w=2069&auto=format&fit=crop', label: 'Sunset' },
    { id: 'forest', url: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2070&auto=format&fit=crop', label: 'Forest' },
    { id: 'ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', label: 'Ocean' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, updateSetting, isNight }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('background');
    const [customUrl, setCustomUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customUrl) {
            updateSetting('backgroundImage', customUrl);
            updateSetting('backgroundType', 'image');
            setCustomUrl('');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!settings.ossConfig.accessKeyId || !settings.ossConfig.bucket) {
            alert('Please configure OSS settings first!');
            setActiveTab('cloud');
            return;
        }

        setUploading(true);
        try {
            const oss = new OSSManager(settings.ossConfig);
            const url = await oss.uploadFile(file, 'backgrounds/');
            if (url) {
                updateSetting('backgroundImage', url);
                updateSetting('backgroundType', 'image');
            }
        } catch (error) {
            console.error(error);
            alert('Upload failed. Check console for details.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${isNight
                    ? 'bg-zinc-800/50 text-white border border-white/10 hover:bg-zinc-700/50'
                    : 'bg-white/50 text-slate-800 border border-black/5 hover:bg-white/80'
                    }`}
            >
                <Settings size={24} strokeWidth={1.5} />
            </motion.button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:w-[600px] md:left-1/2 md:-translate-x-1/2 md:h-[600px] z-[101] rounded-3xl overflow-hidden flex flex-col shadow-2xl ${isNight ? 'bg-zinc-900/90 border border-white/10' : 'bg-white/90 border border-white/40'
                                } backdrop-blur-xl`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className={`text-xl font-light tracking-wide ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                    Customization
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isNight ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content Layout */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className={`w-20 flex flex-col items-center py-6 gap-4 border-r ${isNight ? 'border-white/5 bg-black/20' : 'border-black/5 bg-slate-50/50'}`}>
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`p-3 rounded-2xl transition-all ${activeTab === tab.id
                                                ? (isNight ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-800 shadow-lg')
                                                : (isNight ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600')
                                                }`}
                                        >
                                            <tab.icon size={24} strokeWidth={1.5} />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Panel */}
                                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                    {activeTab === 'background' && (
                                        <div className="space-y-8">
                                            {/* Presets */}
                                            <section>
                                                <h3 className={`text-sm font-medium mb-4 uppercase tracking-wider ${isNight ? 'text-white/40' : 'text-slate-400'}`}>Presets</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {PRESET_BACKGROUNDS.map(bg => (
                                                        <button
                                                            key={bg.id}
                                                            onClick={() => {
                                                                updateSetting('backgroundImage', bg.url);
                                                                updateSetting('backgroundType', bg.url ? 'image' : 'preset');
                                                            }}
                                                            className={`relative aspect-video rounded-xl overflow-hidden group border-2 transition-all ${(settings.backgroundImage === bg.url)
                                                                ? (isNight ? 'border-amber-500' : 'border-pink-500')
                                                                : 'border-transparent hover:border-white/20'
                                                                }`}
                                                        >
                                                            {bg.url ? (
                                                                <img src={bg.url} alt={bg.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${isNight ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                                                                    <span className="opacity-50 text-xs">Default Theme</span>
                                                                </div>
                                                            )}
                                                            {settings.backgroundImage === bg.url && (
                                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                                    <div className={`p-1 rounded-full ${isNight ? 'bg-amber-500 text-black' : 'bg-pink-500 text-white'}`}>
                                                                        <Check size={16} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {bg.label}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Custom URL */}
                                            <section>
                                                <h3 className={`text-sm font-medium mb-4 uppercase tracking-wider ${isNight ? 'text-white/40' : 'text-slate-400'}`}>Custom Image</h3>
                                                <form onSubmit={handleUrlSubmit} className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Paste image URL here..."
                                                        value={customUrl}
                                                        onChange={(e) => setCustomUrl(e.target.value)}
                                                        className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isNight
                                                            ? 'bg-white/5 border border-white/10 text-white focus:border-amber-500/50'
                                                            : 'bg-slate-100 border border-slate-200 text-slate-800 focus:border-pink-500/50'
                                                            }`}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${isNight
                                                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                                                            : 'bg-pink-500 text-white hover:bg-pink-600'
                                                            }`}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                </form>

                                                <div className="mt-4">
                                                    <label className={`block w-full cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isNight ? 'border-white/10 hover:border-amber-500/50 hover:bg-white/5' : 'border-slate-200 hover:border-pink-500/50 hover:bg-pink-50'
                                                        }`}>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Upload size={20} className={isNight ? 'text-white/40' : 'text-slate-400'} />
                                                            <span className={`text-sm ${isNight ? 'text-white/60' : 'text-slate-500'}`}>
                                                                {uploading ? 'Uploading to OSS...' : 'Upload to Aliyun OSS'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </section>

                                            {/* Blur Level */}
                                            <section>
                                                <div className="flex justify-between mb-4">
                                                    <h3 className={`text-sm font-medium uppercase tracking-wider ${isNight ? 'text-white/40' : 'text-slate-400'}`}>Blur Background</h3>
                                                    <span className={`text-xs ${isNight ? 'text-white/60' : 'text-slate-500'}`}>{settings.blurLevel}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    step="1"
                                                    value={settings.blurLevel}
                                                    onChange={(e) => updateSetting('blurLevel', parseInt(e.target.value))}
                                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                />
                                            </section>
                                        </div>
                                    )}

                                    {activeTab === 'effects' && (
                                        <div className="space-y-6">
                                            <div className={`p-4 rounded-xl flex items-center justify-between ${isNight ? 'bg-white/5' : 'bg-slate-50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Wand2 size={20} className={isNight ? 'text-amber-400' : 'text-pink-500'} />
                                                    <div>
                                                        <h4 className={`font-medium ${isNight ? 'text-white' : 'text-slate-800'}`}>Enable Effects</h4>
                                                        <p className={`text-xs ${isNight ? 'text-white/40' : 'text-slate-500'}`}>Fireflies, Sakura Rain, etc.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => updateSetting('enableEffects', !settings.enableEffects)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableEffects
                                                        ? (isNight ? 'bg-amber-500' : 'bg-pink-500')
                                                        : (isNight ? 'bg-white/10' : 'bg-slate-200')
                                                        }`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${startTransition(settings.enableEffects)}`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'cloud' && (
                                        <div className="space-y-8">
                                            {/* OSS Configuration */}
                                            <section className="space-y-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Cloud size={18} className={isNight ? 'text-blue-400' : 'text-blue-600'} />
                                                    <h3 className={`font-medium uppercase tracking-wider ${isNight ? 'text-white/80' : 'text-slate-600'}`}>Aliyun OSS Config</h3>
                                                </div>

                                                <div className="grid gap-4">
                                                    <div>
                                                        <label className="text-xs mb-1 block opacity-60">Region (e.g., oss-cn-hangzhou)</label>
                                                        <input
                                                            type="text"
                                                            value={settings.ossConfig.region}
                                                            onChange={e => updateSetting('ossConfig', { ...settings.ossConfig, region: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs mb-1 block opacity-60">Bucket Name</label>
                                                        <input
                                                            type="text"
                                                            value={settings.ossConfig.bucket}
                                                            onChange={e => updateSetting('ossConfig', { ...settings.ossConfig, bucket: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs mb-1 block opacity-60">AccessKey ID</label>
                                                            <input
                                                                type="password"
                                                                value={settings.ossConfig.accessKeyId}
                                                                onChange={e => updateSetting('ossConfig', { ...settings.ossConfig, accessKeyId: e.target.value })}
                                                                className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs mb-1 block opacity-60">AccessKey Secret</label>
                                                            <input
                                                                type="password"
                                                                value={settings.ossConfig.accessKeySecret}
                                                                onChange={e => updateSetting('ossConfig', { ...settings.ossConfig, accessKeySecret: e.target.value })}
                                                                className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <div className={`h-px w-full ${isNight ? 'bg-white/10' : 'bg-black/5'}`} />

                                            {/* Waline Comments Configuration */}
                                            <section className="space-y-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <MessageSquare size={18} className={isNight ? 'text-purple-400' : 'text-purple-600'} />
                                                    <h3 className={`font-medium uppercase tracking-wider ${isNight ? 'text-white/80' : 'text-slate-600'}`}>Comments</h3>
                                                </div>
                                                <div>
                                                    <label className="text-xs mb-1 block opacity-60">Waline Server URL (Vercel)</label>
                                                    <input
                                                        type="text"
                                                        value={settings.walineServerURL}
                                                        onChange={e => updateSetting('walineServerURL', e.target.value)}
                                                        className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                        placeholder="https://your-waline-app.vercel.app"
                                                    />
                                                </div>
                                            </section>

                                            <div className={`h-px w-full ${isNight ? 'bg-white/10' : 'bg-black/5'}`} />

                                            {/* AI Configuration */}
                                            <section className="space-y-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Bot size={18} className={isNight ? 'text-green-400' : 'text-green-600'} />
                                                    <h3 className={`font-medium uppercase tracking-wider ${isNight ? 'text-white/80' : 'text-slate-600'}`}>AI Companion</h3>
                                                </div>

                                                <div className="flex items-center justify-between p-3 rounded-lg border border-opacity-50 mb-4 bg-opacity-50">
                                                    <span className="text-sm">Enable AI Chat</span>
                                                    <button
                                                        onClick={() => updateSetting('aiConfig', { ...settings.aiConfig, enabled: !settings.aiConfig.enabled })}
                                                        className={`w-10 h-5 rounded-full transition-colors relative ${settings.aiConfig.enabled
                                                            ? (isNight ? 'bg-green-500' : 'bg-green-600')
                                                            : (isNight ? 'bg-white/10' : 'bg-slate-300')
                                                            }`}
                                                    >
                                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${startTransition(settings.aiConfig.enabled)}`} />
                                                    </button>
                                                </div>

                                                <div className="grid gap-4">
                                                    <div>
                                                        <label className="text-xs mb-1 block opacity-60">API Key (e.g., sk-...)</label>
                                                        <div className="relative">
                                                            <Key size={14} className="absolute left-3 top-2.5 opacity-50" />
                                                            <input
                                                                type="password"
                                                                value={settings.aiConfig.apiKey}
                                                                onChange={e => updateSetting('aiConfig', { ...settings.aiConfig, apiKey: e.target.value })}
                                                                className={`w-full pl-9 pr-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                                placeholder="sk-..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs mb-1 block opacity-60">Base URL</label>
                                                        <input
                                                            type="text"
                                                            value={settings.aiConfig.baseURL}
                                                            onChange={e => updateSetting('aiConfig', { ...settings.aiConfig, baseURL: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg outline-none text-sm ${isNight ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

function startTransition(active: boolean) {
    return active ? 'translate-x-6' : 'translate-x-0';
}
