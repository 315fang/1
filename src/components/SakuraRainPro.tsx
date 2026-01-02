import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 定义三种不同形态的花瓣 SVG，打破单调
const petalShapes = [
    "M12 4C10 4 8 5 6 7C6 7 9 10 12 13C15 10 18 7 18 7C16 5 14 4 12 4Z", // 标准心形
    "M12 2C9 2 6 4 6 8C6 11 12 18 12 18C12 18 18 11 18 8C18 4 15 2 12 2Z", // 细长形
    "M12 5C10 5 4 6 4 10C4 13 12 18 12 18C12 18 20 13 20 10C20 6 14 5 12 5Z"  // 宽胖形
];

// 🌸 单个花瓣组件
const Petal = ({ id }: { id: number }) => {
    // 随机生成初始参数
    const randomStart = Math.random() * 100; // 0-100vw
    const randomDuration = 8 + Math.random() * 7; // 8-15秒飘落时长 (慢才有感觉)
    const randomDelay = Math.random() * 5; 
    const randomScale = 0.5 + Math.random() * 0.8; // 大小差异
    const shape = petalShapes[Math.floor(Math.random() * petalShapes.length)];
    
    // 随机颜色：淡粉、深粉、稍微带点白
    const colors = ['#fce7f3', '#fbcfe8', '#f9a8d4', '#fff1f2'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return (
        <motion.div
            className="fixed top-[-50px] z-[10] pointer-events-none"
            style={{ 
                left: `${randomStart}vw`,
                color: color
            }}
            initial={{ 
                y: -100, 
                opacity: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0 
            }}
            animate={{ 
                y: "110vh", // 飘到底部
                opacity: [0, 1, 1, 0], // 淡入 -> 保持 -> 淡出
                x: [
                    0, 
                    (Math.random() - 0.5) * 200, // 左右大幅度摆动
                    (Math.random() - 0.5) * 300 
                ],
                // 关键：3D 翻滚效果
                rotateX: Math.random() * 720, 
                rotateY: Math.random() * 720,
                rotateZ: Math.random() * 360
            }}
            transition={{
                duration: randomDuration,
                delay: randomDelay,
                ease: "linear", // Y轴线性，X轴和旋转用下面的 times 控制节奏
                repeat: Infinity,
                repeatDelay: Math.random() * 3 // 错开重复时间
            }}
        >
            <svg 
                width={24 * randomScale} 
                height={24 * randomScale} 
                viewBox="0 0 24 24" 
                fill="currentColor"
                style={{
                    filter: Math.random() > 0.7 ? 'blur(1px)' : 'none' // 30%的花瓣加一点模糊，模拟景深
                }}
            >
                <path d={shape} />
            </svg>
        </motion.div>
    );
};

// 🌧️ 雨控制器
export const SakuraRainPro = ({ isActive }: { isActive: boolean }) => {
    const [petals, setPetals] = useState<number[]>([]);

    useEffect(() => {
        if (isActive) {
            // 生成 30 片花瓣 (不用太多，注重质量)
            setPetals(Array.from({ length: 30 }).map((_, i) => i));
        } else {
            setPetals([]);
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
            <AnimatePresence>
                {petals.map((i) => (
                    <Petal key={i} id={i} />
                ))}
            </AnimatePresence>
            
            {/* 增加一点环境光晕，让粉色更梦幻 */}
            <div className="absolute inset-0 bg-pink-500/5 mix-blend-overlay pointer-events-none" />
        </div>
    );
};
