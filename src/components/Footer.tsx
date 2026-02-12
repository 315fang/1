import React from 'react';
import { cn } from '../utils/cn';

interface FooterProps {
    isNight: boolean;
    siteSettings: any;
    startTime: string;
}

export const Footer: React.FC<FooterProps> = ({ isNight, siteSettings, startTime }) => {
    return (
        <footer className={cn(
            "py-12 text-center",
            isNight ? "text-white/40" : "text-slate-400"
        )}>
            <div className="mb-4">
                <p className="text-sm font-serif italic">
                    {siteSettings?.footer_text || "Forever & Always"}
                </p>
            </div>
            <div className="text-xs tracking-widest uppercase opacity-60">
                © {new Date().getFullYear()} {siteSettings?.site_title || "Love Space"}
            </div>
        </footer>
    );
};
