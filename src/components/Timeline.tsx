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
        <div className="w-full max-w-4xl mx-auto py-20 px-6">
            <h2 className={`text-center text-2xl font-light mb-16 tracking-[0.2em] ${isNight ? 'text-white/80' : 'text-slate-600'}`}>
                OUR JOURNEY
            </h2>

            <div className="relative">
                {/* 垂直参考线 */}
                <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 ${isNight ? 'bg-gradient-to-b from-transparent via-white/20 to-transparent' : 'bg-gradient-to-b from-transparent via-slate-300 to-transparent'}`} />

                <div className="space-y-12">
                    {events.map((event, index) => {
                        const Icon = icons[event.icon] || Heart;
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* 内容卡片 */}
                                <div className="flex-1 pl-12 md:pl-0 md:px-12">
                                    <div className={`p-6 rounded-2xl border backdrop-blur-sm relative group hover:scale-[1.02] transition-transform duration-300
                                        ${isNight ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-100 shadow-sm'}
                                        ${isEven ? 'text-left' : 'md:text-right text-left'}
                                    `}>
                                        <span className={`text-xs font-mono opacity-50 mb-2 block ${isNight ? 'text-amber-200' : 'text-pink-500'}`}>
                                            {event.date}
                                        </span>
                                        <h3 className={`text-xl font-medium mb-2 ${isNight ? 'text-white' : 'text-slate-800'}`}>
                                            {event.title}
                                        </h3>
                                        {event.description && (
                                            <p className={`text-sm leading-relaxed ${isNight ? 'text-white/60' : 'text-slate-500'}`}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* 中轴图标 */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10
                                        ${isNight ? 'bg-[#050508] border-amber-500/50 text-amber-500' : 'bg-[#f0f4f8] border-pink-400 text-pink-500'}
                                    `}>
                                        <Icon size={14} fill={event.icon === 'heart' ? 'currentColor' : 'none'} />
                                    </div>
                                </div>

                                {/* 占位符 (让布局平衡) */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center mt-20 opacity-30 text-xs tracking-widest">
                TO BE CONTINUED...
            </div>
        </div>
    );
};

export default Timeline;
