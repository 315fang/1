import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Target, Sparkles } from 'lucide-react';
import { Profile } from '../types';

interface CoupleHeaderProps {
    profile: Profile;
    isNight: boolean;
    onAvatarClick?: () => void; // 用于彩蛋触发
}

// 计算详细时间差
function calculateTimeDiff(startDate: string) {
    const start = new Date(startDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const totalDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
}

// 计算下一个里程碑
function getNextMilestone(totalDays: number) {
    const milestones = [100, 200, 365, 500, 730, 1000, 1095, 1461, 1825];
    const labels: Record<number, string> = {
        100: '100天纪念',
        200: '200天纪念',
        365: '一周年',
        500: '500天纪念',
        730: '两周年',
        1000: '1000天纪念',
        1095: '三周年',
        1461: '四周年',
        1825: '五周年'
    };

    for (const m of milestones) {
        if (totalDays < m) {
            return { target: m, label: labels[m], daysLeft: m - totalDays };
        }
    }
    // 超过5年，计算下一个周年
    const nextAnniversary = Math.ceil(totalDays / 365) * 365;
    return {
        target: nextAnniversary,
        label: `${Math.ceil(totalDays / 365)}周年`,
        daysLeft: nextAnniversary - totalDays
    };
}

// 环形进度条组件
const ProgressRing = ({ progress, isNight }: { progress: number; isNight: boolean }) => {
    const radius = 40;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* 背景圆 */}
            <circle
                stroke={isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            {/* 进度圆 */}
            <motion.circle
                stroke={isNight ? '#f59e0b' : '#ec4899'}
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                    strokeDasharray: `${circumference} ${circumference}`,
                }}
            />
        </svg>
    );
};

// 数字动画组件
const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return <span className={className}>{displayValue}</span>;
};

const CoupleHeader: React.FC<CoupleHeaderProps> = ({ profile, isNight, onAvatarClick }) => {
    const timeDiff = calculateTimeDiff(profile.together_date);
    const nextMilestone = getNextMilestone(timeDiff.totalDays);

    // 计算当前周年进度 (0-100)
    const yearProgress = ((timeDiff.totalDays % 365) / 365) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full flex flex-col items-center gap-6 py-12 md:py-20 transition-colors duration-1000 ${isNight ? 'text-white' : 'text-slate-800'}`}
        >
            {/* 头像区域 */}
            <div className="flex items-center gap-8 md:gap-12 relative">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group cursor-pointer"
                    onClick={onAvatarClick}
                >
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-xl ${isNight ? 'border-amber-500/20' : 'border-pink-200'}`}>
                        {profile.avatar1 ? (
                            <img src={profile.avatar1} alt={profile.name1} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-3xl ${isNight ? 'bg-zinc-800' : 'bg-slate-200'}`}>👦</div>
                        )}
                    </div>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-light tracking-widest whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                        {profile.name1}
                    </span>
                </motion.div>

                {/* 中间心形链接 + 进度环 */}
                <div className="flex flex-col items-center gap-2 z-10 relative">
                    {/* 进度环背景 */}
                    <div className="absolute">
                        <ProgressRing progress={yearProgress} isNight={isNight} />
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className={`p-3 rounded-full backdrop-blur-md shadow-lg ${isNight ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-500'}`}
                    >
                        <Heart fill="currentColor" size={24} />
                    </motion.div>
                    <div className={`h-[2px] w-20 absolute top-1/2 -translate-y-1/2 -z-10 ${isNight ? 'bg-gradient-to-r from-transparent via-amber-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-pink-400/30 to-transparent'}`}></div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group cursor-pointer"
                    onClick={onAvatarClick}
                >
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-xl ${isNight ? 'border-amber-500/20' : 'border-pink-200'}`}>
                        {profile.avatar2 ? (
                            <img src={profile.avatar2} alt={profile.name2} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-3xl ${isNight ? 'bg-zinc-800' : 'bg-slate-200'}`}>👧</div>
                        )}
                    </div>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-light tracking-widest whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                        {profile.name2}
                    </span>
                </motion.div>
            </div>

            {/* 增强版时间显示 */}
            <div className="flex flex-col items-center mt-8 gap-4">
                {/* 日期标签 */}
                <div className="flex items-center gap-2 opacity-50 text-xs tracking-[0.3em] uppercase">
                    <Calendar size={12} />
                    <span>Since {profile.together_date}</span>
                </div>

                {/* 主数字：总天数 */}
                <div className="relative">
                    <h1 className="text-6xl md:text-8xl font-thin tracking-tighter tabular-nums">
                        <AnimatedNumber value={timeDiff.totalDays} />
                    </h1>
                    <span className="absolute -right-8 bottom-4 text-lg opacity-40 font-serif italic">Days</span>
                </div>

                {/* 拆分显示：年月日 */}
                <div className={`flex gap-6 text-sm ${isNight ? 'text-white/60' : 'text-slate-600'}`}>
                    {timeDiff.years > 0 && (
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-light">{timeDiff.years}</span>
                            <span className="text-[10px] tracking-widest opacity-60">年</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-light">{timeDiff.months}</span>
                        <span className="text-[10px] tracking-widest opacity-60">月</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-light">{timeDiff.days}</span>
                        <span className="text-[10px] tracking-widest opacity-60">日</span>
                    </div>
                </div>

                {/* 里程碑倒计时 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs mt-2 ${isNight
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-pink-100 text-pink-600 border border-pink-200'
                        }`}
                >
                    <Target size={12} />
                    <span>距离 <strong>{nextMilestone.label}</strong> 还有</span>
                    <span className="font-mono font-bold">{nextMilestone.daysLeft}</span>
                    <span>天</span>
                    <Sparkles size={12} className="animate-pulse" />
                </motion.div>
            </div>

            <p className="text-sm md:text-base opacity-60 font-light italic max-w-md text-center leading-relaxed">
                "{profile.bio}"
            </p>
        </motion.div>
    );
};

export default CoupleHeader;

