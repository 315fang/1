import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface LightboxProps {
    image: string;
    title?: string;
    onClose: () => void;
    layoutId?: string;
    photo?: import('../types').Photo;
}

const Lightbox: React.FC<LightboxProps> = ({ image, title, onClose, layoutId, photo }) => {
    // 如果传入了 photo 对象，优先使用 photo 的数据
    const description = photo?.description || "暂无描述";
    const date = photo?.date || "";
    const tags = photo?.tags || [];
    const enTitle = photo?.enTitle || "";

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button
                className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-colors z-50 rounded-full hover:bg-white/10"
                onClick={onClose}
            >
                <X size={32} />
            </button>

            <div className="flex flex-col lg:flex-row max-w-7xl w-full h-full lg:h-[85vh] gap-8 items-center justify-center pointer-events-none" onClick={(e) => e.stopPropagation()}>
                {/* 图片区域 */}
                <div className="w-full lg:w-2/3 h-1/2 lg:h-full flex items-center justify-center pointer-events-auto">
                    <motion.img
                        layoutId={layoutId}
                        src={image}
                        alt={title}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
                    />
                </div>

                {/* 信息区域 - 增强版 */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-1/3 text-white flex flex-col justify-center h-1/2 lg:h-auto overflow-y-auto pointer-events-auto p-4 lg:p-0"
                >
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 opacity-60 mb-2">
                                <span className="text-xs tracking-[0.2em] uppercase">{date}</span>
                                <div className="h-[1px] flex-1 bg-white/20"></div>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-light mb-1">{title}</h2>
                            {enTitle && <h3 className="text-xl italic text-white/40 font-serif">{enTitle}</h3>}
                        </div>

                        <div className="h-[1px] w-12 bg-amber-500/50"></div>

                        <p className="text-lg leading-relaxed text-white/80 font-light/300">
                            {description}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-4">
                            {tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 tracking-wider">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Lightbox;
