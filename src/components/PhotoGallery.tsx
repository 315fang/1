import React from 'react';
import { motion } from 'framer-motion';
import { Photo } from '../types';
import { cn } from '../utils/cn';
import { useAppControl } from '../contexts/AppControlContext';

interface PhotoGalleryProps {
    photos: Photo[];
    isNight: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, isNight }) => {
    const { ui } = useAppControl();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-7xl mx-auto">
            {photos.map((photo, index) => (
                <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                    onClick={() => ui.openLightbox(index)}
                >
                    <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6",
                    )}>
                        <h3 className="text-white text-lg font-bold">{photo.title}</h3>
                        <p className="text-white/80 text-sm">{photo.date}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
