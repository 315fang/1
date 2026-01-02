import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SakuraEasterEggProps {
    isActive: boolean;
    onClose: () => void;
    message?: string;
}

// 单片樱花瓣 - 使用 SVG 绘制更精致的形状
const SakuraPetalSVG = ({
    delay,
    angle,
    distance,
    scale,
    layer
}: {
    delay: number;
    angle: number;
    distance: number;
    scale: number;
    layer: number;
}) => {
    // 计算花瓣的最终位置（极坐标转笛卡尔坐标）
    const finalX = Math.cos((angle * Math.PI) / 180) * distance;
    const finalY = Math.sin((angle * Math.PI) / 180) * distance;

    // 花瓣颜色渐变 - 内层深，外层浅
    const colors = [
        { inner: '#ffb7c5', outer: '#fce4ec' }, // 深粉到浅粉
        { inner: '#f8bbd9', outer: '#fff0f5' }, // 玫瑰粉
        { inner: '#ffcdd2', outer: '#ffffff' }, // 珊瑚粉到白
    ];
    const colorSet = colors[layer % colors.length];

    return (
        <motion.div
            className="absolute"
            style={{
                // 关键：让花瓣的底部对准中心，然后向外旋转
                transformOrigin: 'center bottom',
            }}
            initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
                rotate: angle - 90, // 让花瓣尖端朝外
            }}
            animate={{
                opacity: [0, 1, 1],
                scale: [0, scale * 1.1, scale],
                x: finalX,
                y: finalY,
                rotate: angle - 90,
            }}
            transition={{
                duration: 1.5,
                delay,
                times: [0, 0.6, 1],
                ease: [0.34, 1.56, 0.64, 1], // 弹性缓动
            }}
        >
            <svg
                width={60 * scale}
                height={80 * scale}
                viewBox="0 0 60 80"
                style={{
                    filter: `drop-shadow(0 0 ${8 + layer * 4}px rgba(255, 183, 197, 0.5))`,
                }}
            >
                <defs>
                    <linearGradient id={`petal-gradient-${angle}-${layer}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colorSet.outer} stopOpacity="0.9" />
                        <stop offset="50%" stopColor={colorSet.inner} stopOpacity="0.95" />
                        <stop offset="100%" stopColor={colorSet.outer} stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                {/* 樱花瓣形状：顶部有 V 形缺口 */}
                <path
                    d="M30 5 
                       C 20 5, 5 15, 5 35 
                       C 5 55, 20 75, 30 80 
                       C 40 75, 55 55, 55 35 
                       C 55 15, 40 5, 30 5
                       M 30 5 L 28 15 L 30 10 L 32 15 Z"
                    fill={`url(#petal-gradient-${angle}-${layer})`}
                    stroke="rgba(255, 200, 210, 0.3)"
                    strokeWidth="0.5"
                />
                {/* 花瓣纹路 */}
                <path
                    d="M30 20 Q 25 40, 30 70"
                    fill="none"
                    stroke="rgba(255, 150, 170, 0.2)"
                    strokeWidth="1"
                />
            </svg>
        </motion.div>
    );
};

// 飘落的小花瓣粒子
const FallingPetal = ({ delay, startX }: { delay: number; startX: number }) => (
    <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${startX}%`, top: '-20px' }}
        initial={{ opacity: 0, y: 0, rotate: 0, scale: 0.5 }}
        animate={{
            opacity: [0, 0.8, 0.8, 0],
            y: [0, 200, 400, 600],
            x: [0, 30, -20, 40],
            rotate: [0, 180, 360, 540],
            scale: [0.5, 0.8, 0.6, 0.3],
        }}
        transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            ease: "linear",
        }}
    >
        <svg width="16" height="20" viewBox="0 0 60 80">
            <path
                d="M30 5 C 20 5, 5 15, 5 35 C 5 55, 20 75, 30 80 C 40 75, 55 55, 55 35 C 55 15, 40 5, 30 5"
                fill="rgba(255, 183, 197, 0.6)"
            />
        </svg>
    </motion.div>
);

const RoseEasterEgg: React.FC<SakuraEasterEggProps> = ({
    isActive,
    onClose,
    message = "我永远爱你 ❤️"
}) => {
    // 生成三层花瓣 - 关键修复：每层有不同的距离
    const petalGroups = useMemo(() => {
        const layers = [
            { count: 5, distance: 35, scale: 0.55, delayBase: 0.6 },  // 内层：5片，近
            { count: 6, distance: 65, scale: 0.75, delayBase: 0.3 },  // 中层：6片，中
            { count: 8, distance: 95, scale: 0.95, delayBase: 0 },    // 外层：8片，远
        ];

        const allPetals: any[] = [];
        layers.forEach((layer, layerIdx) => {
            const angleStep = 360 / layer.count;
            const angleOffset = layerIdx * 15; // 每层错开一点角度

            for (let i = 0; i < layer.count; i++) {
                allPetals.push({
                    id: `${layerIdx}-${i}`,
                    angle: angleStep * i + angleOffset,
                    distance: layer.distance + (Math.random() - 0.5) * 10,
                    scale: layer.scale * (0.9 + Math.random() * 0.2),
                    delay: layer.delayBase + i * 0.08,
                    layer: layerIdx,
                });
            }
        });
        return allPetals;
    }, []);

    // 飘落的花瓣
    const fallingPetals = useMemo(() =>
        Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            startX: Math.random() * 100,
            delay: Math.random() * 5,
        })),
        []);

    useEffect(() => {
        if (isActive && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }, [isActive]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[2000] flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={onClose}
                >
                    {/* 背景 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90 backdrop-blur-md"
                    />

                    {/* 环境光晕 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.4, scale: 2 }}
                        transition={{ duration: 2 }}
                        className="absolute w-[400px] h-[400px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,183,197,0.3) 0%, rgba(255,192,203,0.1) 50%, transparent 70%)',
                        }}
                    />

                    {/* 飘落的花瓣背景 */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {fallingPetals.map(p => (
                            <FallingPetal key={p.id} delay={p.delay} startX={p.startX} />
                        ))}
                    </div>

                    {/* 🌸 樱花主体 - 居中容器 */}
                    <div className="relative flex items-center justify-center">
                        {/* 所有花瓣 */}
                        {petalGroups.map(p => (
                            <SakuraPetalSVG
                                key={p.id}
                                angle={p.angle}
                                distance={p.distance}
                                scale={p.scale}
                                delay={p.delay}
                                layer={p.layer}
                            />
                        ))}

                        {/* 花蕊 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: 1,
                                type: "spring",
                                stiffness: 200,
                            }}
                            className="absolute z-20"
                        >
                            {/* 外圈 */}
                            <div
                                className="w-8 h-8 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, #fff9c4 0%, #ffeb3b 50%, #ffc107 100%)',
                                    boxShadow: '0 0 20px rgba(255, 235, 59, 0.8), 0 0 40px rgba(255, 193, 7, 0.4)',
                                }}
                            />
                            {/* 花蕊小点 */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500"
                            />
                        </motion.div>
                    </div>

                    {/* 文案 */}
                    <div className="absolute bottom-[15%] w-full text-center px-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.3 }}
                            className="text-4xl md:text-6xl font-light text-white mb-6 tracking-[0.15em]"
                            style={{
                                fontFamily: '"Noto Serif SC", "Songti SC", serif',
                                textShadow: '0 0 30px rgba(255,183,197,0.6), 0 2px 10px rgba(0,0,0,0.8)',
                            }}
                        >
                            {message}
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 100 }}
                            transition={{ duration: 1, delay: 2 }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4"
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 2.5 }}
                            className="text-white/30 text-[10px] tracking-[0.4em] uppercase"
                        >
                            Click anywhere to return
                        </motion.p>
                    </div>

                    {/* 右上角装饰 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -30 }}
                        animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 2.5 }}
                        className="absolute top-[8%] right-[8%] text-5xl"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255,183,197,0.5))' }}
                    >
                        🌸
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RoseEasterEgg;
