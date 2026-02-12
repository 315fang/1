import React, { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/style';
import { AppSettings } from '../hooks/useSettings';
import { motion } from 'framer-motion';

interface CommentSectionProps {
    settings: AppSettings;
    isNight: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ settings, isNight }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const walineInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!settings.walineServerURL || !containerRef.current) return;

        // Initialize Waline
        walineInstanceRef.current = init({
            el: containerRef.current,
            serverURL: settings.walineServerURL,
            dark: isNight,
            path: window.location.pathname, // Use current path as identifier
            emoji: [
                '//unpkg.com/@waline/emojis@1.2.0/weibo',
                '//unpkg.com/@waline/emojis@1.2.0/bilibili',
            ],
        });

        return () => {
            if (walineInstanceRef.current?.destroy) {
                walineInstanceRef.current.destroy();
            }
        };
    }, [settings.walineServerURL, isNight]); // Re-init if URL or theme changes

    if (!settings.walineServerURL) {
        return (
            <div className="w-full max-w-4xl mx-auto p-8 text-center opacity-50">
                <p>Please configure Waline Server URL in settings to enable comments.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`w-full max-w-4xl mx-auto p-6 md:p-10 rounded-3xl backdrop-blur-md shadow-xl my-16 transition-colors ${isNight
                    ? 'bg-zinc-900/50 border border-white/5'
                    : 'bg-white/50 border border-white/40'
                }`}
        >
            <h2 className={`text-2xl font-light mb-8 text-center ${isNight ? 'text-white' : 'text-slate-800'}`}>
                Leave a Message
            </h2>
            <div ref={containerRef} className={isNight ? 'waline-dark-mode' : ''} />

            {/* Custom Styles Override for Waline to match app theme */}
            <style>{`
                :root {
                    --waline-theme-color: ${isNight ? '#f59e0b' : '#ec4899'} !important;
                    --waline-active-color: ${isNight ? '#fbbf24' : '#f472b6'} !important;
                    --waline-bgcolor: transparent !important;
                    --waline-bgcolor-light: ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)'} !important;
                    --waline-border-color: ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
                    --waline-disable-bgcolor: ${isNight ? 'rgba(255,255,255,0.05)' : '#f8f8f8'} !important;
                    --waline-disable-color: ${isNight ? 'rgba(255,255,255,0.2)' : '#bbb'} !important;
                    --waline-code-bgcolor: ${isNight ? '#282c34' : '#f8f8f8'} !important;
                    
                    /* Text Colors */
                    --waline-color: ${isNight ? '#e2e8f0' : '#334155'} !important;
                    --waline-info-color: ${isNight ? '#94a3b8' : '#64748b'} !important;
                }
                
                /* Hide Powered By if desired, or style it */
                .wl-power { opacity: 0.5; }
            `}</style>
        </motion.div>
    );
};
