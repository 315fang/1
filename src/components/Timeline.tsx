import React from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '../types';
import { Heart, Star, Cake, Gift, Plane, Camera, LucideIcon } from 'lucide-react';

interface TimelineProps {
    events: TimelineEvent[];
    isNight: boolean;
}

const icons: Record<string, LucideIcon> = {
    heart: Heart,
    star: Star,
    cake: Cake,
    gift: Gift,
    plane: Plane,
    camera: Camera
};

const Timeline: React.FC<TimelineProps> = ({ events, isNight }) => {
    return (
        <div className="w-full max-w-5xl mx-auto py-32 px-4 md:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-24"
            >
                <h2 className={`text-3xl md:text-4xl font-serif tracking-widest mb-4 ${isNight ? 'text-white/90' : 'text-slate-800'}`}>
                    OUR JOURNEY
                </h2>
                <div className={`h-1 w-20 mx-auto ${isNight ? 'bg-amber-500/50' : 'bg-pink-400/50'}`} />
            </motion.div>

            <div className="relative">
                {/* --- 1. 中央贯穿线 (带流光效果) --- */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 overflow-hidden">
                    {/* 基础底色 */}
                    <div className={`w-full h-full ${isNight ? 'bg-white/10' : 'bg-slate-200'}`} />
                    {/* 流光动画 */}
                    <motion.div 
                        className={`absolute top-0 left-0 w-full h-[30%] ${isNight ? 'bg-gradient-to-b from-transparent via-amber-500 to-transparent' : 'bg-gradient-to-b from-transparent via-pink-400 to-transparent'}`}
                        animate={{ top: ['-30%', '130%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <div className="space-y-24"> {/* 增加垂直间距，避免拥挤 */}
                    {events.map((event, index) => {
                        const Icon = icons[event.icon] || Heart;
                        
                        // 修正逻辑：Index 0 (最新) 在左边，Index 1 在右边
                        // isRightSide = true 代表卡片在右边
                        const isRightSide = index % 2 !== 0; 

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`relative flex flex-col md:flex-row items-center ${isRightSide ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* --- 2. 内容卡片区域 (50% 宽度) --- */}
                                <div className={`flex-1 w-full pl-12 md:pl-0 ${isRightSide ? 'md:pr-16' : 'md:pl-16'}`}>
                                    <div className={`
                                        relative p-8 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group
                                        ${isNight 
                                            ? 'bg-white/5 border-white/10 hover:border-amber-500/30 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.1)]' 
                                            : 'bg-white/80 border-slate-100 shadow-sm hover:border-pink-200 hover:shadow-[0_10px_30px_-10px_rgba(244,114,182,0.2)]'
                                        }
                                    `}>
                                        {/* 装饰角标 */}
                                        <div className={`absolute top-0 w-16 h-16 opacity-20 transition-opacity group-hover:opacity-100
                                            ${isRightSide ? 'right-0 rounded-bl-full' : 'left-0 rounded-br-full'}
                                            ${isNight ? 'bg-gradient-to-br from-amber-500/20' : 'bg-gradient-to-br from-pink-400/20'}
                                        `} />

                                        {/* 日期标签 */}
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium tracking-widest mb-4
                                            ${isNight ? 'bg-amber-500/10 text-amber-300' : 'bg-pink-100 text-pink-600'}
                                        `}>
                                            {event.date}
                                        </div>

                                        <h3 className={`text-2xl font-normal mb-3 ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                            {event.title}
                                        </h3>
                                        
                                        {/* 核心修复：强制全部左对齐，保证阅读舒适度 */}
                                        <p className={`text-sm leading-7 font-light text-left ${isNight ? 'text-white/60' : 'text-slate-600'}`}>
                                            {event.description}
                                        </p>

                                        {/* ➡️ 横向连接线 (仅桌面版显示) */}
                                        {/* 这条线连接了卡片和中间的轴，解决了"卡片悬空"的问题 */}
                                        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-[1px] w-16 
                                            ${isRightSide ? '-right-16' : '-left-16'}
                                            ${isNight ? 'bg-gradient-to-r from-amber-500/50 to-transparent' : 'bg-gradient-to-r from-pink-400/50 to-transparent'}
                                            ${isRightSide ? 'rotate-180' : ''}
                                        `}>
                                            {/* 连接点 */}
                                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${isNight ? 'bg-amber-500' : 'bg-pink-400'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* --- 3. 中轴节点图标 --- */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    {/* 外发光光环 */}
                                    <motion.div 
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={`absolute w-14 h-14 rounded-full blur-md ${isNight ? 'bg-amber-500/30' : 'bg-pink-400/30'}`}
                                    />
                                    {/* 实体图标球 */}
                                    <div className={`
                                        relative w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 shadow-lg
                                        ${isNight ? 'bg-[#18181b] border-amber-500 text-amber-500' : 'bg-white border-pink-400 text-pink-500'}
                                    `}>
                                        <Icon size={20} fill="currentColor" />
                                    </div>
                                </div>

                                {/* --- 4. 占位符 (保持左右平衡) --- */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center mt-32">
                <p className={`text-xs tracking-[0.5em] uppercase opacity-40 ${isNight ? 'text-white' : 'text-slate-800'}`}>
                    To Be Continued...
                </p>
            </div>
        </div>
    );
};

export default Timeline;
