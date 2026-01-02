import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoseEasterEggProps {
    isActive: boolean;
    onClose: () => void;
    message?: string;
}

// 玫瑰花瓣组件
const RosePetal = ({ delay, rotation, scale }: { delay: number; rotation: number; scale: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0, rotate: rotation - 30 }}
        animate={{
            opacity: [0, 1, 1, 0.8],
            scale: [0, scale, scale * 1.1, scale],
            rotate: rotation
        }}
        transition={{
            duration: 1.5,
            delay,
            times: [0, 0.3, 0.6, 1],
            ease: "easeOut"
        }}
        className="absolute"
        style={{
            width: 60 * scale,
            height: 80 * scale,
            background: `radial-gradient(ellipse at 50% 100%, #ff1744 0%, #d50000 40%, #b71c1c 100%)`,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            transformOrigin: 'bottom center',
            boxShadow: '0 0 20px rgba(255, 23, 68, 0.5)',
        }}
    />
);

// 金色粒子
const GoldParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
        animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: x,
            y: y
        }}
        transition={{ duration: 2, delay, ease: "easeOut" }}
        className="absolute w-2 h-2 rounded-full bg-amber-400"
        style={{
            boxShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24',
        }}
    />
);

const RoseEasterEgg: React.FC<RoseEasterEggProps> = ({
    isActive,
    onClose,
    message = "我爱你 ❤️"
}) => {
    // 生成花瓣
    const petals = useMemo(() => {
        const count = 12;
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            delay: i * 0.08,
            rotation: (360 / count) * i,
            scale: 0.7 + Math.random() * 0.5,
        }));
    }, []);

    // 生成金色粒子
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300 - 100,
            delay: 0.5 + Math.random() * 1,
        }));
    }, []);

    // 触发震动
    useEffect(() => {
        if (isActive && navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }, [isActive]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[2000] flex items-center justify-center cursor-pointer"
                    onClick={onClose}
                >
                    {/* 深色背景 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/90"
                    />

                    {/* 聚光灯效果 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute w-[600px] h-[600px] rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,23,68,0.3) 0%, transparent 70%)',
                        }}
                    />

                    {/* 金色粒子 */}
                    <div className="absolute">
                        {particles.map(p => (
                            <GoldParticle key={p.id} x={p.x} y={p.y} delay={p.delay} />
                        ))}
                    </div>

                    {/* 玫瑰花 */}
                    <div className="relative flex items-center justify-center">
                        {/* 花瓣层 */}
                        {petals.map(petal => (
                            <RosePetal
                                key={petal.id}
                                delay={petal.delay}
                                rotation={petal.rotation}
                                scale={petal.scale}
                            />
                        ))}

                        {/* 花蕊 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            className="absolute w-8 h-8 rounded-full z-10"
                            style={{
                                background: 'radial-gradient(circle, #ffeb3b 0%, #ff9800 100%)',
                                boxShadow: '0 0 30px #ffeb3b',
                            }}
                        />
                    </div>

                    {/* 表白文案 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.5 }}
                        className="absolute bottom-[20%] text-center"
                    >
                        <h1
                            className="text-4xl md:text-6xl font-serif text-white mb-4"
                            style={{
                                textShadow: '0 0 30px rgba(255,23,68,0.8), 0 0 60px rgba(255,23,68,0.4)',
                            }}
                        >
                            {message}
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 2.5 }}
                            className="text-white/60 text-sm tracking-widest"
                        >
                            点击任意处关闭
                        </motion.p>
                    </motion.div>

                    {/* 心形装饰 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 1],
                            scale: [0, 1.2, 1],
                        }}
                        transition={{ duration: 1, delay: 2 }}
                        className="absolute top-[15%] text-6xl"
                    >
                        💕
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RoseEasterEgg;
