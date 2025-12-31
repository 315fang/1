import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Lightbox from './components/Lightbox';
import CoupleHeader from './components/CoupleHeader';
import Timeline from './components/Timeline';
import { api } from './services/api';
import { Photo, Profile, TimelineEvent } from './types';

// --- 1. 工具函数 ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- 2. 资源定义 (鼠标图标 SVG) ---
const BIRD_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M8.2 6.5a4.2 4.2 0 0 1 7.6 0"/></svg>') 16 16, auto`;

const TORCH_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4 10 20"/><path d="m11 12-2 3"/><path d="m13 12 2 3"/><path d="M8.2 6.5a4.2 4.2 0 0 1 7.6 0"/><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/></svg>') 16 16, auto`;

// 🔊 音效管理器 (SoundManager)
const SoundManager = ({ isNight, curtainOpen }: { isNight: boolean, curtainOpen: boolean }) => {
    useEffect(() => {
        // console.log(isNight ? "🔊 播放: 虫鸣与篝火" : "🔊 播放: 鸟鸣与微风");
    }, [isNight]);

    useEffect(() => {
        // if (curtainOpen) console.log("🔊 播放: 帷幕拉开声");
    }, [curtainOpen]);

    return null;
};

// --- 3. 组件定义 ---

// 🎭 戏剧帷幕 (TheatricalCurtain)
// 替换原有的 TheatricalCurtain 组件
const TheatricalCurtain = ({ isOpen, onOpen, isNight }: { isOpen: boolean; onOpen: () => void; isNight: boolean }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 探照灯效果：鼠标移动更新坐标
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // 动态背景：基于鼠标位置的径向渐变
    const maskImage = useMotionTemplate`radial-gradient(circle 150px at ${mouseX}px ${mouseY}px, transparent 0%, black 100%)`;

    return (
        <motion.div
            className="absolute inset-0 z-[999] flex overflow-hidden cursor-pointer"
            onClick={onOpen} // 点击任意位置打开
            initial={false}
            style={{ pointerEvents: isOpen ? 'none' : 'auto' }} // 打开后穿透点击
        >
            {/* 左侧帷幕 */}
            <motion.div
                className={cn("h-full relative shadow-2xl origin-left", isNight ? "bg-zinc-900" : "bg-red-900")}
                animate={{ width: isOpen ? "0%" : "50%" }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    backgroundImage: isNight
                        ? 'linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)'
                        : 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)'
                }}
            >
                {/* 纹理噪点 */}
                <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.3)_25px,transparent_30px)]" />
                
                {/* 💡 高级感核心：探照灯遮罩层 (鼠标移动时稍微变亮/透视) */}
                <motion.div 
                    className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300"
                    style={{ maskImage: maskImage, WebkitMaskImage: maskImage }}
                />
            </motion.div>

            {/* 右侧帷幕 */}
            <motion.div
                className={cn("h-full relative shadow-2xl origin-right", isNight ? "bg-zinc-900" : "bg-red-900")}
                animate={{ width: isOpen ? "0%" : "50%" }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    backgroundImage: isNight
                        ? 'linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)'
                        : 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.3)_25px,transparent_30px)]" />
                 <motion.div 
                    className="absolute inset-0 bg-black/40 pointer-events-none"
                    style={{ maskImage: maskImage, WebkitMaskImage: maskImage }}
                />
            </motion.div>

            {/* 提示文字 (不再是按钮，而是浮在底部的微弱提示) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-20 w-full text-center text-white/50 text-sm tracking-[0.5em] uppercase font-light pointer-events-none mix-blend-plus-lighter"
                    >
                        Click anywhere to start
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// 用于背景特效的组件
const SakuraItem = ({ p }: { p: any }) => (
    <motion.div
        className="absolute bg-pink-300/60 rounded-full pointer-events-none"
        initial={{ y: -50, x: p.initialX, rotate: 0, opacity: 0 }}
        animate={{ y: "100vh", x: p.initialX + (Math.random() * 100 - 50), rotate: 360, opacity: [0, 0.8, 0] }}
        transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
        style={{ width: p.size, height: p.size, borderRadius: "50% 0 50% 0" }}
    />
);

const SakuraRain = ({ isActive }: { isActive: boolean }) => {
    const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({ id: i, initialX: Math.random() * window.innerWidth, size: Math.random() * 8 + 4, duration: Math.random() * 5 + 5, delay: Math.random() * 5 })), []);
    if (!isActive) return null;
    return <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">{particles.map((p) => <SakuraItem key={p.id} p={p} />)}</div>;
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

    const [profile, setProfile] = useState<Profile | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [lightboxItem, setLightboxItem] = useState<Photo | null>(null);
    const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

    const leftY = useMotionValue(0);
    const rightY = useMotionValue(0);
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);

    useEffect(() => {
        const loadAll = async () => {
            try {
                // 并行加载所有数据
                const [pData, phData, tlData] = await Promise.all([
                    api.getProfile().catch(() => null), // 允许 Profile 失败
                    api.getPhotos(),
                    api.getTimeline()
                ]);

                if (pData) setProfile(pData);
                setPhotos(phData);
                setTimeline(tlData);
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

    return (
        <div
            className={cn("min-h-screen transition-colors duration-1000 cursor-auto relative overflow-hidden", isNight ? "bg-[#050508]" : "bg-[#f0f4f8]")}
            style={{ cursor: isNight ? TORCH_CURSOR : BIRD_CURSOR }}
            onClick={addHeart}
        >
            <SoundManager isNight={isNight} curtainOpen={curtainOpen} />
            <SpotlightOverlay isNight={isNight} />

            <TheatricalCurtain isOpen={curtainOpen} onOpen={() => setCurtainOpen(true)} isNight={isNight} />

            <AnimatePresence>{hearts.map(h => <HeartRipple key={h.id} id={h.id} x={h.x} y={h.y} onComplete={removeHeart} />)}</AnimatePresence>

            {isNight ? <Fireflies isActive={showEffects} /> : <SakuraRain isActive={showEffects} />}

            {/* 拉绳控制 */}
            <PullCord side="left" label={isNight ? "开灯" : "关灯"} icon={isNight ? <Sun /> : <Moon />} y={leftY} onTrigger={() => setIsNight(!isNight)} isDark={isNight} />
            <PullCord side="right" label={isNight ? "流萤" : "落英"} icon={isNight ? <Sparkles className={showEffects ? "text-amber-400" : ""} /> : <Flower className={showEffects ? "text-pink-400" : ""} />} y={rightY} onTrigger={() => setShowEffects(!showEffects)} isDark={isNight} />

            {/* 核心内容区 */}
            <main className="relative z-20 pb-20">
                {/* 1. 情侣头部信息 */}
                <CoupleHeader profile={displayProfile} isNight={isNight} />

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
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}
