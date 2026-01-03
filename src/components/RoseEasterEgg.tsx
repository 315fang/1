import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SakuraEasterEggProps {
    isActive: boolean;
    onClose: () => void;
    message?: string;
}

// 单片樱花瓣组件
const SakuraPetal = ({
    angle,
    delay,
    size,
    layer,
}: {
    angle: number;
    delay: number;
    size: number;
    layer: number;
}) => {
    // 颜色根据层级变化
    const colors = [
        { main: '#ffc1cc', light: '#fff0f3' },
        { main: '#ffb7c5', light: '#ffe4ec' },
        { main: '#ffa4b0', light: '#ffd6dd' },
    ];
    const color = colors[layer % 3];

    return (
        <motion.div
            className="absolute"
            style={{
                // 关键：以中心点为原点，向上偏移后旋转
                width: size,
                height: size * 1.4,
                left: '50%',
                top: '50%',
                marginLeft: -size / 2,
                marginTop: -size * 1.4, // 花瓣底部在中心
                transformOrigin: `${size / 2}px ${size * 1.4}px`, // 旋转点在花瓣底部中心
            }}
            initial={{
                opacity: 0,
                scale: 0,
                rotate: angle,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                rotate: angle,
            }}
            transition={{
                duration: 1.2,
                delay,
                ease: [0.34, 1.56, 0.64, 1],
            }}
        >
            <svg
                width={size}
                height={size * 1.4}
                viewBox="0 0 100 140"
                style={{
                    filter: `drop-shadow(0 0 ${6 + layer * 3}px rgba(255, 183, 197, 0.4))`,
                }}
            >
                <defs>
                    <linearGradient id={`sakura-grad-${angle}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color.light} stopOpacity="0.95" />
                        <stop offset="60%" stopColor={color.main} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={color.light} stopOpacity="0.7" />
                    </linearGradient>
                </defs>
                {/* 樱花瓣形状 - 顶部V形缺口 */}
                <path
                    d="M50 8
                       L45 20 L50 15 L55 20 Z
                       M50 15
                       C 25 20, 5 45, 5 80
                       C 5 110, 30 135, 50 140
                       C 70 135, 95 110, 95 80
                       C 95 45, 75 20, 50 15"
                    fill={`url(#sakura-grad-${angle})`}
                />
                {/* 花瓣中线 */}
                <path
                    d="M50 25 Q 48 70, 50 130"
                    fill="none"
                    stroke="rgba(255, 180, 190, 0.3)"
                    strokeWidth="1.5"
                />
            </svg>
        </motion.div>
    );
};

// 飘落的小花瓣
const FallingPetal = ({ delay, startX }: { delay: number; startX: number }) => (
    <motion.div
        className="absolute pointer-events-none opacity-60"
        style={{ left: `${startX}%`, top: '-30px' }}
        initial={{ y: 0, rotate: 0, scale: 0.6 }}
        animate={{
            y: [0, 300, 600],
            x: [0, 40, -20],
            rotate: [0, 180, 360],
            opacity: [0, 0.7, 0],
        }}
        transition={{
            duration: 10,
            delay,
            repeat: Infinity,
            ease: "linear",
        }}
    >
        <svg width="14" height="18" viewBox="0 0 100 140">
            <path
                d="M50 10 C 25 20, 5 45, 5 80 C 5 110, 30 135, 50 140 C 70 135, 95 110, 95 80 C 95 45, 75 20, 50 10"
                fill="rgba(255, 183, 197, 0.7)"
            />
        </svg>
    </motion.div>
);

const RoseEasterEgg: React.FC<SakuraEasterEggProps> = ({
    isActive,
    onClose,
    message = "我永远爱你 ❤️"
}) => {
    // 生成三层花瓣
    const petalGroups = useMemo(() => {
        const layers = [
            { count: 5, size: 55, delayBase: 0.5 },   // 内层 - 稍大一点覆盖中心
            { count: 5, size: 75, delayBase: 0.25 },  // 中层
            { count: 5, size: 95, delayBase: 0 },     // 外层
        ];

        const allPetals: any[] = [];
        layers.forEach((layer, layerIdx) => {
            const angleStep = 360 / layer.count;
            const angleOffset = layerIdx * 12; // 每层错开12°，使花瓣均匀对称分布

            for (let i = 0; i < layer.count; i++) {
                allPetals.push({
                    id: `${layerIdx}-${i}`,
                    angle: angleStep * i + angleOffset,
                    size: layer.size,
                    delay: layer.delayBase + i * 0.06,
                    layer: layerIdx,
                });
            }
        });
        return allPetals;
    }, []);

    // 飘落花瓣
    const fallingPetals = useMemo(() =>
        Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            startX: 10 + Math.random() * 80,
            delay: Math.random() * 8,
        })),
        []);

    useEffect(() => {
        if (isActive && navigator.vibrate) {
            navigator.vibrate([80, 40, 80]);
        }
    }, [isActive]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="fixed inset-0 z-[2000] flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={onClose}
                >
                    {/* 背景 */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

                    {/* 光晕 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.5, scale: 1.5 }}
                        transition={{ duration: 1.5 }}
                        className="absolute w-[350px] h-[350px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,192,203,0.25) 0%, transparent 70%)',
                        }}
                    />

                    {/* 飘落花瓣 */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {fallingPetals.map(p => (
                            <FallingPetal key={p.id} delay={p.delay} startX={p.startX} />
                        ))}
                    </div>

                    {/* 🌸 樱花主体 */}
                    <div className="relative w-[250px] h-[250px]">
                        {petalGroups.map(p => (
                            <SakuraPetal
                                key={p.id}
                                angle={p.angle}
                                size={p.size}
                                delay={p.delay}
                                layer={p.layer}
                            />
                        ))}

                        {/* 花蕊 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                        >
                            <div
                                className="w-12 h-12 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle at 40% 40%, #fff9c4 0%, #ffeb3b 40%, #ffc107 100%)',
                                    boxShadow: '0 0 30px rgba(255, 235, 59, 0.9)',
                                }}
                            />
                        </motion.div>
                    </div>

                    {/* 文案 */}
                    <div className="absolute bottom-[12%] w-full text-center px-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.2 }}
                            className="text-4xl md:text-6xl font-light text-white mb-5 tracking-[0.12em]"
                            style={{
                                fontFamily: '"Noto Serif SC", serif',
                                textShadow: '0 0 25px rgba(255,183,197,0.5)',
                            }}
                        >
                            {message}
                        </motion.h1>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 1.8 }}
                            className="w-24 h-[1px] bg-white/25 mx-auto mb-3"
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ delay: 2.2 }}
                            className="text-white/35 text-[9px] tracking-[0.35em] uppercase"
                        >
                            Click anywhere to return
                        </motion.p>
                    </div>

                    {/* 装饰 */}
                    <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.85, scale: 1 }}
                        transition={{ delay: 2, type: "spring" }}
                        className="absolute top-[8%] right-[10%] text-4xl"
                    >
                        🌸
                    </motion.span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RoseEasterEgg;
