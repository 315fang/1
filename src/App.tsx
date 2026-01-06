import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useTransform, PanInfo } from 'framer-motion';
import { Sun, Moon, Sparkles, Flower, ChevronLeft, ChevronRight, Heart, Maximize2 } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Analytics } from '@vercel/analytics/react';
import Lightbox from './components/Lightbox';
import CoupleHeader from './components/CoupleHeader';
import Timeline from './components/Timeline';
import RandomMemory from './components/RandomMemory';
import MusicPlayer from './components/MusicPlayer';
import RoseEasterEgg from './components/RoseEasterEgg';
import Mailbox from './components/Mailbox';
import { api } from './services/api';
import { SakuraRainPro } from './components/SakuraRainPro';
import { Photo, Profile, TimelineEvent } from './types';

// --- 1. 工具函数 ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- 2. 资源定义 (鼠标图标 SVG) ---
const BIRD_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M8.2 6.5a4.2 4.2 0 0 1 7.6 0"/></svg>') 16 16, auto`;

const TORCH_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4 10 20"/><path d="m11 12-2 3"/><path d="m13 12 2 3"/><path d="M8.2 6.5a4.2 4.2 0 0 1 7.6 0"/><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/></svg>') 16 16, auto`;

// 🔊 升级版音效管理器 (5秒掌声)
const SoundManager = ({ isNight, curtainOpen }: { isNight: boolean, curtainOpen: boolean }) => {
    useEffect(() => {
        if (curtainOpen) {
            // 这里换了一个更清晰的掌声音效
            const applause = new Audio('https://www.soundjay.com/human/sounds/applause-01.mp3');
            applause.volume = 0.8;
            applause.play().catch(e => console.log("音频播放被拦截", e));

            // 5秒后开始淡出并停止
            const stopTime = 5000;
            const fadeInterval = setInterval(() => {
                if (applause.volume > 0.1) {
                    applause.volume -= 0.1; // 快速淡出
                } else {
                    applause.pause();
                    applause.currentTime = 0;
                    clearInterval(fadeInterval);
                }
            }, 50); // 每50ms降低一次音量，制造淡出效果

            // 确保在5秒多一点的时候彻底停掉
            setTimeout(() => {
                if (!applause.paused) {
                    applause.pause();
                    clearInterval(fadeInterval);
                }
            }, stopTime);
        }
    }, [curtainOpen]);

    return null;
};

// 🎀 新版特效：从两侧吹入的礼花与彩带
const SideBlownConfetti = ({ isActive }: { isActive: boolean }) => {
    // 生成 60 个彩色粒子 (彩带片段和圆形纸屑)
    const particles = React.useMemo(() => {
        const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ffffff'];
        return Array.from({ length: 60 }).map((_, i) => {
            const isLeft = i % 2 === 0; // 偶数从左边出，奇数从右边出
            const startX = isLeft ? -100 : window.innerWidth + 100; // 起始点在屏幕外
            const startY = Math.random() * window.innerHeight; // 随机高度分布

            // 目标点：向屏幕中央移动，Y轴随机飘动
            const targetX = isLeft
                ? Math.random() * (window.innerWidth * 0.6) // 左侧粒子飘到屏幕中右部
                : window.innerWidth - Math.random() * (window.innerWidth * 0.6); // 右侧粒子飘到屏幕中左部

            const targetY = startY + (Math.random() - 0.5) * 400; // Y轴上下随机漂浮

            return {
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                // 随机形状：圆点或长条彩带
                isRibbon: Math.random() > 0.6,
                startX,
                startY,
                targetX,
                targetY,
                scale: Math.random() * 0.6 + 0.4,
                rotation: Math.random() * 720 - 360, // 剧烈旋转
                delay: Math.random() * 0.5 // 稍微错开出发时间，更自然
            };
        });
    }, [isActive]); // 只有激活时才重新计算

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: p.startX, y: p.startY, opacity: 0, scale: p.scale, rotate: 0 }}
                    animate={{
                        x: p.targetX,
                        y: p.targetY,
                        opacity: [0, 1, 1, 0], // 出现->停留->消失
                        rotate: p.rotation,
                    }}
                    transition={{
                        duration: 3.5, // 飘动时间长一点，配合帷幕
                        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
                        delay: p.delay,
                        times: [0, 0.1, 0.8, 1]
                    }}
                    style={{
                        position: 'absolute',
                        backgroundColor: p.color,
                        // 根据类型决定形状：彩带是长条，纸屑是圆点
                        width: p.isRibbon ? '16px' : '10px',
                        height: p.isRibbon ? '4px' : '10px',
                        borderRadius: p.isRibbon ? '2px' : '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                />
            ))}
        </div>
    );
};

// --- 3. 组件定义 ---

// 🎭 修正版：真·天鹅绒帷幕 (从中间向两侧收)
const LuxuriousCurtain = ({ isOpen, onOpen, isNight }: { isOpen: boolean; onOpen: () => void; isNight: boolean }) => {
    // 🎨 材质：深红/深黑天鹅绒，带垂直褶皱光影
    const velvetGradient = isNight
        ? `repeating-linear-gradient(90deg, #09090b 0%, #18181b 5%, #27272a 10%, #18181b 15%, #09090b 20%)`
        : `repeating-linear-gradient(90deg, #450a0a 0%, #7f1d1d 5%, #991b1b 10%, #7f1d1d 15%, #450a0a 20%)`;

    // 💡 阴影：给中间裂缝处加深阴影，制造厚度感
    // 左帘右侧阴影，右帘左侧阴影
    const shadowLeft = 'inset -20px 0 50px rgba(0,0,0,0.6)';
    const shadowRight = 'inset 20px 0 50px rgba(0,0,0,0.6)';

    return (
        <motion.div
            className="absolute inset-0 z-[999] overflow-hidden cursor-pointer"
            onClick={onOpen}
            style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
        >
            {/* === 左侧帷幕 (钉在左边) === */}
            <motion.div
                className="absolute top-0 bottom-0 left-0 h-full z-10"
                style={{
                    backgroundImage: velvetGradient,
                    boxShadow: shadowLeft,
                    borderRight: '1px solid rgba(255,255,255,0.1)' // 微弱的高光边
                }}
                initial={{ width: "50%" }}
                animate={{ width: isOpen ? "0%" : "50%" }}
                transition={{ duration: 2.0, ease: [0.65, 0, 0.35, 1] }} // 贝塞尔曲线：先慢后快
            >
                {/* 装饰：底部流苏阴影 */}
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent" />
            </motion.div>

            {/* === 右侧帷幕 (钉在右边) === */}
            <motion.div
                className="absolute top-0 bottom-0 right-0 h-full z-10"
                style={{
                    backgroundImage: velvetGradient,
                    boxShadow: shadowRight,
                    borderLeft: '1px solid rgba(255,255,255,0.1)'
                }}
                initial={{ width: "50%" }}
                animate={{ width: isOpen ? "0%" : "50%" }}
                transition={{ duration: 2.0, ease: [0.65, 0, 0.35, 1] }}
            >
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent" />
            </motion.div>

            {/* === 开场文字 (金碧辉ZX效果) === */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                    >
                        <div className="border border-yellow-500/30 px-10 py-6 bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <h1 className="text-4xl md:text-6xl font-serif text-yellow-100/90 tracking-[0.2em] drop-shadow-2xl">
                                WELCOME
                            </h1>
                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent my-4" />
                            <p className="text-xs text-yellow-200/60 tracking-[0.5em] uppercase animate-pulse">
                                Tap to Open
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FireflyItem = ({ p }: { p: any }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.8, 0.2, 0.8, 0], scale: [0, 1, 0.8, 1.2, 0], x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50], y: [0, Math.random() * -100 - 50, Math.random() * -100] }}
        exit={{ opacity: 0 }}
        transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
        style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
        className="absolute rounded-full blur-[1px] bg-amber-200 shadow-[0_0_8px_gold]"
    />
);

const Fireflies = ({ isActive }: { isActive: boolean }) => {
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({ id: i, left: Math.random() * 100, top: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 10 + 10 })), []);
    if (!isActive) return null;
    return <div className="absolute inset-0 overflow-hidden pointer-events-none z-0"><AnimatePresence>{particles.map(p => <FireflyItem key={p.id} p={p} />)}</AnimatePresence></div>;
};

// 🔦 探照灯层
const SpotlightOverlay = ({ isNight }: { isNight: boolean }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => { mouseX.set(clientX); mouseY.set(clientY); };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
    // 进一步调亮探照灯：半径增加到 500px，边缘透明度降低到 0.6
    const background = useMotionTemplate`radial-gradient(circle 500px at ${mouseX}px ${mouseY}px, rgba(0,0,0,0) 0%, rgba(5,5,8,0.2) 50%, rgba(5,5,8,0.6) 90%)`;
    return <motion.div className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-1000" style={{ background: background, opacity: isNight ? 1 : 0 }} />;
};

// 拉绳组件
const RopeParticle = ({ y, p, side, isDark }: { y: any, p: any, side: string, isDark: boolean }) => {
    const x = useTransform(y, [0, 120], [p.initialX, 0]);
    const currentY = useTransform(y, [0, 120], [p.initialY, 0]);
    const opacity = useTransform(y, [0, 20, 120], [0, 1, 0.5]);
    return <motion.div className={cn("absolute rounded-full pointer-events-none transition-colors duration-300", side === 'right' ? (isDark ? "bg-amber-200 shadow-[0_0_2px_gold]" : "bg-pink-300") : "bg-white")} style={{ width: p.size, height: p.size, x: x, y: currentY, opacity: opacity, top: '50%', left: '50%', marginTop: -p.size / 2, marginLeft: -p.size / 2, position: 'absolute', borderRadius: (!isDark && side === 'right') ? "50% 0 50% 0" : "50%" }} />;
};

interface PullCordProps { side: 'left' | 'right'; label: string; icon: React.ReactNode; y: any; onTrigger: () => void; isDark?: boolean; }
const PullCord: React.FC<PullCordProps> = ({ side, label, icon, y, onTrigger, isDark = true }) => {
    const [triggered, setTriggered] = useState(false);
    const glowOpacity = useTransform(y, [0, 100], [0, 1]);
    const iconRotation = useTransform(y, [0, 150], [0, 180]);
    const haloColor = useTransform(y, [0, 150], !isDark ? ["rgba(251, 191, 36, 0)", "rgba(245, 158, 11, 0.8)"] : ["rgba(255, 255, 255, 0)", "rgba(147, 197, 253, 0.8)"]);
    const particles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({ id: i, initialX: Math.cos(i * 30 * Math.PI / 180) * (20 + Math.random() * 15), initialY: Math.sin(i * 30 * Math.PI / 180) * (20 + Math.random() * 15), size: Math.random() * 2 + 1 })), []);

    const handleDragEnd = (_: any, info: PanInfo) => { if (info.offset.y > 80) { setTriggered(true); onTrigger(); if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50); setTimeout(() => setTriggered(false), 300); } };
    const height = useTransform(y, (latest: number) => 100 + Math.max(0, latest));
    const ropeColor = useTransform(y, [0, 150], isDark ? ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)"] : ["rgba(0,0,0,0.2)", "rgba(0,0,0,0.6)"]);

    return (
        <div className={cn("absolute top-0 z-50 flex flex-col items-center pointer-events-auto", side === 'left' ? 'left-8 md:left-16' : 'right-8 md:right-16')}>
            <motion.div style={{ height, backgroundColor: ropeColor }} className="absolute top-0 w-[1px] origin-top z-0" />
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 150 }} dragElastic={0.2} dragSnapToOrigin={true} onDragEnd={handleDragEnd} style={{ y }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-grab active:cursor-grabbing relative z-10 mt-[100px] group">
                {(side === 'right' || triggered) && particles.map((p) => <RopeParticle key={p.id} y={y} p={p} side={side} isDark={isDark} />)}
                <motion.div className={cn("w-10 h-14 rounded-full border backdrop-blur-md flex flex-col items-center justify-center shadow-lg transition-all duration-500 relative overflow-hidden", triggered ? "scale-110" : "", isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/5")} style={{ boxShadow: side === 'left' ? useTransform(haloColor, (c) => `0 0 20px ${c}`) : (triggered ? (isDark ? "0 0 30px rgba(251,191,36,0.6)" : "0 0 30px rgba(244,114,182,0.6)") : undefined) }}>
                    <motion.div style={{ opacity: glowOpacity }} className={cn("absolute inset-0 z-0 bg-gradient-to-t opacity-0 transition-opacity", side === 'right' ? (isDark ? "from-amber-200/20" : "from-pink-400/20") : (!isDark ? "from-red-500/20" : "from-blue-400/20"))} />
                    <div className={cn("absolute -top-1 w-[1px] h-2 opacity-50 z-10", isDark ? "bg-white" : "bg-slate-500")} />
                    <motion.div className={cn("transition-colors duration-500 z-10", isDark ? "text-white/80" : "text-slate-700")} style={{ rotate: side === 'left' ? iconRotation : 0 }}>
                        {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 1.5 })}
                    </motion.div>
                </motion.div>
                <motion.div style={{ opacity: glowOpacity, y: useTransform(y, [0, 50], [-10, 10]) }} className={cn("absolute top-full mt-3 px-3 py-1 text-[10px] font-medium rounded-full whitespace-nowrap backdrop-blur-md pointer-events-none border tracking-widest uppercase transition-all duration-300", side === 'left' ? '-left-4' : '-right-4', isDark ? "bg-black/40 text-amber-100 border-amber-500/30" : "bg-white/80 text-cyan-700 border-cyan-200")}>
                    {label}
                </motion.div>
            </motion.div>
        </div>
    );
};

const ArtworkCard: React.FC<{ data: Photo; isActive: boolean; isNight: boolean; onMaximize?: () => void; onTagClick?: (tag: string) => void }> = ({ data, isActive, isNight, onMaximize, onTagClick }) => {
    const [showInfo, setShowInfo] = useState(false);
    const x = useMotionValue(0); const y = useMotionValue(0);
    const rotateX = useTransform(y, [-200, 200], [10, -10]);
    const rotateY = useTransform(x, [-200, 200], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) { const rect = event.currentTarget.getBoundingClientRect(); x.set(event.clientX - rect.left - rect.width / 2); y.set(event.clientY - rect.top - rect.height / 2); }

    return (
        <motion.div className={cn("relative w-[300px] h-[500px] md:w-[360px] md:h-[600px] rounded-[24px] cursor-pointer perspective-1200", isActive ? "z-20" : "z-10 pointer-events-none opacity-50 scale-90")} style={{ perspective: 1200 }} animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.5 }} transition={{ duration: 0.6 }} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); setShowInfo(false); }} onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}>
            <motion.div style={{ rotateX: isActive ? rotateX : 0, rotateY: isActive ? rotateY : 0, transformStyle: "preserve-3d" }} className={cn("w-full h-full relative rounded-[24px] overflow-hidden transition-shadow duration-300", isNight ? "shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)] border-white/10" : "shadow-2xl border-white/40")}>
                <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover scale-110" />
                <div className={cn("absolute inset-0 transition-opacity duration-500", isNight ? "bg-gradient-to-br from-blue-500/10 to-purple-500/20 mix-blend-overlay" : "bg-gradient-to-br from-white/40 to-transparent")} />
                <motion.div className="absolute inset-0 z-30 p-8 flex flex-col justify-between bg-black/40 backdrop-blur-md transition-all duration-300" animate={{ opacity: showInfo ? 1 : 0 }}>
                    <div style={{ transform: "translateZ(30px)" }}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] tracking-widest text-white/80">{data.date}</span>
                            {onMaximize && <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="text-white hover:scale-110"><Maximize2 size={16} /></button>}
                        </div>
                        <h2 className="text-2xl font-light text-white mb-1">{data.title}</h2>
                        {data.enTitle && <h3 className="text-sm italic text-white/60">{data.enTitle}</h3>}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const HeartRipple = ({ x, y, id, onComplete }: { x: number; y: number; id: number; onComplete: (id: number) => void }) => (
    <motion.div initial={{ opacity: 1, scale: 0, y: 0 }} animate={{ opacity: 0, scale: 1.5, y: -100 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} onAnimationComplete={() => onComplete(id)} style={{ left: x, top: y }} className="absolute z-50 pointer-events-none text-pink-500/60">
        <Heart fill="currentColor" size={24} />
    </motion.div>
);

// 详情视图 (重构：改为单页应用模式)
const AppContent: React.FC = () => {
    const [isNight, setIsNight] = useState(false);
    const [showEffects, setShowEffects] = useState(false);
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [settings, setSettings] = useState<{ easter_egg_message?: string; music_playlist?: any[] }>({});
    const [loading, setLoading] = useState(true);

    const [lightboxItem, setLightboxItem] = useState<Photo | null>(null);
    const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

    const leftY = useMotionValue(0);
    const rightY = useMotionValue(0);
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);

    // 🔮 彩蛋状态
    const [easterEggActive, setEasterEggActive] = useState(false);
    const avatarClickCount = React.useRef(0);
    const avatarClickTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // 处理头像点击（彩蛋触发）
    const handleAvatarClick = () => {
        avatarClickCount.current += 1;
        if (avatarClickCount.current >= 5) {
            setEasterEggActive(true);
            avatarClickCount.current = 0;
        }

        // 重置计时器：2秒内没有继续点击就重置计数
        if (avatarClickTimer.current) {
            clearTimeout(avatarClickTimer.current);
        }
        avatarClickTimer.current = setTimeout(() => {
            avatarClickCount.current = 0;
        }, 2000);
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                // 并行加载所有数据
                const [pData, phData, tlData, settingsData] = await Promise.all([
                    api.getProfile().catch(() => null), // 允许 Profile 失败
                    api.getPhotos(),
                    api.getTimeline(),
                    api.getSettings()
                ]);

                if (pData) setProfile(pData);
                setPhotos(phData);
                setTimeline(tlData);
                setSettings(settingsData);
            } catch (err) {
                console.error("加载失败:", err);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, []);

    const addHeart = (e: React.MouseEvent) => {
        const newHeart = { id: Date.now(), x: e.clientX - 12, y: e.clientY - 12 };
        setHearts(prev => [...prev, newHeart]);
    };
    const removeHeart = (id: number) => setHearts(prev => prev.filter(h => h.id !== id));

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#050508] text-white"><div className="animate-pulse tracking-widest text-xs uppercase">Loading...</div></div>;

    // 默认情侣信息（如果没有获取到）
    const displayProfile = profile || {
        id: 1,
        name1: "他",
        name2: "她",
        avatar1: "",
        avatar2: "",
        together_date: "2024-01-01",
        together_days: 100,
        site_title: "我们的故事",
        bio: "Waiting for you..."
    };

    // 处理开幕函数：拉开帷幕并触发礼花
    const handleOpenCurtain = () => {
        setCurtainOpen(true);
        setShowConfetti(true); // 触发礼花
        // 礼花放完后自动消失
        setTimeout(() => setShowConfetti(false), 3000);
    };

    return (
        <div
            className={cn("min-h-screen transition-colors duration-1000 cursor-auto relative overflow-hidden", isNight ? "bg-[#050508]" : "bg-[#f0f4f8]")}
            style={{ cursor: isNight ? TORCH_CURSOR : BIRD_CURSOR }}
            onClick={addHeart}
        >
            <SoundManager isNight={isNight} curtainOpen={curtainOpen} />
            <SpotlightOverlay isNight={isNight} />

            {/* 盛大开幕：礼花 + 帷幕 */}
            <SideBlownConfetti isActive={showConfetti} />
            <LuxuriousCurtain isOpen={curtainOpen} onOpen={handleOpenCurtain} isNight={isNight} />

            <AnimatePresence>{hearts.map(h => <HeartRipple key={h.id} id={h.id} x={h.x} y={h.y} onComplete={removeHeart} />)}</AnimatePresence>

            {isNight ? <Fireflies isActive={showEffects} /> : <SakuraRainPro isActive={showEffects} />}

            {/* 拉绳控制 */}
            <PullCord side="left" label={isNight ? "开灯" : "关灯"} icon={isNight ? <Sun /> : <Moon />} y={leftY} onTrigger={() => setIsNight(!isNight)} isDark={isNight} />
            <PullCord side="right" label={isNight ? "流萤" : "落英"} icon={isNight ? <Sparkles className={showEffects ? "text-amber-400" : ""} /> : <Flower className={showEffects ? "text-pink-400" : ""} />} y={rightY} onTrigger={() => setShowEffects(!showEffects)} isDark={isNight} />

            {/* 核心内容区 */}
            <main className="relative z-20 pb-20">
                {/* 1. 情侣头部信息 */}
                <CoupleHeader profile={displayProfile} isNight={isNight} onAvatarClick={handleAvatarClick} />

                {/* 随机回忆按钮 */}
                <div className="flex justify-center py-6">
                    <RandomMemory photos={photos} timeline={timeline} isNight={isNight} />
                </div>

                {/* 2. 照片画廊 (3D 轮播) */}
                {photos.length > 0 && (
                    <div className="py-20 flex flex-col items-center justify-center relative min-h-[700px]">
                        <div className="w-full max-w-5xl h-[600px] flex items-center justify-center relative pointer-events-auto">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((currentPhotoIdx - 1 + photos.length) % photos.length); }} className={cn("absolute left-4 z-30 p-3 rounded-full backdrop-blur border transition-all hover:scale-110", isNight ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-black/5")}><ChevronLeft /></button>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentPhotoIdx((currentPhotoIdx + 1) % photos.length); }} className={cn("absolute right-4 z-30 p-3 rounded-full backdrop-blur border transition-all hover:scale-110", isNight ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-black/5")}><ChevronRight /></button>

                            <AnimatePresence mode='wait'>
                                <motion.div key={currentPhotoIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
                                    <ArtworkCard data={photos[currentPhotoIdx]} isActive={true} isNight={isNight} onMaximize={() => setLightboxItem(photos[currentPhotoIdx])} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* 指示点 */}
                        <div className="flex gap-2 mt-8">
                            {photos.map((_, i) => <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentPhotoIdx ? (isNight ? "w-8 bg-white" : "w-8 bg-slate-800") : (isNight ? "w-1 bg-white/20" : "w-1 bg-slate-800/20"))} />)}
                        </div>
                    </div>
                )}

                {/* 3. 时间轴 */}
                {timeline.length > 0 && (
                    <Timeline events={timeline} isNight={isNight} />
                )}
            </main>

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

            {/* 🌸 樱花背景雨 (Pro版) */}
            <SakuraRainPro isActive={easterEggActive} />

            {/* 🎵 音乐播放器 */}
            <MusicPlayer
                isNight={isNight}
                playlist={settings.music_playlist}
            />

            {/* 💌 留言信箱 */}
            <Mailbox isNight={isNight} />

            {/* 🔮 樱花彩蛋 */}
            <RoseEasterEgg
                isActive={easterEggActive}
                onClose={() => setEasterEggActive(false)}
                message={settings.easter_egg_message || "我永远爱你 ❤️"}
            />
        </div>
    );
};

// 错误边界
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() { if (this.state.hasError) return <div className="text-white p-10 text-center">Something went wrong.</div>; return this.props.children; }
}

export default function App() {
    return (
        <>
            <ErrorBoundary>
                <AppContent />
            </ErrorBoundary>
            <Analytics />
        </>
    );
}
