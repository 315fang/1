import { Hono } from 'hono';
import { photosDB } from '../db/database.js';

const photos = new Hono();

// 获取所有照片
photos.get('/', (c) => {
    try {
        const allPhotos = photosDB.getAll();
        return c.json(allPhotos);
    } catch (error) {
        console.error('获取照片失败:', error);
        return c.json({ error: '获取照片失败' }, 500);
    }
});

// 获取单个照片
photos.get('/:id', (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const photo = photosDB.getById(id);
        if (!photo) {
            return c.json({ error: '照片不存在' }, 404);
        }
        return c.json(photo);
    } catch (error) {
        console.error('获取照片失败:', error);
        return c.json({ error: '获取照片失败' }, 500);
    }
});

// 创建照片（需要认证）
photos.post('/', async (c) => {
    try {
        const body = await c.req.json();

        if (!body.title || !body.image_url || !body.date) {
            return c.json({ error: '缺少必填字段: title, image_url, date' }, 400);
        }

        const id = photosDB.create({
            title: body.title,
            en_title: body.en_title || '',
            image_url: body.image_url,
            description: body.description || '',
            date: body.date,
            tags: body.tags || []
        });

        return c.json({ id, message: '照片创建成功' }, 201);
    } catch (error) {
        console.error('创建照片失败:', error);
        return c.json({ error: '创建照片失败' }, 500);
    }
});

// 更新照片（需要认证）
photos.put('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'));
        const body = await c.req.json();

        const existing = photosDB.getById(id);
        if (!existing) {
            return c.json({ error: '照片不存在' }, 404);
        }

        photosDB.update(id, body);
        return c.json({ message: '照片更新成功' });
    } catch (error) {
        console.error('更新照片失败:', error);
        return c.json({ error: '更新照片失败' }, 500);
    }
});

// 删除照片（需要认证）
photos.delete('/:id', (c) => {
    try {
        const id = parseInt(c.req.param('id'));

        const existing = photosDB.getById(id);
        if (!existing) {
            return c.json({ error: '照片不存在' }, 404);
        }

        photosDB.delete(id);
        return c.json({ message: '照片删除成功' });
    } catch (error) {
        console.error('删除照片失败:', error);
        return c.json({ error: '删除照片失败' }, 500);
    }
});

export default photos;
