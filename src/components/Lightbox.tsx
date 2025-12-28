import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// --- 类型定义 (与 App.tsx 保持一致或引入共享类型) ---
interface Artwork {
    id: number;
    title: string;
    enTitle: string;
    imageUrl: string;
    author: string;
    date: string;
    description: string;
    tags: string[];
}

interface LightboxProps {
    data: Artwork;
    onClose: () => void;
    layoutId?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ data, onClose, layoutId }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button
                className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-colors z-50"
                onClick={onClose}
            >
                <X size={32} />
            </button>

            <div className="flex flex-col md:flex-row max-w-7xl w-full h-full md:h-auto gap-8 items-center" onClick={(e) => e.stopPropagation()}>
                {/* 图片区域 */}
                <div className="w-full md:w-2/3 h-1/2 md:h-[80vh] flex items-center justify-center">
                    <motion.img
                        layoutId={layoutId}
                        src={data.imageUrl}
                        alt={data.title}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
                    />
                </div>

                {/* 信息区域 */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full md:w-1/3 text-white flex flex-col justify-center space-y-6 overflow-y-auto max-h-[40vh] md:max-h-none"
                >
                    <div>
                        <h2 className="text-4xl font-bold mb-2">{data.title}</h2>
                        <h3 className="text-xl text-white/40 font-light tracking-widest uppercase">{data.enTitle}</h3>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-white/60 border-t border-white/10 pt-6">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-white">{data.author}</span>
                        <span>{data.date}</span>
                    </div>

                    <p className="text-lg leading-relaxed text-white/80 font-light">
                        {data.description || "暂无描述"}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-4">
                        {data.tags.map(tag => (
                            <span key={tag} className="text-xs border border-white/20 px-2 py-1 rounded text-white/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Lightbox;
