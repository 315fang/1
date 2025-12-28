import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useTransform, useMotionValue, AnimatePresence, PanInfo } from 'framer-motion';
import { Sun, Moon, Sparkles, ChevronLeft, ChevronRight, ArrowLeft, Maximize2, User, Mail, Instagram, Heart } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Lightbox from './components/Lightbox';

// --- 1. 工具函数 ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- 2. 类型定义 ---
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

// --- 3. 创意交互组件 ---

// ✨ 新增：心动粒子 (点击屏幕产生爱心)
const HeartRipple = ({ x, y, id, onComplete }: { x: number; y: number; id: number; onComplete: (id: number) => void }) => {
    return (
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
};

// 4.1 物理拉绳 (PullCord) - 升级版：聚集交互 & 日月轮转

// --- 修复版：提取出的粒子子组件 ---
// 把 useTransform 放在这里是安全的，因为组件的挂载/卸载符合 React 规范
const ParticleItem = ({ y, p, side, isDark }: { y: any, p: any, side: string, isDark: boolean }) => {
    // 核心逻辑：使用 useTransform 动态计算位置
    const x = useTransform(y, [0, 120], [p.initialX, 0]);
    const currentY = useTransform(y, [0, 120], [p.initialY, 0]);
    const opacity = useTransform(y, [0, 20, 120], [0, 1, 0.5]); 

    return (
        <motion.div
            className={cn(
                "absolute rounded-full pointer-events-none transition-colors duration-300",
                side === 'right' 
                    ? (isDark ? "bg-amber-200 shadow-[0_0_2px_gold]" : "bg-emerald-400")
                    : "bg-white"
            )}
            style={{
                width: p.size,
                height: p.size,
                x: x, 
                y: currentY,
                opacity: opacity,
                top: '50%',
                left: '50%',
                marginTop: -p.size / 2,
                marginLeft: -p.size / 2,
                position: 'absolute',
            }}
        />
    );
};

interface PullCordProps {
    side: 'left' | 'right';
    label: string;
    icon: React.ReactNode;
    y: any; // 使用 any 以兼容 MotionValue 类型
    onTrigger: () => void;
    isDark?: boolean;
}

const PullCord: React.FC<PullCordProps> = ({ side, label, icon, y, onTrigger, isDark = true }) => {
    const [triggered, setTriggered] = useState(false);
    
    // 基础光效透明度
    const glowOpacity = useTransform(y, [0, 100], [0, 1]);

    // --- ✨ 左侧创意：日月轮转 (Rotation) ---
    // 下拉时，图标旋转 180度，模拟星球转动
    const iconRotation = useTransform(y, [0, 150], [0, 180]);
    // 光晕颜色：如果是白天切黑夜(isDark=false)，显示日落金红；如果是黑夜切白天，显示晨曦白
    const haloColor = useTransform(
        y, 
        [0, 150], 
        !isDark 
            ? ["rgba(251, 191, 36, 0)", "rgba(245, 158, 11, 0.8)"] // 日落：金 -> 红
            : ["rgba(255, 255, 255, 0)", "rgba(147, 197, 253, 0.8)"] // 破晓：透 -> 蓝白
    );

    // --- ✨ 右侧创意：萤火虫聚集 (Gathering) ---
    // 生成随机的初始散开位置
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            // 初始位置在圆圈外围 (半径 20-35px)
            initialX: Math.cos(i * 30 * (Math.PI / 180)) * (20 + Math.random() * 15),
            initialY: Math.sin(i * 30 * (Math.PI / 180)) * (20 + Math.random() * 15),
            size: Math.random() * 2 + 1,
        }));
    }, []);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 80) {
            setTriggered(true);
            onTrigger();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
            setTimeout(() => setTriggered(false), 300);
        }
    };

    const height = useTransform(y, (latest: number) => 100 + Math.max(0, latest));
    const ropeColor = useTransform(
        y,
        [0, 150],
        isDark ? ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)"] : ["rgba(0,0,0,0.2)", "rgba(0,0,0,0.6)"]
    );

    return (
        <div className={cn("absolute top-0 z-50 flex flex-col items-center pointer-events-auto",
            side === 'left' ? 'left-8 md:left-16' : 'right-8 md:right-16'
        )}>
            <motion.div
                style={{ height, backgroundColor: ropeColor }}
                className="absolute top-0 w-[1px] origin-top z-0"
            />

            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 150 }}
                dragElastic={0.2}
                dragSnapToOrigin={true}
                onDragEnd={handleDragEnd}
                style={{ y }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-grab active:cursor-grabbing relative z-10 mt-[100px] group"
            >
                {/* --- 修复点：使用子组件渲染粒子 --- */}
                {(side === 'right' || triggered) && particles.map((p) => (
                    <ParticleItem 
                        key={p.id} 
                        y={y} 
                        p={p} 
                        side={side} 
                        isDark={isDark} 
                    />
                ))}

                {/* --- 按钮主体 --- */}
                <motion.div
                    className={cn(
                        "w-10 h-14 rounded-full border border-white/20 backdrop-blur-md flex flex-col items-center justify-center shadow-lg transition-all duration-500 relative overflow-hidden",
                        triggered
                            ? "bg-amber-100/40 border-amber-200/50 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                            : (isDark ? "bg-black/40 hover:bg-white/10" : "bg-white/60 hover:bg-white/80 border-black/5")
                    )}
                    // 左侧(昼夜)添加日落/破晓光晕背景
                    style={{
                        boxShadow: side === 'left' ? useTransform(haloColor, (c) => `0 0 20px ${c}`) : undefined
                    }}
                >
                    {/* 内部高光流光 */}
                    <motion.div
                        style={{ opacity: glowOpacity }}
                        className={cn(
                            "absolute inset-0 z-0 bg-gradient-to-t opacity-0 transition-opacity",
                            side === 'right' 
                                ? (isDark ? "from-amber-200/20" : "from-emerald-400/20") // 右侧流萤色
                                : (!isDark ? "from-red-500/20" : "from-blue-400/20") // 左侧日落/破晓色
                        )}
                    />

                    <div className={cn("absolute -top-1 w-[1px] h-2 opacity-50 z-10", isDark ? "bg-white" : "bg-slate-500")} />
                    
                    {/* 图标容器：左侧会旋转 */}
                    <motion.div 
                        className={cn("transition-colors duration-500 z-10", isDark ? "text-white/80" : "text-slate-700")}
                        style={{ rotate: side === 'left' ? iconRotation : 0 }}
                    >
                        {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 1.5 })}
                    </motion.div>
                </motion.div>

                {/* --- 标签 (Label) --- */}
                <motion.div
                    style={{
                        opacity: glowOpacity,
                        y: useTransform(y, [0, 50], [-10, 10])
                    }}
                    className={cn(
                        "absolute top-full mt-3 px-3 py-1 text-[10px] font-medium rounded-full whitespace-nowrap backdrop-blur-md pointer-events-none border tracking-widest uppercase transition-all duration-300",
                        side === 'left' ? '-left-4' : '-right-4',
                        isDark
                            ? "bg-black/40 text-amber-100 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                            : "bg-white/80 text-cyan-700 border-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    )}
                >
                    {label}
                </motion.div>
            </motion.div>
        </div>
    );
};

// 流萤粒子
const Fireflies: React.FC<{ isActive: boolean; isDark: boolean }> = ({ isActive, isDark }) => {
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i, left: Math.random() * 100, top: Math.random() * 100, size: Math.random() * 4 + 2, duration: Math.random() * 10 + 10
    })), []);
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <AnimatePresence>
                {isActive && particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 0.8, 0.2, 0.8, 0], scale: [0, 1, 0.8, 1.2, 0], x: [0, Math.random() * 100 - 50], y: [0, Math.random() * -100] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
                        style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
                        className={cn("absolute rounded-full blur-[1px]", isDark ? "bg-amber-200 shadow-[0_0_8px_gold]" : "bg-emerald-400")}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// 3D 艺术卡片
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
            className={cn("relative w-[300px] h-[500px] md:w-[360px] md:h-[600px] rounded-[24px] cursor-pointer perspective-1200", isActive ? "z-30" : "z-10 pointer-events-none opacity-50 scale-90")}
            style={{ perspective: 1200 }}
            animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.5 }}
            transition={{ duration: 0.6 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); setShowInfo(false); }}
            onClick={(e) => {
                e.stopPropagation(); // 防止触发背景的点击
                setShowInfo(!showInfo);
            }}
        >
            <motion.div
                style={{ rotateX: isActive ? rotateX : 0, rotateY: isActive ? rotateY : 0, transformStyle: "preserve-3d" }}
                className={cn("w-full h-full relative rounded-[24px] overflow-hidden transition-shadow duration-300", isNight ? "shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)] border-white/10" : "shadow-2xl border-white/40")}
            >
                <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover scale-110" />
                <div className={cn("absolute inset-0 transition-opacity duration-500", isNight ? "bg-gradient-to-br from-blue-500/10 to-purple-500/20 mix-blend-overlay" : "bg-gradient-to-br from-white/40 to-transparent")} />

                <motion.div
                    className="absolute inset-0 z-30 p-8 flex flex-col justify-between bg-black/40 backdrop-blur-md transition-all duration-300"
                    animate={{ opacity: showInfo ? 1 : 0 }}
                >
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
                             {data.tags.map(tag => (
                                <span key={tag} onClick={(e) => {e.stopPropagation(); onTagClick?.(tag)}} className="px-2 py-1 bg-white/10 rounded text-[10px] text-white hover:bg-white/20 transition-colors">#{tag}</span>
                             ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// --- 4. 页面视图 ---

// 列表视图 (博客风格)
const GalleryList: React.FC<{ artworks: Artwork[]; isNight: boolean; onSelect: (idx: number) => void; activeTag?: string | null; onClearTag?: () => void }> = ({ artworks, isNight, onSelect, activeTag, onClearTag }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("min-h-screen w-full p-6 md:p-16 transition-colors duration-1000", isNight ? "bg-[#050508] text-white" : "bg-[#f0f4f8] text-slate-800")}
    >
        <div className="max-w-7xl mx-auto">
            {/* 个人信息 Header */}
            <header className="mb-24 mt-12 flex flex-col items-start gap-6">
                <div className="flex items-center gap-3 opacity-60">
                    <User size={16} />
                    <span className="text-xs tracking-[0.3em] uppercase font-medium">Portfolio • 2025</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extralight tracking-tight">
                    五月糖 <span className="font-serif italic font-normal opacity-50 block md:inline md:ml-4 text-3xl md:text-5xl">Design & Art</span>
                </h1>
                {activeTag && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm opacity-60">Filtering by:</span>
                        <button onClick={onClearTag} className="px-4 py-2 rounded-full border border-current/20 flex items-center gap-2 text-sm hover:bg-current/5">
                            #{activeTag} <span className="opacity-50">✕</span>
                        </button>
                    </div>
                )}
                <div className="flex gap-6 mt-2 opacity-60 text-sm">
                    <span className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Mail size={16} /> 联系我</span>
                    <span className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Instagram size={16} /> Instagram</span>
                </div>
            </header>

            {/* 瀑布流展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pb-32">
                {artworks.map((art, index) => (
                    <motion.div
                        key={art.id}
                        layoutId={`card-container-${art.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn("group cursor-pointer flex flex-col", "md:[&:nth-child(2n)]:mt-16", "lg:[&:nth-child(3n+2)]:mt-16")}
                        onClick={() => onSelect(index)}
                    >
                        <div className="aspect-[4/5] overflow-hidden rounded-lg mb-6 relative bg-gray-900 shadow-lg">
                            <motion.img
                                layoutId={`card-image-${art.id}`}
                                src={art.imageUrl}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="p-3 rounded-full bg-white/10 backdrop-blur text-white border border-white/20"><Maximize2 size={20} /></div>
                            </div>
                        </div>
                        <h3 className="text-xl font-light group-hover:text-amber-500 transition-colors">{art.title}</h3>
                        <p className="text-xs opacity-40 mt-1">{art.date} • {art.tags[0]}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.div>
);

// 详情沉浸视图 (带好玩的粒子交互)
const DetailView: React.FC<{
    artworks: Artwork[];
    idx: number;
    setIdx: (i: number) => void;
    isNight: boolean;
    toggleNight: () => void;
    onBack: () => void;
    onTagSelect: (t: string) => void;
}> = ({ artworks, idx, setIdx, isNight, toggleNight, onBack, onTagSelect }) => {
    const [showFireflies, setShowFireflies] = useState(false);
    const [lightboxItem, setLightboxItem] = useState<Artwork | null>(null);
    const leftY = useMotionValue(0);
    const rightY = useMotionValue(0);

    // 💕 心动粒子状态
    const [hearts, setHearts] = useState<{id: number, x: number, y: number}[]>([]);
    const addHeart = (e: React.MouseEvent) => {
        const newHeart = { id: Date.now(), x: e.clientX - 12, y: e.clientY - 12 };
        setHearts(prev => [...prev, newHeart]);
    };
    const removeHeart = useCallback((id: number) => {
        setHearts(prev => prev.filter(h => h.id !== id));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("fixed inset-0 z-50 overflow-hidden transition-colors duration-1000 cursor-crosshair", isNight ? "bg-[#050508]" : "bg-[#f0f4f8]")}
            onClick={addHeart} // ✨ 点击任意空白处触发心动
        >
            {/* 心动粒子渲染层 */}
            <AnimatePresence>
                {hearts.map(h => (
                    <HeartRipple key={h.id} id={h.id} x={h.x} y={h.y} onComplete={removeHeart} />
                ))}
            </AnimatePresence>

            <Fireflies isActive={showFireflies} isDark={isNight} />
            <PullCord side="left" label={isNight ? "开灯" : "关灯"} icon={isNight ? <Sun /> : <Moon />} y={leftY} onTrigger={toggleNight} isDark={isNight} />
            <PullCord side="right" label="流萤" icon={<Sparkles className={showFireflies ? "text-amber-400" : ""} />} y={rightY} onTrigger={() => setShowFireflies(!showFireflies)} isDark={isNight} />

            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className={cn("absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur border transition-colors", isNight ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white/60 border-black/10 text-black hover:bg-white/80")}>
                <ArrowLeft size={16} /> <span className="text-xs tracking-widest uppercase">Back</span>
            </button>

            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-full max-w-5xl h-[600px] flex items-center justify-center relative pointer-events-auto">
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + artworks.length) % artworks.length); }} className={cn("absolute left-4 z-30 p-3 rounded-full backdrop-blur border transition-all hover:scale-110", isNight ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-black/5")}><ChevronLeft /></button>
                    <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % artworks.length); }} className={cn("absolute right-4 z-30 p-3 rounded-full backdrop-blur border transition-all hover:scale-110", isNight ? "bg-white/5 border-white/10 text-white" : "bg-white/60 border-black/5")}><ChevronRight /></button>

                    <AnimatePresence mode='wait'>
                        <motion.div key={idx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
                            <ArtworkCard
                                data={artworks[idx]}
                                isActive={true}
                                isNight={isNight}
                                onMaximize={() => setLightboxItem(artworks[idx])}
                                onTagClick={onTagSelect}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 z-20 pointer-events-none">
                {artworks.map((_, i) => (
                    <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === idx ? (isNight ? "w-8 bg-white" : "w-8 bg-slate-800") : (isNight ? "w-1 bg-white/20" : "w-1 bg-slate-800/20"))} />
                ))}
            </div>

            <AnimatePresence>
                {lightboxItem && <Lightbox image={lightboxItem.imageUrl} title={lightboxItem.title} onClose={() => setLightboxItem(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};

// --- 5. 错误边界 ---
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="text-white p-10 text-center">Something went wrong.</div>;
    return this.props.children;
  }
}

// --- 6. 主程序 ---
function AppContent() {
    // 状态管理：所有的 Hook 都在这里，顺序绝对安全
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isNightMode, setIsNightMode] = useState(true);
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [artworks, setArtworks] = useState<Artwork[]>([]);

    // 加载数据 (只保留基础 API 调用，去除强制的假数据兜底)
    useEffect(() => {
        async function loadData() {
            try {
                const controller = new AbortController();
                // 3秒超时，防止接口卡死
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const res = await fetch('/api/artworks', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setArtworks(data);
                    }
                }
            } catch (err) {
                console.error("API Error, using empty state", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredArtworks = useMemo(() => {
        if (!filterTag) return artworks;
        return artworks.filter(art => art.tags.includes(filterTag));
    }, [artworks, filterTag]);

    // --- 渲染逻辑 ---
    if (loading) return <div className="flex h-screen items-center justify-center bg-[#050508] text-white"><div className="animate-pulse tracking-widest text-xs uppercase">Loading...</div></div>;

    // 修复：如果 API 真的挂了且没数据，显示一个优雅的空状态，而不是白屏
    if (artworks.length === 0) return (
        <div className="flex h-screen items-center justify-center bg-[#050508] text-white/50 flex-col gap-4">
            <Sparkles className="animate-pulse" />
            <p className="text-xs tracking-widest uppercase">Waiting for inspiration...</p>
        </div>
    );

    return (
        <AnimatePresence mode="wait">
            {view === 'list' ? (
                <GalleryList
                    key="list"
                    artworks={filteredArtworks}
                    isNight={isNightMode}
                    activeTag={filterTag}
                    onClearTag={() => setFilterTag(null)}
                    onSelect={(index) => {
                        const selectedArt = filteredArtworks[index];
                        const originalIndex = artworks.findIndex(a => a.id === selectedArt.id);
                        setCurrentIndex(originalIndex);
                        setView('detail');
                    }}
                />
            ) : (
                <DetailView
                    key="detail"
                    artworks={artworks}
                    idx={currentIndex}
                    setIdx={setCurrentIndex}
                    isNight={isNightMode}
                    toggleNight={() => setIsNightMode(!isNightMode)}
                    onBack={() => setView('list')}
                    onTagSelect={(tag) => { setFilterTag(tag); setView('list'); }}
                />
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
