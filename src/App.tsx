import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { Heart, Stars, Music, Volume2, Cloud, ChevronDown, ChevronUp } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Components ---
// --- Components ---
import Timeline from './components/Timeline';
import { PhotoGallery } from './components/PhotoGallery';
import { FloatingHeart } from './components/FloatingHeart';
import { MusicPlayer } from './components/MusicPlayer';
import { Login } from './components/Login';
import { Countdown } from './components/Countdown';
import RandomMemory from './components/RandomMemory';
import { Footer } from './components/Footer';
import Mailbox from './components/Mailbox';
import RoseEasterEgg from './components/RoseEasterEgg';
import Lightbox from './components/Lightbox';
import { SoundManager } from './components/SoundManager';
import { SpotlightOverlay } from './components/SpotlightOverlay';
import { SakuraRainPro } from './components/SakuraRainPro';
import { Photo, Profile, TimelineEvent } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { AICompanion } from './components/AICompanion';
import { CommentSection } from './components/CommentSection';
import { useSettings } from './hooks/useSettings';
import { AppControlProvider, useAppControl } from './contexts/AppControlContext';
import { api } from './services/api';

// --- 1. 工具函数 ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- 2. Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("UI Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-800">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
                        <p>请刷新页面重试 / Please refresh the page.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Inner App Component that uses the context
const LoveSpaceApp: React.FC = () => {
    const [isNight, setIsNight] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [easterEggActive, setEasterEggActive] = useState(false);

    // settings
    const { settings, updateSetting, siteSettings } = useSettings();
    const { registerTimelineScroll, updateTimelineData, updateDaysTogether, registerUIControls } = useAppControl();

    // 引用
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const commentsRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);

    // State for data fetching and display
    // State for data fetching and display
    const [profile, setProfile] = useState<Profile | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxItem, setLightboxItem] = useState<Photo | null>(null);
    const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

    // State for heart ripples
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);

    // 🔮 彩蛋状态
    const avatarClickCount = useRef(0);
    const avatarClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Register data with context
    useEffect(() => {
        if (siteSettings?.timeline_events) {
            updateTimelineData(siteSettings.timeline_events);
        }
        if (siteSettings?.start_date) {
            const start = new Date(siteSettings.start_date).getTime();
            const now = new Date().getTime();
            const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            updateDaysTogether(days);
        }
    }, [siteSettings]);


    // Register scroll function
    useEffect(() => {
        registerTimelineScroll(() => {
            if (timelineRef.current) {
                timelineRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }, []);

    // Register UI Controls separately to avoid stale closures if possible, or include deps
    useEffect(() => {
        registerUIControls({
            openLightbox: (idx: number) => {
                const photo = photos[idx];
                if (photo) {
                    setLightboxItem(photo);
                    // need to set currentPhotoIdx if you have that state, assume yes based on previous context
                    // setCurrentPhotoIdx(idx); 
                }
            },
            closeLightbox: () => setLightboxItem(null),
            toggleTheme: () => setIsNight(prev => !prev),
            scrollToSection: (section: string) => {
                const options: ScrollIntoViewOptions = { behavior: 'smooth' };
                if (section === 'timeline' && timelineRef.current) timelineRef.current.scrollIntoView(options);
                if (section === 'gallery' && galleryRef.current) galleryRef.current.scrollIntoView(options);
                if (section === 'comments' && commentsRef.current) commentsRef.current.scrollIntoView(options);
                if (section === 'footer' && footerRef.current) footerRef.current.scrollIntoView(options);
            }
        });
    }, [photos]); // dependency on photos for lightbox index


    // 监听滚动与时间
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowContent(true);
            }
            const hour = new Date().getHours();
            setIsNight(hour >= 18 || hour < 6);
        };

        window.addEventListener('scroll', handleScroll);
        // 初始化检查
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load Data
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [pData, phData] = await Promise.all([
                    api.getProfile().catch(() => null),
                    api.getPhotos(),
                ]);

                if (pData) setProfile(pData);
                setPhotos(phData);
            } catch (err) {
                console.error("加载失败:", err);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    // 处理头像点击（彩蛋触发）
    const handleAvatarClick = () => {
        avatarClickCount.current += 1;
        if (avatarClickCount.current >= 5) {
            setEasterEggActive(true);
            avatarClickCount.current = 0;
        }

        if (avatarClickTimer.current) {
            clearTimeout(avatarClickTimer.current);
        }
        avatarClickTimer.current = setTimeout(() => {
            avatarClickCount.current = 0;
        }, 2000);
    };

    const addHeart = (e: React.MouseEvent) => {
        const newHeart = { id: Date.now(), x: e.clientX - 12, y: e.clientY - 12 };
        setHearts(prev => [...prev, newHeart]);
    };
    const removeHeart = (id: number) => setHearts(prev => prev.filter(h => h.id !== id));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-pink-50">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Heart className="w-16 h-16 text-pink-500 fill-current" />
                </motion.div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "min-h-screen transition-colors duration-1000 relative overflow-hidden font-sans selection:bg-pink-200 selection:text-pink-900",
                isNight ? "bg-slate-900 text-slate-100" : "bg-gradient-to-br from-pink-50 via-white to-purple-50 text-slate-800"
            )}
            onClick={addHeart}
        >
            {/* Background Layer */}
            <div className="fixed inset-0 z-0 transition-opacity duration-1000">
                {/* Only use custom background if type is image/video/preset */}
                {settings.backgroundImage && (
                    <div className="absolute inset-0 z-0">
                        {settings.backgroundType === 'video' ? (
                            <video
                                src={settings.backgroundImage}
                                autoPlay loop muted playsInline
                                className="w-full h-full object-cover"
                                style={{ filter: `blur(${settings.blurLevel}px)` }}
                            />
                        ) : (
                            <img
                                src={settings.backgroundImage}
                                alt="Background"
                                className="w-full h-full object-cover transition-opacity duration-700"
                                style={{ filter: `blur(${settings.blurLevel}px)` }}
                            />
                        )}
                        <div className={`absolute inset-0 ${isNight ? 'bg-black/60' : 'bg-white/30'} backdrop-blur-[2px]`} />
                    </div>
                )}

                {(!settings.backgroundImage || settings.backgroundType === 'preset') && (
                    settings.enableEffects && <SakuraRainPro isActive={true} />
                )}
            </div>

            {/* Click Hearts Effect */}
            {hearts.map(h => (
                <FloatingHeart key={h.id} x={h.x} y={h.y} onComplete={() => removeHeart(h.id)} />
            ))}

            <SoundManager isNight={isNight} curtainOpen={curtainOpen} />
            <SettingsPanel settings={settings} updateSetting={updateSetting} isNight={isNight} />
            <AICompanion settings={settings} isNight={isNight} photos={photos} profile={profile} />
            <SpotlightOverlay isNight={isNight} />

            {/* 盛大开幕：礼花 + 帷幕 */}
            {!curtainOpen && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
                >
                    <button
                        onClick={() => setCurtainOpen(true)}
                        className="px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
                    >
                        开启我们的故事 ❤️
                    </button>
                </motion.div>
            )}

            {/* Hero Section */}
            <header className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center space-y-8"
                >
                    <div
                        className="relative w-48 h-48 mx-auto cursor-pointer group"
                        onClick={handleAvatarClick}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className={cn(
                                "absolute inset-0 rounded-full border-4 border-dashed opacity-50",
                                isNight ? "border-purple-400" : "border-pink-300"
                            )}
                        />
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10">
                            <div className="p-1 rounded-full bg-pink-100/50 backdrop-blur-sm">
                                <img
                                    src={profile?.avatar1}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <motion.h1
                            className={cn(
                                "text-5xl md:text-7xl font-bold tracking-tight",
                                isNight ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" : "text-slate-800"
                            )}
                        >
                            {siteSettings.site_title || "Our Love Space"}
                        </motion.h1>

                        <p className={cn(
                            "text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed",
                            isNight ? "text-slate-300" : "text-slate-600"
                        )}>
                            {siteSettings.site_description || "记录我们要走过的每一天，存下所有的温柔与感动。"}
                        </p>
                    </div>

                    <Countdown targetDate={siteSettings.start_date || "2023-01-01"} />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <ChevronDown className={isNight ? "text-white/50" : "text-slate-400"} />
                </motion.div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 pb-32 space-y-32">

                {/* 1. 随机回忆 & 卡片 */}
                <div className="flex justify-center py-6">
                    <RandomMemory photos={photos} timeline={siteSettings.timeline_events} isNight={isNight} />
                </div>

                {/* 2. 照片画廊 */}
                {photos.length > 0 && (
                    <section ref={galleryRef}>
                        <h2 className={cn(
                            "text-3xl font-bold text-center mb-12",
                            isNight ? "text-white" : "text-slate-800"
                        )}>
                            美好瞬间
                        </h2>
                        <PhotoGallery photos={photos} isNight={isNight} />
                    </section>
                )}

                {/* 3. 时间轴 */}
                {siteSettings.timeline_events && siteSettings.timeline_events.length > 0 && (
                    <div ref={timelineRef}>
                        <Timeline events={siteSettings.timeline_events} isNight={isNight} />
                    </div>
                )}
            </main>

            {/* Footer Components */}
            <div ref={footerRef}>
                <Footer
                    isNight={isNight}
                    siteSettings={siteSettings}
                    startTime={siteSettings.start_date || "2023-01-01"}
                />
            </div>

            <MusicPlayer
                isNight={isNight}
                playlist={siteSettings.music_playlist}
            />

            <div ref={commentsRef}>
                <CommentSection settings={settings} isNight={isNight} />
            </div>

            <RoseEasterEgg
                isActive={easterEggActive}
                onClose={() => setEasterEggActive(false)}
                message={siteSettings.easter_egg_message || "我永远爱你 ❤️"}
            />

            <AnimatePresence>
                {lightboxItem && (
                    <Lightbox
                        image={lightboxItem.imageUrl}
                        title={lightboxItem.title}
                        photo={lightboxItem}
                        onClose={() => setLightboxItem(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default function App() {
    return (
        <AppControlProvider>
            <LoveSpaceApp />
        </AppControlProvider>
    );
}
