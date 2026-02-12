import React from 'react';
import { motion } from 'framer-motion';

export const FloatingHeart: React.FC = () => {
    return (
        <motion.div
            className="fixed pointer-events-none z-50 text-pink-500"
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 1, 0] }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity, repeatDelay: Math.random() * 3 }}
        >
            ❤️
        </motion.div>
    );
};
