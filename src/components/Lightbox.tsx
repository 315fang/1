import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface LightboxProps {
    image: string;
    title: string;
    onClose: () => void;
    layoutId?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ image, title, onClose, layoutId }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button
                className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-colors"
                onClick={onClose}
            >
                <X size={32} />
            </button>

            <motion.img
                layoutId={layoutId}
                src={image}
                alt={title}
                className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm selection:bg-transparent"
                style={{ pointerEvents: 'none' }}
                onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
                <p className="text-white/40 text-sm tracking-widest uppercase font-light">{title}</p>
            </div>
        </motion.div>
    );
};

export default Lightbox;
