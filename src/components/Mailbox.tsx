import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Heart } from 'lucide-react';

interface MailboxProps {
    isNight: boolean;
    apiBaseUrl?: string;
}

interface Message {
    id?: number;
    content: string;
    effective_date?: string;
}

const Mailbox: React.FC<MailboxProps> = ({ isNight, apiBaseUrl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // 获取留言
    const fetchMessage = async () => {
        setIsLoading(true);
        try {
            const baseUrl = apiBaseUrl || (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://api.maodian316.top/api');
            const response = await fetch(`${baseUrl}/messages/latest`);
            if (response.ok) {
                const data = await response.json();
                setMessage(data);
            }
        } catch (error) {
            console.error('获取留言失败:', error);
            setMessage({ content: '今天也要开心哦！💕' });
        } finally {
            setIsLoading(false);
        }
    };

    // 打字机效果
    useEffect(() => {
        if (isOpen && message && !isTyping) {
            setIsTyping(true);
            setDisplayText('');

            const text = message.content;
            let index = 0;

            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    setDisplayText(text.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(typeInterval);
                    setIsTyping(false);
                }
            }, 50);

            return () => clearInterval(typeInterval);
        }
    }, [isOpen, message]);

    // 打开信箱时获取留言
    const handleOpen = () => {
        setIsOpen(true);
        if (!message) {
            fetchMessage();
        }
    };

    return (
        <>
            {/* 浮动信封按钮 */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpen}
                className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${isNight
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                style={{
                    boxShadow: isNight
                        ? '0 0 20px rgba(245, 158, 11, 0.4)'
                        : '0 0 20px rgba(236, 72, 153, 0.4)'
                }}
            >
                <Mail size={24} />

                {/* 新消息提示点 */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                />
            </motion.button>

            {/* 信封弹窗 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        {/* 信封容器 */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10, y: 100 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            exit={{ scale: 0, rotate: 10, y: 100 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-[90%] max-w-md"
                        >
                            {/* 信封主体 */}
                            <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${isNight ? 'bg-zinc-800' : 'bg-amber-50'
                                }`}>
                                {/* 信封盖（装饰） */}
                                <motion.div
                                    initial={{ rotateX: 0 }}
                                    animate={{ rotateX: 180 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className={`absolute top-0 left-0 right-0 h-20 origin-top ${isNight
                                        ? 'bg-gradient-to-b from-zinc-700 to-zinc-800'
                                        : 'bg-gradient-to-b from-amber-200 to-amber-100'
                                        }`}
                                    style={{
                                        clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                        transformStyle: 'preserve-3d',
                                        backfaceVisibility: 'hidden'
                                    }}
                                />

                                {/* 蜡封章 */}
                                <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${isNight ? 'bg-red-700' : 'bg-red-600'
                                            }`}>
                                            <Heart size={20} className="text-white" fill="white" />
                                        </div>
                                    </motion.div>
                                </div>

                                {/* 信纸内容 */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="pt-16 pb-8 px-8"
                                >
                                    {/* 关闭按钮 */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isNight ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/10 text-slate-400'
                                            }`}
                                    >
                                        <X size={20} />
                                    </button>

                                    {/* 标题 */}
                                    <div className="text-center mb-6">
                                        <h2 className={`text-xl font-serif ${isNight ? 'text-amber-300' : 'text-amber-800'}`}>
                                            💌 今日情话
                                        </h2>
                                        {message?.effective_date && (
                                            <p className={`text-xs mt-1 ${isNight ? 'text-white/40' : 'text-slate-400'}`}>
                                                {message.effective_date}
                                            </p>
                                        )}
                                    </div>

                                    {/* 留言内容 */}
                                    <div className={`min-h-[120px] p-6 rounded-xl ${isNight ? 'bg-zinc-900/50' : 'bg-white/80'
                                        }`}>
                                        {isLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className={`w-8 h-8 border-2 rounded-full ${isNight ? 'border-amber-500 border-t-transparent' : 'border-pink-500 border-t-transparent'
                                                        }`}
                                                />
                                            </div>
                                        ) : (
                                            <p className={`text-center text-lg leading-relaxed font-light ${isNight ? 'text-white/90' : 'text-slate-700'
                                                }`}>
                                                {displayText}
                                                {isTyping && (
                                                    <motion.span
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                        className={isNight ? 'text-amber-400' : 'text-pink-500'}
                                                    >
                                                        |
                                                    </motion.span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    {/* 签名 */}
                                    <div className="text-right mt-6">
                                        <p className={`text-sm italic ${isNight ? 'text-white/40' : 'text-slate-400'}`}>
                                            —— 永远爱你的 TA
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Mailbox;
