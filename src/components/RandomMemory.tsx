import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, X, Calendar, Camera } from 'lucide-react';
import { Photo, TimelineEvent } from '../types';

interface RandomMemoryProps {
    photos: Photo[];
    timeline: TimelineEvent[];
    isNight: boolean;
}

type MemoryItem = {
    type: 'photo' | 'timeline';
    data: Photo | TimelineEvent;
};

const RandomMemory: React.FC<RandomMemoryProps> = ({ photos, timeline, isNight }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<MemoryItem | null>(null);

    // 合并所有可选项
    const allMemories = useMemo(() => {
        const items: MemoryItem[] = [
            ...photos.map(p => ({ type: 'photo' as const, data: p })),
            ...timeline.map(t => ({ type: 'timeline' as const, data: t }))
        ];
        return items;
    }, [photos, timeline]);

    const handleSpin = () => {
        if (allMemories.length === 0) return;

        setIsSpinning(true);
        setResult(null);

        // 模拟老虎机滚动效果
        let spinCount = 0;
        const maxSpins = 15;

        const spinInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * allMemories.length);
            setResult(allMemories[randomIndex]);
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                setIsSpinning(false);
                // 最终随机结果
                const finalIndex = Math.floor(Math.random() * allMemories.length);
                setResult(allMemories[finalIndex]);

                // 震动反馈
                if (navigator.vibrate) {
                    navigator.vibrate([50, 30, 50]);
                }
            }
        }, 100);
    };

    const isPhoto = (item: MemoryItem): item is { type: 'photo'; data: Photo } =>
        item.type === 'photo';

    return (
        <>
            {/* 触发按钮 */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg ${isNight
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-amber-500/30'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-pink-500/30'
                    } hover:shadow-xl`}
            >
                <Shuffle size={16} />
                <span>今日幸运回忆</span>
            </motion.button>

            {/* 弹窗 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => !isSpinning && setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className={`relative w-[90%] max-w-md p-8 rounded-3xl shadow-2xl ${isNight
                                ? 'bg-zinc-900 border border-white/10'
                                : 'bg-white border border-slate-200'
                                }`}
                        >
                            {/* 关闭按钮 */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isNight ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-400'
                                    }`}
                            >
                                <X size={20} />
                            </button>

                            {/* 标题 */}
                            <div className="text-center mb-6">
                                <h2 className={`text-2xl font-light mb-2 ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                    🎰 今日幸运回忆
                                </h2>
                                <p className={`text-sm ${isNight ? 'text-white/50' : 'text-slate-500'}`}>
                                    点击下方按钮，随机抽取一段美好回忆
                                </p>
                            </div>

                            {/* 结果展示区 */}
                            <div className={`relative min-h-[200px] rounded-2xl mb-6 overflow-hidden ${isNight ? 'bg-zinc-800' : 'bg-slate-100'
                                }`}>
                                <AnimatePresence mode="wait">
                                    {result ? (
                                        <motion.div
                                            key={isSpinning ? 'spinning' : 'result'}
                                            initial={{ opacity: 0, y: 20, rotateX: -90 }}
                                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                            exit={{ opacity: 0, y: -20, rotateX: 90 }}
                                            transition={{ duration: isSpinning ? 0.08 : 0.3 }}
                                            className="p-6"
                                        >
                                            {isPhoto(result) ? (
                                                // 照片类型
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-full h-32 rounded-xl overflow-hidden">
                                                        <img
                                                            src={result.data.imageUrl}
                                                            alt={result.data.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2">
                                                            <Camera size={14} className={isNight ? 'text-amber-400' : 'text-pink-500'} />
                                                            <span className={`text-xs ${isNight ? 'text-white/40' : 'text-slate-400'}`}>照片回忆</span>
                                                        </div>
                                                        <h3 className={`text-lg font-medium ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                                            {result.data.title}
                                                        </h3>
                                                        <p className={`text-xs mt-1 ${isNight ? 'text-white/50' : 'text-slate-500'}`}>
                                                            {result.data.date}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                // 时间轴类型
                                                <div className="flex flex-col items-center gap-4 py-4">
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isNight ? 'bg-amber-500/20' : 'bg-pink-100'
                                                        }`}>
                                                        {(result.data as TimelineEvent).icon === 'heart' && '❤️'}
                                                        {(result.data as TimelineEvent).icon === 'star' && '⭐'}
                                                        {(result.data as TimelineEvent).icon === 'cake' && '🎂'}
                                                        {(result.data as TimelineEvent).icon === 'gift' && '🎁'}
                                                        {(result.data as TimelineEvent).icon === 'plane' && '✈️'}
                                                        {(result.data as TimelineEvent).icon === 'camera' && '📷'}
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2">
                                                            <Calendar size={14} className={isNight ? 'text-amber-400' : 'text-pink-500'} />
                                                            <span className={`text-xs ${isNight ? 'text-white/40' : 'text-slate-400'}`}>时间轴事件</span>
                                                        </div>
                                                        <h3 className={`text-lg font-medium ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                                            {(result.data as TimelineEvent).title}
                                                        </h3>
                                                        <p className={`text-sm mt-2 ${isNight ? 'text-white/60' : 'text-slate-600'}`}>
                                                            {(result.data as TimelineEvent).description}
                                                        </p>
                                                        <p className={`text-xs mt-2 ${isNight ? 'text-white/40' : 'text-slate-400'}`}>
                                                            {result.data.date}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center h-[200px]"
                                        >
                                            <span className={`text-6xl ${isSpinning ? 'animate-bounce' : ''}`}>🎲</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* 闪光效果 */}
                                {!isSpinning && result && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                                    />
                                )}
                            </div>

                            {/* 抽取按钮 */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSpin}
                                disabled={isSpinning || allMemories.length === 0}
                                className={`w-full py-4 rounded-xl font-medium text-white transition-all ${isSpinning
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : isNight
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                                    }`}
                            >
                                {isSpinning ? '抽取中...' : result ? '再抽一次' : '开始抽取'}
                            </motion.button>

                            {allMemories.length === 0 && (
                                <p className={`text-center text-sm mt-4 ${isNight ? 'text-white/40' : 'text-slate-400'}`}>
                                    暂无回忆可以抽取
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RandomMemory;
