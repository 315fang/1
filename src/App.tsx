import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence, useMotionTemplate, PanInfo } from 'framer-motion';
import { Sun, Moon, Sparkles, Info, ChevronLeft, ChevronRight, ArrowLeft, Grid, Maximize2, User, Mail, Instagram } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Lightbox from './components/Lightbox';

// --- 1. 工具函数 (直接内联，避免路径错误) ---
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

// --- 3. 数据源 (从 API 获取) ---
// 动态数据在 App 组件内通过 useEffect 获取

// --- 4. 核心组件定义 ---

// 4.1 物理拉绳 (PullCord)
// 4.1 物理拉绳 (PullCord) - 升级版：聚光交互
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
    const glowOpacity = useTransform(y, [0, 100], [0, 1]);
    const particleScale = useTransform(y, [0, 150], [0.5, 1.5]);

    // 生成固定的粒子位置，避免每次渲染重算
    const particles = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            x: Math.cos(i * 30 * (Math.PI / 180)) * (15 + Math.random() * 10),
            y: Math.sin(i * 30 * (Math.PI / 180)) * (15 + Math.random() * 10),
            size: Math.random() * 2 + 1,
            delay: Math.random() * 2
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
                {/* 聚光粒子层 - 随下拉显现 */}
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className={cn(
                            "absolute rounded-full pointer-events-none transition-colors duration-300",
                            isDark ? "bg-amber-100 shadow-[0_0_4px_gold]" : "bg-cyan-400 shadow-[0_0_4px_cyan]"
                        )}
                        initial={{ x: 0, y: 0 }}
                        animate={{
                            x: [0, p.x, 0],
                            y: [0, p.y, 0],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: p.delay,
                            ease: "easeInOut"
                        }}
                        // 粒子定位在手柄中心
                        style={{
                            width: p.size,
                            height: p.size,
                            top: '50%',
                            left: '50%',
                            marginTop: -p.size / 2,
                            marginLeft: -p.size / 2,
                            position: 'absolute',
                            opacity: glowOpacity,
                            scale: particleScale
                        }}
                    />
                ))}

                <motion.div
                    className={cn(
                        "w-10 h-14 rounded-full border border-white/20 backdrop-blur-md flex flex-col items-center justify-center shadow-lg transition-all duration-500 relative overflow-hidden",
                        triggered
                            ? "bg-amber-100/40 border-amber-200/50 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                            : (isDark ? "bg-black/40 hover:bg-white/10" : "bg-white/60 hover:bg-white/80 border-black/5")
                    )}
                >
                    {/* 内部高光流光 */}
                    <motion.div
                        style={{ opacity: glowOpacity }}
                        className={cn(
                            "absolute inset-0 z-0 bg-gradient-to-t opacity-0 transition-opacity",
                            isDark ? "from-amber-200/20" : "from-cyan-400/20"
                        )}
                    />

                    <div className={cn("absolute -top-1 w-[1px] h-2 opacity-50 z-10", isDark ? "bg-white" : "bg-slate-500")} />
                    <div className={cn("transition-colors duration-500 z-10", isDark ? "text-white/80" : "text-slate-700")}>
                        {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 1.5 })}
                    </div>
                </motion.div>

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

// 4.2 流萤粒子 (Fireflies)
const Fireflies: React.FC<{ isActive: boolean; isDark: boolean; agitationLevel: any }> = ({ isActive, isDark, agitationLevel }) => {
    const particles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 4 + 2,
            baseDuration: Math.random() * 10 + 10,
        }));
    }, []);

    const extraGlow = useTransform(agitationLevel, [0, 150], [1, 2]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <AnimatePresence>
                {(isActive) && particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0.2, 0.8, 0],
                            scale: [0, 1, 0.8, 1.2, 0],
                            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                            y: [0, Math.random() * -100 - 50, Math.random() * -100],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                            duration: p.baseDuration,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: p.size,
                            height: p.size,
                            scale: extraGlow
                        }}
                        className={cn(
                            "absolute rounded-full blur-[1px]",
                            isDark ? "bg-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                        )}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// 4.3 艺术卡片 (ArtworkCard) - 升级版：3D 全息磨砂玻璃风格
interface ArtworkCardProps {
    data: Artwork;
    isActive: boolean;
    isNight: boolean;
    ambientLight: any;
    layoutIdPrefix?: string;
    onMaximize?: () => void;
    onTagClick?: (tag: string) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ data, isActive, isNight, ambientLight, layoutIdPrefix = "detail", onMaximize, onTagClick }) => {
    const [showInfo, setShowInfo] = useState(false);

    // --- 新增：3D 倾斜逻辑 ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    // 根据鼠标位置计算旋转角度 (范围可以自己调，这里是 15度)
    const rotateX = useTransform(y, [-200, 200], [15, -15]);
    const rotateY = useTransform(x, [-200, 200], [-15, 15]);

    // 计算光泽移动的效果 (让反光跟随鼠标)
    const shineX = useTransform(x, [-200, 200], [0, 100]);
    const shineY = useTransform(y, [-200, 200], [0, 100]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        // 计算鼠标相对于卡片中心的坐标
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
    }

    function handleMouseLeave() {
        setShowInfo(false);
        // 鼠标离开时复位
        x.set(0);
        y.set(0);
    }

    const cardBrightness = useTransform(ambientLight, [0, 150], [1, 0.7]);
    const filterStyle = useTransform(cardBrightness, (b: number) => `brightness(${b})`);

    useEffect(() => {
        if (!isActive) { setShowInfo(false); }
    }, [isActive]);

    return (
        <motion.div
            className={cn(
                "relative w-[320px] h-[540px] md:w-[380px] md:h-[620px] rounded-[24px] cursor-pointer select-none perspective-1200", // 加大圆角
                isActive ? "z-30" : "z-10 pointer-events-none"
            )}
            style={{
                perspective: 1200,
                transformStyle: "preserve-3d",
                filter: filterStyle
            }}
            initial={false}
            animate={{
                scale: isActive ? 1 : 0.85,
                opacity: isActive ? 1 : 0.5,
                // 如果不是激活状态，取消 3D 旋转，稍微模糊
                rotateX: isActive ? 0 : 0,
                rotateY: isActive ? 0 : 0,
                filter: isActive ? 'blur(0px)' : 'blur(4px)',
                y: isActive ? [0, -10, 0] : 0,
            }}
            transition={{
                scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.6 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setShowInfo(prev => !prev)}
        >
            {/* 3D 容器：承载旋转效果 */}
            <motion.div
                layoutId={`${layoutIdPrefix}-container-${data.id}`}
                style={{
                    rotateX: isActive ? rotateX : 0,
                    rotateY: isActive ? rotateY : 0,
                    transformStyle: "preserve-3d"
                }}
                className={cn(
                    "w-full h-full relative rounded-[24px] overflow-hidden transition-shadow duration-300",
                    // 这里实现了图片里那种蓝紫色的环境光晕
                    isNight
                        ? "shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)] border border-white/10"
                        : "shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/40"
                )}
            >
                {/* 背景层：图片 */}
                <motion.div className="absolute inset-0 w-full h-full bg-slate-900">
                    <motion.img
                        layoutId={`${layoutIdPrefix}-image-${data.id}`}
                        src={data.imageUrl}
                        alt={data.title}
                        className="w-full h-full object-cover"
                        style={{ scale: 1.1 }} // 图片稍微放大一点，防止旋转时露底
                    />
                </motion.div>

                {/* ✨ 玻璃流沙粒子层 (新加) */}
                <motion.div
                    className={cn(
                        "absolute inset-0 z-10 pointer-events-none overflow-hidden sand-gradient",
                        showInfo ? "sand-flow-fast" : "sand-flow"
                    )}
                    style={{ mixBlendMode: 'soft-light', opacity: isNight ? 0.6 : 0.4 }}
                />

                {/* 核心特效层：模仿参考图的“磨砂玻璃 + 蓝色光泽” */}
                <div className={cn(
                    "absolute inset-0 z-20 pointer-events-none transition-opacity duration-500",
                    // 白天稍微亮一点，晚上深邃一点
                    isNight
                        ? "bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/20 mix-blend-overlay"
                        : "bg-gradient-to-br from-white/40 via-transparent to-white/10"
                )} />

                {/* 高光反射层：随鼠标移动的“反光” */}
                <motion.div
                    className="absolute inset-0 z-20 opacity-30 pointer-events-none mix-blend-plus-lighter"
                    style={{
                        background: useMotionTemplate`linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 45%, rgba(255, 255, 255, 0.4) 50%, transparent 54%)`,
                        x: shineX, // 反光跟随鼠标
                        y: shineY,
                    }}
                />

                {/* 边框高光：模仿玻璃厚度 (Inner Glow) */}
                <div className="absolute inset-0 rounded-[24px] z-20 pointer-events-none ring-1 ring-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />

                {/* 信息层 */}
                <motion.div
                    className="absolute inset-0 z-30 p-8 flex flex-col justify-between bg-black/20 backdrop-blur-[2px]"
                    animate={{
                        opacity: showInfo ? 1 : 0, // 只有点击后才显示文字，保持平时画面的纯净感
                        backdropFilter: showInfo ? "blur(10px)" : "blur(0px)"
                    }}
                >
                    <div className="pt-2 translate-z-10" style={{ transform: "translateZ(30px)" }}> {/* 文字悬浮效果 */}
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] tracking-[0.2em] uppercase font-medium text-white/90">{data.date}</p>
                            <div className="flex gap-4">
                                {onMaximize && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onMaximize(); }}
                                        className="opacity-60 hover:opacity-100 hover:scale-110 transition-all text-white"
                                        title="全屏查看"
                                    >
                                        <Maximize2 size={16} />
                                    </button>
                                )}
                                <Info size={16} className="text-white/80" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-light mb-1 tracking-wide text-white drop-shadow-lg">{data.title}</h2>
                        <h3 className="text-sm font-serif italic text-white/80">{data.enTitle}</h3>
                        <div className="h-[1px] w-8 mt-6 bg-white/40" />
                    </div>

                    <div className="translate-z-10" style={{ transform: "translateZ(30px)" }}>
                        <p className="leading-relaxed font-light text-sm mb-6 text-white/90 drop-shadow-md">{data.description}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {data.tags.map(tag => (
                                <span
                                    key={tag}
                                    onClick={(e) => { e.stopPropagation(); onTagClick && onTagClick(tag); }}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-white/20 text-white/90 bg-white/10 backdrop-blur-md shadow-sm transition-colors",
                                        onTagClick ? "cursor-pointer hover:bg-white/20 hover:border-white/40" : ""
                                    )}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20">{data.author[0]}</div>
                            <span className="text-sm text-white/90 font-medium tracking-wide">{data.author}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// --- 5. 辅助 UI 组件 ---

const SpotlightEffect = ({ isDark }: { isDark: boolean }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
            mouseX.set(clientX);
            mouseY.set(clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const backgroundBg = useMotionTemplate`
        radial-gradient(
            600px circle at ${mouseX}px ${mouseY}px,
            ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'},
            transparent 80%
        )
    `;

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500"
            style={{
                background: backgroundBg
            }}
        />
    );
};

const NavButton: React.FC<{ direction: 'left' | 'right'; onClick: () => void; isNight: boolean }> = ({ direction, onClick, isNight }) => {
    return (
        <div
            className={cn(
                "absolute inset-y-0 z-30 flex items-center group cursor-pointer",
                direction === 'left' ? "left-0 pl-2 md:pl-8 justify-start" : "right-0 pr-2 md:pr-8 justify-end"
            )}
            onClick={onClick}
        >
            <motion.button
                whileHover={{ scale: 1.1, backgroundColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 border shadow-sm",
                    isNight
                        ? "bg-white/5 border-white/10 text-white/80"
                        : "bg-black/5 border-black/5 text-slate-800/80"
                )}
            >
                {direction === 'left' ? <ChevronLeft size={20} strokeWidth={1.5} /> : <ChevronRight size={20} strokeWidth={1.5} />}
            </motion.button>
        </div>
    );
};

const BackButton: React.FC<{ isNight: boolean; onClick: () => void }> = ({ isNight, onClick }) => {
    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "absolute top-6 left-6 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border shadow-sm transition-colors cursor-pointer group",
                isNight
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-white/40 border-slate-200 text-slate-800 hover:bg-white/60"
            )}
            onClick={onClick}
        >
            <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase">Gallery</span>
        </motion.button>
    );
};

// --- 6. 视图组件 ---

const GalleryList: React.FC<{
    artworks: Artwork[];
    isNight: boolean;
    onSelect: (index: number) => void;
    activeTag?: string | null;
    onClearTag?: () => void;
}> = ({ artworks, isNight, onSelect, activeTag, onClearTag }) => {
    return (
        <motion.div
            className={cn(
                "min-h-screen w-full p-6 md:p-16 overflow-y-auto transition-colors duration-1000 relative",
                isNight ? "bg-[#050508] text-white" : "bg-[#f0f4f8] text-slate-800"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <SpotlightEffect isDark={isNight} />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-24 mt-12 flex flex-col items-start gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 opacity-60"
                    >
                        <User size={16} />
                        <span className="text-xs tracking-[0.3em] uppercase font-medium">Portfolio • 2025</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extralight tracking-tight"
                    >
                        五月糖 <span className="font-serif italic font-normal opacity-50 block md:inline md:ml-4 text-3xl md:text-5xl">Design & Art</span>
                    </motion.h1>

                    {activeTag && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-4"
                        >
                            <span className="text-sm opacity-60">Filtering by:</span>
                            <button
                                onClick={onClearTag}
                                className="px-4 py-2 rounded-full border border-current/20 hover:bg-current/5 flex items-center gap-2 text-sm transition-colors"
                            >
                                #{activeTag} <span className="opacity-50 text-xs">✕</span>
                            </button>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-6 mt-2 opacity-60 text-sm"
                    >
                        <span className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Mail size={16} /> 联系我</span>
                        <span className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Instagram size={16} /> Instagram</span>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pb-32">
                    {artworks.map((art, index) => (
                        <motion.div
                            key={art.id}
                            layoutId={`card-container-${art.id}`}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                                "group cursor-pointer flex flex-col transition-all duration-500",
                                "md:[&:nth-child(2n)]:mt-16",
                                "lg:[&:nth-child(2n)]:mt-0",
                                "lg:[&:nth-child(3n+2)]:mt-16"
                            )}
                            onClick={() => onSelect(index)}
                        >
                            <div className="relative overflow-hidden rounded-lg mb-6">
                                <motion.div
                                    className={cn(
                                        "aspect-[4/5] overflow-hidden relative shadow-sm transition-shadow duration-500 group-hover:shadow-2xl",
                                        isNight ? "bg-slate-900" : "bg-white"
                                    )}
                                >
                                    <motion.img
                                        layoutId={`card-image-${art.id}`}
                                        src={art.imageUrl}
                                        alt={art.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-500">
                                            <Maximize2 size={20} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-between items-end border-t border-current/10 pt-4"
                            >
                                <div>
                                    <h3 className="text-xl font-light tracking-wide group-hover:text-amber-500/80 transition-colors duration-300">{art.title}</h3>
                                    <p className="text-xs font-serif italic opacity-50 mt-1">{art.enTitle}</p>
                                </div>
                                <span className="text-[10px] tracking-widest opacity-40">{art.date}</span>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const DetailView: React.FC<{
    artworks: Artwork[];
    currentIndex: number;
    onChangeIndex: (index: number) => void;
    isNightMode: boolean;
    toggleNightMode: () => void;
    onBack: () => void;
    onTagSelect?: (tag: string) => void;
}> = ({ artworks, currentIndex, onChangeIndex, isNightMode, toggleNightMode, onBack, onTagSelect }) => {
    const [showFireflies, setShowFireflies] = useState(false);
    const [lightboxItem, setLightboxItem] = useState<Artwork | null>(null);
    const leftRopeY = useMotionValue(0);
    const rightRopeY = useMotionValue(0);
    const timeOverlayOpacity = useTransform(leftRopeY, [0, 150], [0, 0.8]);

    const nextCard = () => onChangeIndex((currentIndex + 1) % artworks.length);
    const prevCard = () => onChangeIndex((currentIndex - 1 + artworks.length) % artworks.length);

    return (
        <motion.div
            className={cn(
                "fixed inset-0 z-50 overflow-hidden font-sans transition-colors duration-1000",
                isNightMode ? "bg-[#050508] text-white" : "bg-[#f0f4f8] text-slate-800"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
            <motion.div
                style={{ opacity: timeOverlayOpacity }}
                className={cn(
                    "absolute inset-0 z-0 pointer-events-none transition-colors duration-0",
                    isNightMode ? "bg-slate-200 mix-blend-overlay" : "bg-black mix-blend-multiply"
                )}
            />

            <BackButton isNight={isNightMode} onClick={onBack} />

            <div
                className="absolute inset-0 transition-all duration-1000 ease-in-out z-0"
                style={{
                    background: isNightMode
                        ? `radial-gradient(circle at 50% -20%, #1e293b 0%, #020617 80%)`
                        : `radial-gradient(circle at 50% -20%, #e2e8f0 0%, #cbd5e1 80%)`,
                }}
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <Fireflies isActive={showFireflies} isDark={isNightMode} agitationLevel={rightRopeY} />

            <PullCord
                side="left"
                label={isNightMode ? "迎接白昼" : "步入黑夜"}
                icon={isNightMode ? <Sun size={20} /> : <Moon size={20} />}
                y={leftRopeY}
                onTrigger={toggleNightMode}
                isDark={isNightMode}
            />
            <PullCord
                side="right"
                label={showFireflies ? "隐去流萤" : "唤醒流萤"}
                icon={<Sparkles size={20} className={cn("transition-colors", showFireflies ? (isNightMode ? "text-amber-300" : "text-emerald-500") : "")} />}
                y={rightRopeY}
                onTrigger={() => setShowFireflies(prev => !prev)}
                isDark={isNightMode}
            />

            <div className={cn(
                "absolute top-20 w-full text-center z-10 pointer-events-none transition-all duration-1000",
                isNightMode ? "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-slate-800/80"
            )}>
                <div className="flex items-center justify-center gap-4 opacity-40 mb-4">
                    <div className={cn("h-[1px] w-12", isNightMode ? "bg-white" : "bg-black")} />
                    <p className="text-[10px] tracking-[0.4em] uppercase font-medium">Exhibition</p>
                    <div className={cn("h-[1px] w-12", isNightMode ? "bg-white" : "bg-black")} />
                </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-20 pt-10">
                <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center px-4 perspective-[2000px]">
                    <NavButton direction="left" onClick={prevCard} isNight={isNightMode} />
                    <NavButton direction="right" onClick={nextCard} isNight={isNightMode} />
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="z-20"
                        >
                            <ArtworkCard
                                data={artworks[currentIndex]}
                                isActive={true}
                                isNight={isNightMode}
                                ambientLight={leftRopeY}
                                layoutIdPrefix="card"
                                onMaximize={() => setLightboxItem(artworks[currentIndex])}
                                onTagClick={onTagSelect}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {lightboxItem && (
                    <Lightbox
                        image={lightboxItem.imageUrl}
                        title={lightboxItem.title}
                        onClose={() => setLightboxItem(null)}
                        layoutId={`card-image-${lightboxItem.id}`}
                    />
                )}
            </AnimatePresence>

            <div className="absolute bottom-12 left-0 w-full flex justify-center z-20 pointer-events-none">
                <div className="flex gap-4">
                    {artworks.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "h-1 rounded-full transition-all duration-500",
                                idx === currentIndex
                                    ? (isNightMode ? "bg-white w-8 shadow-[0_0_8px_white]" : "bg-slate-800 w-8")
                                    : (isNightMode ? "bg-white/20 w-1" : "bg-slate-800/20 w-1")
                            )}
                        />
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className={cn("absolute bottom-6 right-8 text-[10px] text-right pointer-events-none select-none", isNightMode ? "text-white/30" : "text-slate-400")}
            >
                <p>轻拉绳索唤醒流萤 • 移动鼠标感受光影</p>
            </motion.div>
        </motion.div>
    );
};

// --- 主程序 (App) ---
export default function App() {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isNightMode, setIsNightMode] = useState(true);
    const [filterTag, setFilterTag] = useState<string | null>(null);

    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/artworks');
                const data = await res.json();
                if (data && data.length > 0) {
                    setArtworks(data);
                }
            } catch (err) {
                console.error("加载失败:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <div className="animate-pulse tracking-[0.5em] text-sm uppercase opacity-50">Loading Gallery...</div>
            </div>
        );
    }

    const filteredArtworks = useMemo(() => {
        if (!filterTag) return artworks;
        return artworks.filter(art => art.tags.includes(filterTag));
    }, [artworks, filterTag]);

    const handleTagSelect = (tag: string) => {
        setFilterTag(tag);
        setView('list');
    };

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
                        // 如果有过滤，需要找到在原数组中的索引
                        const selectedArt = filteredArtworks[index];
                        const originalIndex = artworks.findIndex(a => a.id === selectedArt.id);
                        setCurrentIndex(originalIndex);
                        setView('detail');
                    }}
                />
            ) : (
                <DetailView
                    key="detail"
                    artworks={artworks} // 详情页总是可以浏览所有图片，还是只浏览过滤后的？通常是所有，或者保留过滤上下文。这里保持简单，浏览所有。
                    currentIndex={currentIndex}
                    onChangeIndex={setCurrentIndex}
                    isNightMode={isNightMode}
                    toggleNightMode={() => setIsNightMode(prev => !prev)}
                    onBack={() => setView('list')}
                    onTagSelect={handleTagSelect}
                />
            )}
        </AnimatePresence>
    );
}