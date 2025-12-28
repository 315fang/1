import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useTransform, useMotionValue, AnimatePresence, useMotionTemplate, PanInfo } from 'framer-motion';
import { Sun, Moon, Sparkles, ChevronLeft, ChevronRight, ArrowLeft, Maximize2, User, Mail, Instagram, Heart, Flower } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Lightbox from './components/Lightbox';

// --- 1. 工具函数 ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- 2. 资源定义 (鼠标图标 SVG) ---
// 为了方便，直接使用 Base64 SVG
const BIRD_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M8.2 6.5a4.2 4.2 0 0 1 7.6 0"/></svg>') 16 16, auto`;

const TORCH_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4 10 20"/><path d="m11 12-2 3"/><path d="m13 12 2 3"/><path d="M8.2 6.5a4.2 4.2 0 0 1 7.6 0"/><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/></svg>') 16 16, auto`;

// --- 3. 类型定义 ---
interface Artwork {
    id: number;
    title: string;
    enTitle: string;
    imageUrl: string;
    author: string;
    date: string;
    description: string;
    tags: string[];
}

// --- 4. 创意组件群 ---

// 🔊 音效管理器 (SoundManager)
const SoundManager = ({ isNight, curtainOpen }: { isNight: boolean, curtainOpen: boolean }) => {
    // 这里预留音效播放逻辑。实际项目中可以使用 useSound 或 <audio> 标签
    // 模拟：console.log 代替播放
    useEffect(() => {
        console.log(isNight ? "🔊 播放: 虫鸣与篝火 (Night Ambience)" : "🔊 播放: 鸟鸣与微风 (Day Ambience)");
    }, [isNight]);

    useEffect(() => {
        if (curtainOpen) console.log("🔊 播放: 帷幕拉开声 (Curtain Whoosh)");
    }, [curtainOpen]);

    return null; // 不渲染 UI
};

// 🎭 戏剧帷幕 (TheatricalCurtain)
const TheatricalCurtain = ({ isOpen, onOpen, isNight }: { isOpen: boolean; onOpen: () => void; isNight: boolean }) => {
    return (
        <motion.div 
            className="absolute inset-0 z-40 pointer-events-none flex"
            initial={false}
        >
            {/* 左帷幕 */}
            <motion.div 
                className={cn("h-full bg-cover relative shadow-2xl origin-left", isNight ? "bg-zinc-900" : "bg-red-900")}
                animate={{ width: isOpen ? "0%" : "50%" }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ 
                    backgroundImage: isNight 
                        ? 'linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)' // 黑夜：深灰丝绒
                        : 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)' // 白天：红丝绒
                }}
            >
                {/* 褶皱纹理 */}
                <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.3)_25px,transparent_30px)]" />
            </motion.div>

            {/* 右帷幕 */}
            <motion.div 
                className={cn("h-full bg-cover relative shadow-2xl origin-right", isNight ? "bg-zinc-900" : "bg-red-900")}
                animate={{ width: isOpen ? "0%" : "50%" }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ 
                    backgroundImage: isNight 
                        ? 'linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)'
                        : 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(0,0,0,0.3)_25px,transparent_30px)]" />
            </motion.div>

            {/* 中间拉绳 (交互点) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto cursor-pointer flex flex-col items-center gap-2 group"
                        onClick={onOpen}
                    >
                        <div className={cn("w-16 h-16 rounded-full border-2 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110", isNight ? "border-amber-500/50 bg-black/40 text-amber-500" : "border-gold-500/50 bg-white/20 text-white")}>
                            <span className="text-xs font-serif tracking-widest uppercase">Open</span>
                        </div>
                        <span className="text-[10px] text-white/50 tracking-[0.2em] uppercase group-hover:tracking-[0.4em] transition-all">Click to Reveal</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// 🌸 白天落英粒子 (Sakura) - 向下飘落
const SakuraItem = ({ p }: { p: any }) => {
    return (
        <motion.div
            className="absolute bg-pink-300/60 rounded-full pointer-events-none"
            initial={{ y: -50, x: p.initialX, rotate: 0, opacity: 0 }}
            animate={{ 
                y: "100vh", 
                x: p.initialX + (Math.random() * 100 - 50), 
                rotate: 360, 
                opacity: [0, 0.8, 0] 
            }}
            transition={{ 
                duration: p.duration, 
                repeat: Infinity, 
                ease: "linear", 
                delay: p.delay 
            }}
            style={{
                width: p.size,
                height: p.size,
                borderRadius: "50% 0 50% 0", // 花瓣形状
            }}
        />
    );
};

const SakuraRain = ({ isActive }: { isActive: boolean }) => {
    const particles = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i, 
        initialX: Math.random() * window.innerWidth, // 随机横坐标
        size: Math.random() * 8 + 4, 
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5
    })), []);

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {particles.map((p) => <SakuraItem key={p.id} p={p} />)}
        </div>
    );
};

// 🌟 黑夜流萤粒子 (Fireflies) - 向上漂浮 (保留原版)
const FireflyItem = ({ p }: { p: any }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
            opacity: [0, 0.8, 0.2, 0.8, 0], 
            scale: [0, 1, 0.8, 1.2, 0], 
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50], 
            y: [0, Math.random() * -100 - 50, Math.random() * -100] 
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
        style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
        className="absolute rounded-full blur-[1px] bg-amber-200 shadow-[0_0_8px_gold]"
    />
);

const Fireflies = ({ isActive }: { isActive: boolean }) => {
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i, left: Math.random() * 100, top: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 10 + 10
    })), []);
    
    if (!isActive) return null;
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <AnimatePresence>
                {particles.map(p => <FireflyItem key={p.id} p={p} />)}
             </AnimatePresence>
        </div>
    );
};

// 🔦 探照灯层
const SpotlightOverlay = ({ isNight }: { isNight: boolean }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
            mouseX.set(clientX);
            mouseY.set(clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const background = useMotionTemplate`radial-gradient(circle 250px at ${mouseX}px ${mouseY}px, rgba(0,0,0,0) 0%, rgba(5,5,8,0.6) 30%, rgba(5,5,8,0.98) 60%)`;

    return (
        <motion.div
            className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-1000"
            style={{ background: background, opacity: isNight ? 1 : 0 }}
        />
    );
};

// 绳子上的粒子
const RopeParticle = ({ y, p, side, isDark }: { y: any, p: any, side: string, isDark: boolean }) => {
    const x = useTransform(y, [0, 120], [p.initialX, 0]);
    const currentY = useTransform(y, [0, 120], [p.initialY, 0]);
    const opacity = useTransform(y, [0, 20, 120], [0, 1, 0.5]); 

    return (
        <motion.div
            className={cn(
                "absolute rounded-full pointer-events-none transition-colors duration-300",
                side === 'right' 
                    ? (isDark ? "bg-amber-200 shadow-[0_0_2px_gold]" : "bg-pink-300") // 晚萤火/昼落花
                    : "bg-white"
            )}
            style={{
                width: p.size,
                height: p.size,
                x: x, y: currentY, opacity: opacity, top: '50%', left: '50%', marginTop: -p.size/2, marginLeft: -p.size/2, position: 'absolute',
                borderRadius: (!isDark && side === 'right') ? "50% 0 50% 0" : "50%" // 白天右侧变花瓣形状
            }}
        />
    );
};

// 物理拉绳
interface PullCordProps {
    side: 'left' | 'right';
    label: string;
    icon: React.ReactNode;
    y: any; 
    onTrigger: () => void;
    isDark?: boolean;
}

const PullCord: React.FC<PullCordProps> = ({ side, label, icon, y, onTrigger, isDark = true }) => {
    const [triggered, setTriggered] = useState(false);
    const glowOpacity = useTransform(y, [0, 100], [0, 1]);
    const iconRotation = useTransform(y, [0, 150], [0, 180]);
    // 左侧日落/破晓光晕
    const haloColor = useTransform(y, [0, 150], !isDark ? ["rgba(251, 191, 36, 0)", "rgba(245, 158, 11, 0.8)"] : ["rgba(255, 255, 255, 0)", "rgba(147, 197, 253, 0.8)"]);

    const particles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
        id: i, initialX: Math.cos(i*30*Math.PI/180)*(20+Math.random()*15), initialY: Math.sin(i*30*Math.PI/180)*(20+Math.random()*15), size: Math.random()*2+1
    })), []);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 80) {
            setTriggered(true); onTrigger();
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
            setTimeout(() => setTriggered(false), 300);
        }
    };

    const height = useTransform(y, (latest: number) => 100 + Math.max(0, latest));
    const ropeColor = useTransform(y, [0, 150], isDark ? ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)"] : ["rgba(0,0,0,0.2)", "rgba(0,0,0,0.6)"]);

    return (
        <div className={cn("absolute top-0 z-50 flex flex-col items-center pointer-events-auto", side === 'left' ? 'left-8 md:left-16' : 'right-8 md:right-16')}>
            <motion.div style={{ height, backgroundColor: ropeColor }} className="absolute top-0 w-[1px] origin-top z-0" />
            <motion.div
                drag="y" dragConstraints={{ top: 0, bottom: 150 }} dragElastic={0.2} dragSnapToOrigin={true} onDragEnd={handleDragEnd} style={{ y }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="cursor-grab active:cursor-grabbing relative z-10 mt-[100px] group"
            >
                {(side === 'right' || triggered) && particles.map((p) => <RopeParticle key={p.id} y={y} p={p} side={side} isDark={isDark} />)}
                <motion.div
                    className={cn("w-10 h-14 rounded-full border backdrop-blur-md flex flex-col items-center justify-center shadow-lg transition-all duration-500 relative overflow-hidden", triggered ? "scale-110" : "", isDark ? "bg-black/40 border-white/20" : "bg-white/60 border-black/5")}
                    style={{ 
                        boxShadow: side === 'left' 
                            ? useTransform(haloColor, (c) => `0 0 20px ${c}`) 
                            : (triggered ? (isDark ? "0 0 30px rgba(251,191,36,0.6)" : "0 0 30px rgba(244,114,182,0.6)") : undefined)
                    }}
                >
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

// 3D 艺术卡片 (包含内容)
const ArtworkCard: React.FC<{ data: Artwork; isActive: boolean; isNight: boolean; onMaximize?: () => void; onTagClick?: (tag: string) => void }> = ({ data, isActive, isNight, onMaximize, onTagClick }) => {
    const [showInfo, setShowInfo] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-200, 200], [10, -10]);
    const rotateY = useTransform(x, [-200, 200], [-10, 10]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
    }

    return (
        <motion.div
            className={cn("relative w-[300px] h-[500px] md:w-[360px] md:h-[600px] rounded-[24px] cursor-pointer perspective-1200", isActive ? "z-20" : "z-10 pointer-events-none opacity-50 scale-90")}
            style={{ perspective: 1200 }}
            animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.5 }}
            transition={{ duration: 0.6 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); setShowInfo(false); }}
            onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
        >
            <motion.div
                style={{ rotateX: isActive ? rotateX : 0, rotateY: isActive ? rotateY : 0, transformStyle: "preserve-3d" }}
                className={cn("w-full h-full relative rounded-[24px] overflow-hidden transition-shadow duration-300", isNight ? "shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)] border-white/10" : "shadow-2xl border-white/40")}
            >
                <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover scale-110" />
                <div className={cn("absolute inset-0 transition-opacity duration-500", isNight ? "bg-gradient-to-br from-blue-500/10 to-purple-500/20 mix-blend-overlay" : "bg-gradient-to-br from-white/40 to-transparent")} />
                <motion.div className="absolute inset-0 z-30 p-8 flex flex-col justify-between bg-black/40 backdrop-blur-md transition-all duration-300" animate={{ opacity: showInfo ? 1 : 0 }}>
                    <div style={{ transform: "translateZ(30px)" }}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] tracking-widest text-white/80">{data.date}</span>
                            {onMaximize && <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="text-white hover:scale-110"><Maximize2 size={16} /></button>}
                        </div>
                        <h2 className="text-2xl font-light text-white mb-1">{data.title}</h2>
                        <h3 className="text-sm italic text-white/60">{data.enTitle}</h3>
                    </div>
                    <div style={{ transform: "translateZ(30px)" }}>
                        <p className="text-sm text-white/80 font-light mb-4 line-clamp-4">{data.description}</p>
                        <div className="flex gap-2">
                             {data.tags.map(tag => <span key={tag} onClick={(e) => {e.stopPropagation(); onTagClick?.(tag)}} className="px-2 py-1 bg-white/10 rounded text-[10px] text-white hover:bg-white/20 transition-colors">#{tag}</span>)}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// 心动粒子
const HeartRipple = ({ x, y, id, onComplete }: { x: number; y: number; id: number; onComplete: (id: number) => void }) => (
    <motion.div
        initial={{ opacity: 1, scale: 0, y: 0 }}
        animate={{ opacity: 0, scale: 1.5, y: -100 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onAnimationComplete={() => onComplete(id)}
        style={{ left: x, top: y }}
        className="absolute z-50 pointer-events-none text-pink-500/60"
    >
        <Heart fill="currentColor" size={24} />
    </motion.div>
);

// 详情视图 (重构)
const DetailView: React.FC<{ 
    artworks: Artwork[]; idx: number; setIdx: (i: number) => void; isNight: boolean; toggleNight: () => void; onBack: () => void; onTagSelect: (t: string) => void;
}> = ({ artworks, idx, setIdx, isNight, toggleNight, onBack, onTagSelect }) => {
    const [showEffects, setShowEffects] = useState(false); // 控制流萤或落英
    const [lightboxItem, setLightboxItem] = useState<Artwork | null>(null);
    const [curtainOpen, setCurtainOpen] = useState(false); // 帷幕状态
    const leftY = useMotionValue(0);
    const rightY = useMotionValue(0);
    const [hearts, setHearts] = useState<{id: number, x: number, y: number}[]>([]);

    const addHeart = (e: React.MouseEvent) => {
        const newHeart = { id: Date.now(), x: e.clientX - 12, y: e.clientY - 12 };
        setHearts(prev => [...prev, newHeart]);
    };
    const removeHeart = (id: number) => setHearts(prev => prev.filter(h => h.id !== id));

    // 每次进入详情页，重置帷幕关闭
    useEffect(() => { setCurtainOpen(false); }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            // 动态切换鼠标光标
            className={cn("fixed inset-0 z-50 overflow-hidden transition-colors duration-1000 cursor-auto", isNight ? "bg-[#050508]" : "bg-[#f0f4f8]")}
            style={{ cursor: isNight ? TORCH_CURSOR : BIRD_CURSOR }}
            onClick={addHeart}
        >
            <SoundManager isNight={isNight} curtainOpen={curtainOpen} />
            <SpotlightOverlay isNight={isNight} />
            
            {/* 帷幕层：覆盖在最上面 */}
            <TheatricalCurtain isOpen={curtainOpen} onOpen={() => setCurtainOpen(true)} isNight={isNight} />

            <AnimatePresence>{hearts.map(h => <HeartRipple key={h.id} id={h.id} x={h.x} y={h.y} onComplete={removeHeart} />)}</AnimatePresence>

            {/* 根据模式显示不同特效：黑夜-流萤，白天-落英 */}
            {isNight ? <Fireflies isActive={showEffects} /> : <SakuraRain isActive={showEffects} />}

            <PullCord side="left" label={isNight ? "开灯" : "关灯"} icon={isNight ? <Sun /> : <Moon />} y={leftY} onTrigger={toggleNight} isDark={isNight} />
            
            {/* 右侧绳子：黑夜流萤 / 白天落英 */}
            <PullCord 
                side="right" 
                label={isNight ? "流萤" : "落英"} 
                icon={isNight ? <Sparkles className={showEffects ? "text-amber-400" : ""} /> : <Flower className={showEffects ? "text-pink-400" : ""} />} 
                y={rightY} 
                onTrigger={() => setShowEffects(!showEffects)} 
                isDark={isNight} 
            />
            
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className={cn("absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur border transition-colors", isNight ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white/60 border-black/10 text-black hover:bg-white/80")}>
                <ArrowLeft size={16} /> <span className="text-xs tracking-widest uppercase">Back</span>
            </button>

            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-full max-w-5xl h-[600px] flex items-center justify-center relative pointer-events-auto">
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + artworks.length) % artworks.length); }} className={cn("absolute left-4 z-30 p-3 rounded-full backdrop-blur border transition-all hover:scale-110", isNight ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-black/5")}><ChevronLeft /></button>
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % artworks.length); }} className={cn("absolute right-4 z-30 p-3 rounded-full backdrop-blur border transition-all hover:scale-110", isNight ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-black/5")}><ChevronRight /></button>
                    
                    <AnimatePresence mode='wait'>
                        <motion.div key={idx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
                            <ArtworkCard data={artworks[idx]} isActive={true} isNight={isNight} onMaximize={() => setLightboxItem(artworks[idx])} onTagClick={onTagSelect} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 z-20 pointer-events-none">
                {artworks.map((_, i) => <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === idx ? (isNight ? "w-8 bg-white" : "w-8 bg-slate-800") : (isNight ? "w-1 bg-white/20" : "w-1 bg-slate-800/20"))} />)}
            </div>

            <AnimatePresence>{lightboxItem && <Lightbox image={lightboxItem.imageUrl} title={lightboxItem.title} onClose={() => setLightboxItem(null)} />}</AnimatePresence>
        </motion.div>
    );
};

// 列表视图 (保留)
const GalleryList: React.FC<{ artworks: Artwork[]; isNight: boolean; onSelect: (idx: number) => void; activeTag?: string | null; onClearTag?: () => void }> = ({ artworks, isNight, onSelect, activeTag, onClearTag }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("min-h-screen w-full p-6 md:p-16 transition-colors duration-1000", isNight ? "bg-[#050508] text-white" : "bg-[#f0f4f8] text-slate-800")}>
        <div className="max-w-7xl mx-auto">
            <header className="mb-24 mt-12 flex flex-col items-start gap-6">
                <div className="flex items-center gap-3 opacity-60"><User size={16} /><span className="text-xs tracking-[0.3em] uppercase font-medium">Portfolio • 2025</span></div>
                <h1 className="text-5xl md:text-7xl font-extralight tracking-tight">五月糖 <span className="font-serif italic font-normal opacity-50 block md:inline md:ml-4 text-3xl md:text-5xl">Design & Art</span></h1>
                {activeTag && <div className="flex items-center gap-4"><span className="text-sm opacity-60">Filtering by:</span><button onClick={onClearTag} className="px-4 py-2 rounded-full border border-current/20 flex items-center gap-2 text-sm hover:bg-current/5">#{activeTag} <span className="opacity-50">✕</span></button></div>}
                <div className="flex gap-6 mt-2 opacity-60 text-sm"><span className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Mail size={16} /> 联系我</span><span className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Instagram size={16} /> Instagram</span></div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pb-32">
                {artworks.map((art, index) => (
                    <motion.div key={art.id} layoutId={`card-container-${art.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={cn("group cursor-pointer flex flex-col", "md:[&:nth-child(2n)]:mt-16", "lg:[&:nth-child(3n+2)]:mt-16")} onClick={() => onSelect(index)}>
                        <div className="aspect-[4/5] overflow-hidden rounded-lg mb-6 relative bg-gray-900 shadow-lg"><motion.img layoutId={`card-image-${art.id}`} src={art.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"><div className="p-3 rounded-full bg-white/10 backdrop-blur text-white border border-white/20"><Maximize2 size={20} /></div></div></div>
                        <h3 className="text-xl font-light group-hover:text-amber-500 transition-colors">{art.title}</h3><p className="text-xs opacity-40 mt-1">{art.date} • {art.tags[0]}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.div>
);

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { if (this.state.hasError) return <div className="text-white p-10 text-center">Something went wrong.</div>; return this.props.children; }
}

function AppContent() {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isNightMode, setIsNightMode] = useState(false);
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [artworks, setArtworks] = useState<Artwork[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const res = await fetch('/api/artworks', { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) setArtworks(data);
                }
            } catch (err) { console.error("API Error", err); } finally { setLoading(false); }
        }
        loadData();
    }, []);

    const filteredArtworks = useMemo(() => {
        if (!filterTag) return artworks;
        return artworks.filter(art => art.tags.includes(filterTag));
    }, [artworks, filterTag]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#050508] text-white"><div className="animate-pulse tracking-widest text-xs uppercase">Loading...</div></div>;
    if (artworks.length === 0) return <div className="flex h-screen items-center justify-center bg-[#050508] text-white/50 flex-col gap-4"><Sparkles className="animate-pulse" /><p className="text-xs tracking-widest uppercase">Waiting for inspiration...</p></div>;

    return (
        <AnimatePresence mode="wait">
            {view === 'list' ? (
                <GalleryList key="list" artworks={filteredArtworks} isNight={isNightMode} activeTag={filterTag} onClearTag={() => setFilterTag(null)} onSelect={(index) => {
                    const selectedArt = filteredArtworks[index];
                    const originalIndex = artworks.findIndex(a => a.id === selectedArt.id);
                    setCurrentIndex(originalIndex);
                    setView('detail');
                }} />
            ) : (
                <DetailView key="detail" artworks={artworks} idx={currentIndex} setIdx={setCurrentIndex} isNight={isNightMode} toggleNight={() => setIsNightMode(!isNightMode)} onBack={() => setView('list')} onTagSelect={(tag) => { setFilterTag(tag); setView('list'); }} />
            )}
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}
