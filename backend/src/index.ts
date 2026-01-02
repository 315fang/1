import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

import photos from './routes/photos.js';
import profile from './routes/profile.js';
import timeline from './routes/timeline.js';
import auth, { authMiddleware } from './routes/auth.js';
import upload from './routes/upload.js';
import messages from './routes/messages.js';
import settings from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();

// CORS 配置 - 允许前端跨域访问
app.use('*', cors({
    origin: (origin) => {
        // 允许所有来源（开发阶段）
        // 生产环境可以改成白名单验证
        return origin || '*';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// 健康检查
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 公开 API（无需认证）
app.route('/api/photos', photos);
app.route('/api/profile', profile);
app.route('/api/timeline', timeline);
app.route('/api/auth', auth);
app.route('/api/messages', messages);
app.route('/api/settings', settings);

// 为兼容前端现有代码，保留 /api/artworks 路由
app.get('/api/artworks', (c) => {
    // 重定向到 photos API，并转换字段名以兼容前端
    const photosData = photos.fetch(new Request('http://localhost/'));
    return photosData;
});

// 管理后台静态页面
app.get('/admin', (c) => {
    try {
        // 使用 process.cwd() 获取项目根目录，确保无论在 src 还是 dist 下运行都能找到文件
        const adminHtml = readFileSync(join(process.cwd(), 'src/admin/index.html'), 'utf-8');
        return c.html(adminHtml);
    } catch (error) {
        console.error('Admin Error:', error);
        return c.text('管理后台页面未找到，请检查 src/admin/index.html 是否存在', 404);
    }
});

// 需要认证的管理 API
const adminApi = new Hono();
adminApi.use('*', authMiddleware);

// 照片管理（需认证）
adminApi.post('/photos', async (c) => {
    const req = new Request(c.req.url, { method: 'POST', body: JSON.stringify(await c.req.json()), headers: { 'Content-Type': 'application/json' } });
    return photos.fetch(req);
});
adminApi.put('/photos/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { photosDB } = await import('./db/database.js');
    photosDB.update(parseInt(id), body);
    return c.json({ message: '更新成功' });
});
adminApi.delete('/photos/:id', async (c) => {
    const id = c.req.param('id');
    const { photosDB } = await import('./db/database.js');
    photosDB.delete(parseInt(id));
    return c.json({ message: '删除成功' });
});

// 情侣信息管理（需认证）
adminApi.put('/profile', async (c) => {
    const body = await c.req.json();
    const { profileDB } = await import('./db/database.js');
    profileDB.update(body);
    return c.json({ message: '更新成功' });
});

// 时间轴管理（需认证）
adminApi.post('/timeline', async (c) => {
    const body = await c.req.json();
    const { timelineDB } = await import('./db/database.js');
    const id = timelineDB.create(body);
    return c.json({ id, message: '创建成功' });
});
adminApi.put('/timeline/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { timelineDB } = await import('./db/database.js');
    timelineDB.update(parseInt(id), body);
    return c.json({ message: '更新成功' });
});
adminApi.delete('/timeline/:id', async (c) => {
    const id = c.req.param('id');
    const { timelineDB } = await import('./db/database.js');
    timelineDB.delete(parseInt(id));
    return c.json({ message: '删除成功' });
});

// 图片上传（需认证）
adminApi.route('/upload', upload);

// 设置管理（需认证）
adminApi.put('/settings/:key', async (c) => {
    const key = c.req.param('key');
    const body = await c.req.json();
    const value = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);

    const Database = (await import('better-sqlite3')).default;
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const db = new Database(join(__dirname, '../data.db'));

    db.prepare(`
        INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now', 'localtime'))
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now', 'localtime')
    `).run(key, value, value);

    return c.json({ success: true, message: '设置已更新' });
});

// 留言管理（需认证）
adminApi.post('/messages', async (c) => {
    const body = await c.req.json();
    const { content, effective_date } = body;

    const Database = (await import('better-sqlite3')).default;
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const db = new Database(join(__dirname, '../data.db'));

    const result = db.prepare(`
        INSERT INTO messages (content, effective_date) VALUES (?, ?)
    `).run(content, effective_date || new Date().toISOString().split('T')[0]);

    return c.json({ id: result.lastInsertRowid, message: '创建成功' });
});

adminApi.delete('/messages/:id', async (c) => {
    const id = c.req.param('id');

    const Database = (await import('better-sqlite3')).default;
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const db = new Database(join(__dirname, '../data.db'));

    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return c.json({ message: '删除成功' });
});

app.route('/api/admin', adminApi);

// 启动服务
const port = parseInt(process.env.PORT || '3001');

console.log(`
╔═══════════════════════════════════════════════════╗
║   💕 情侣展示网站后端服务                          ║
╠═══════════════════════════════════════════════════╣
║   🚀 服务已启动: http://localhost:${port}            ║
║   📡 API 地址:   http://localhost:${port}/api        ║
║   🔧 管理后台:   http://localhost:${port}/admin      ║
╚═══════════════════════════════════════════════════╝
`);

serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0', // 监听所有网络接口，允许外部访问
});
