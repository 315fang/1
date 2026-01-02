import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SakuraEasterEggProps {
    isActive: boolean;
    onClose: () => void;
    message?: string;
}

// 樱花瓣组件 - 修复了形状和旋转计算
const SakuraPetal = ({ delay, rotation, scale, layer }: { delay: number; rotation: number; scale: number; layer: number }) => {
    // 樱花瓣是一个带缺口的心形/水滴形
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, rotate: rotation, y: 0 }}
            animate={{
                opacity: [0, 1, 1, 0.9],
                scale: [0, scale, scale * 1.05, scale],
                rotate: rotation,
                y: -15 * layer // 每一层稍微向上偏移，增加立体感
            }}
            transition={{
                duration: 2,
                delay,
                times: [0, 0.4, 0.7, 1],
                ease: "easeOut"
            }}
            className="absolute"
            style={{
                width: 70 * scale,
                height: 90 * scale,
                // 樱花粉色渐变
                background: `linear-gradient(135deg, #fff5f8 0%, #ffb7c5 50%, #ffa4b0 100%)`,
                // 独特的樱花瓣形状
                borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
                clipPath: 'polygon(50% 15%, 70% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%, 30% 0%)',
                transformOrigin: 'bottom center',
                boxShadow: '0 0 15px rgba(255, 183, 197, 0.4)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
            }}
        />
    );
};

// 飘落的粉色粒子
const SakuraParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
        animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.4],
            x: x + (Math.random() - 0.5) * 150,
            y: y + 300, // 向下飘落
            rotate: 360
        }}
        transition={{
            duration: 5 + Math.random() * 2,
            delay,
            ease: "linear",
            repeat: Infinity
        }}
        className="absolute w-3 h-3 bg-pink-100/40 rounded-full"
        style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            filter: 'blur(1px)',
        }}
    />
);

const RoseEasterEgg: React.FC<SakuraEasterEggProps> = ({
    isActive,
    onClose,
    message = "我永远爱你 ❤️"
}) => {
    // 生成三层花瓣
    const petalGroups = useMemo(() => {
        const layersData = [
            { count: 5, scale: 0.6, delay: 0.8 },  // 内层
            { count: 6, scale: 0.9, delay: 0.4 },  // 中层
            { count: 8, scale: 1.2, delay: 0 },    // 外层
        ];

        const allPetals: any[] = [];
        layersData.forEach((layerData, idx) => {
            for (let i = 0; i < layerData.count; i++) {
                allPetals.push({
                    id: `${idx}-${i}`,
                    delay: layerData.delay + (i * 0.12),
                    rotation: (360 / layerData.count) * i + (idx * 25), // 增大角度偏移
                    scale: layerData.scale * (0.85 + Math.random() * 0.3),
                    layer: idx
                });
            }
        });
        return allPetals;
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 600 - 300,
            delay: Math.random() * 5,
        }));
    }, []);

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
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[2000] flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-md"
                    />

                    {/* 樱花背景光晕 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.3, scale: 1.8 }}
                        transition={{ duration: 3 }}
                        className="absolute w-[600px] h-[600px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,183,197,0.3) 0%, transparent 70%)',
                        }}
                    />

                    {/* 飘落花瓣粒子 */}
                    <div className="absolute inset-0 pointer-events-none">
                        {particles.map(p => (
                            <SakuraParticle key={p.id} x={p.x} y={p.y} delay={p.delay} />
                        ))}
                    </div>

                    {/* 樱花主体 */}
                    <div className="relative flex items-center justify-center scale-110 md:scale-150">
                        {petalGroups.map(p => (
                            <SakuraPetal
                                key={p.id}
                                delay={p.delay}
                                rotation={p.rotation}
                                scale={p.scale}
                                layer={p.layer}
                            />
                        ))}

                        {/* 花蕊 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 1.2 }}
                            className="absolute w-5 h-5 rounded-full z-10"
                            style={{
                                background: 'radial-gradient(circle, #fffde7 0%, #ffd600 100%)',
                                boxShadow: '0 0 30px rgba(255, 235, 59, 0.6)',
                            }}
                        />
                    </div>

                    {/* 文案内容 */}
                    <div className="absolute bottom-[18%] w-full text-center px-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 1.5 }}
                            className="text-4xl md:text-7xl font-light text-white mb-8 tracking-[0.2em]"
                            style={{
                                fontFamily: '"Noto Serif SC", serif',
                                textShadow: '0 0 25px rgba(255,183,197,0.6), 0 0 50px rgba(0,0,0,0.8)',
                            }}
                        >
                            {message}
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 120, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 2.2 }}
                            className="h-[1px] bg-white/20 mx-auto mb-6"
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 2.8 }}
                            className="text-white/40 text-[10px] tracking-[0.3em] uppercase"
                        >
                            Click anywhere to return
                        </motion.p>
                    </div>

                    {/* 装饰心形 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -20, x: 50 }}
                        animate={{ opacity: 0.8, scale: 1, rotate: 10, x: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 80,
                            delay: 3
                        }}
                        className="absolute top-[12%] right-[15%] text-6xl opacity-80"
                    >
                        🌸
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RoseEasterEgg;
