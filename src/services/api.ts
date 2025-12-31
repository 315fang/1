import { Photo, Profile, TimelineEvent } from '../types';

// API 地址配置
// - 本地开发: 使用 localhost:3001
// - 生产环境: 使用 https://api.maodian316.top
const API_BASE_URL = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://api.maodian316.top/api');

export const api = {
    // 获取照片列表
    getPhotos: async (): Promise<Photo[]> => {
        const response = await fetch(`${API_BASE_URL}/photos`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();

        // Map backend snake_case to frontend camelCase if needed
        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            enTitle: item.en_title,
            imageUrl: item.image_url,
            date: item.date,
            description: item.description,
            tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
            author: '我们' // Default author
        }));
    },

    // 获取情侣信息
    getProfile: async (): Promise<Profile> => {
        const response = await fetch(`${API_BASE_URL}/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    },

    // 获取时间轴
    getTimeline: async (): Promise<TimelineEvent[]> => {
        const response = await fetch(`${API_BASE_URL}/timeline`);
        if (!response.ok) throw new Error('Failed to fetch timeline');
        return await response.json();
    }
};
