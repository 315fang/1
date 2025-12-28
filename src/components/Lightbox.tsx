import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface LightboxProps {
    image: string;
    title?: string;
    onClose: () => void;
    layoutId?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ image, title = "作品详情", onClose, layoutId }) => {
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
                        src={image}
                        alt={title}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
                    />
                </div>

                {/* 信息区域 - 简化版 */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full md:w-1/3 text-white flex flex-col justify-center"
                >
                    <div>
                        <h2 className="text-4xl font-bold mb-2">{title}</h2>
                    </div>

                    <p className="text-lg leading-relaxed text-white/80 font-light mt-6">
                        点击背景或右上角 X 关闭
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Lightbox;
