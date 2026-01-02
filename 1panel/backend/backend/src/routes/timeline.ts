import { Hono } from 'hono';
import { timelineDB } from '../db/database.js';

const timeline = new Hono();

// 获取所有时间轴事件
timeline.get('/', (c) => {
    try {
        const events = timelineDB.getAll();
        return c.json(events);
    } catch (error) {
        console.error('获取时间轴失败:', error);
        return c.json({ error: '获取时间轴失败' }, 500);
    }
});

// 创建时间轴事件（需要认证）
timeline.post('/', async (c) => {
    try {
        const body = await c.req.json();

        if (!body.title || !body.date) {
            return c.json({ error: '缺少必填字段: title, date' }, 400);
        }

        const id = timelineDB.create({
            title: body.title,
            description: body.description || '',
            date: body.date,
            icon: body.icon || 'heart',
            photo_id: body.photo_id || null
        });

        return c.json({ id, message: '事件创建成功' }, 201);
    } catch (error) {
        console.error('创建时间轴事件失败:', error);
        return c.json({ error: '创建事件失败' }, 500);
    }
});

// 更新时间轴事件（需要认证）
timeline.put('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        timelineDB.update(id, body);
        return c.json({ message: '事件更新成功' });
    } catch (error) {
        console.error('更新时间轴事件失败:', error);
        return c.json({ error: '更新事件失败' }, 500);
    }
});

// 删除时间轴事件（需要认证）
timeline.delete('/:id', (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        timelineDB.delete(id);
        return c.json({ message: '事件删除成功' });
    } catch (error) {
        console.error('删除时间轴事件失败:', error);
        return c.json({ error: '删除事件失败' }, 500);
    }
});

export default timeline;
