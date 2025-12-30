import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar } from 'lucide-react';
import { Profile } from '../types';

interface CoupleHeaderProps {
    profile: Profile;
    isNight: boolean;
}

const CoupleHeader: React.FC<CoupleHeaderProps> = ({ profile, isNight }) => {
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
                    className="relative group"
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

                {/* 中间心形链接 */}
                <div className="flex flex-col items-center gap-2 z-10">
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
                    className="relative group"
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

            {/* 计数器 */}
            <div className="flex flex-col items-center mt-4">
                <div className="flex items-center gap-2 opacity-50 text-xs tracking-[0.3em] mb-2 uppercase">
                    <Calendar size={12} />
                    <span>Loving Since {profile.together_date}</span>
                </div>
                <div className="relative">
                    <h1 className="text-6xl md:text-8xl font-thin tracking-tighter tabular-nums">
                        {profile.together_days}
                    </h1>
                    <span className="absolute -right-8 bottom-4 text-lg opacity-40 font-serif italic">Days</span>
                </div>
            </div>

            <p className="text-sm md:text-base opacity-60 font-light italic max-w-md text-center leading-relaxed">
                "{profile.bio}"
            </p>
        </motion.div>
    );
};

export default CoupleHeader;
