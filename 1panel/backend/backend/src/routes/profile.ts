import { Hono } from 'hono';
import { profileDB } from '../db/database.js';

const profile = new Hono();

// 获取情侣信息
profile.get('/', (c) => {
    try {
        const profileData = profileDB.get();
        if (!profileData) {
            return c.json({ error: '未找到信息' }, 404);
        }

        // 计算在一起的天数
        const togetherDate = new Date(profileData.together_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - togetherDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return c.json({
            ...profileData,
            together_days: diffDays
        });
    } catch (error) {
        console.error('获取情侣信息失败:', error);
        return c.json({ error: '获取信息失败' }, 500);
    }
});

// 更新情侣信息（需要认证）
profile.put('/', async (c) => {
    try {
        const body = await c.req.json();
        profileDB.update(body);
        return c.json({ message: '信息更新成功' });
    } catch (error) {
        console.error('更新情侣信息失败:', error);
        return c.json({ error: '更新信息失败' }, 500);
    }
});

export default profile;
