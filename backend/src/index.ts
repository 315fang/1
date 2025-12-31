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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();

// CORS 配置 - 允许前端跨域访问
app.use('*', cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://maodian316.top',
        'https://www.maodian316.top',
        'https://api.maodian316.top',
        // Vercel 部署域名 (替换成你的实际 Vercel 域名)
        'https://1-315fangs-projects.vercel.app',
        'https://1-git-main-315fangs-projects.vercel.app',
        '*' // 开发阶段允许所有，生产可移除
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
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

// 为兼容前端现有代码，保留 /api/artworks 路由
app.get('/api/artworks', (c) => {
    // 重定向到 photos API，并转换字段名以兼容前端
    const photosData = photos.fetch(new Request('http://localhost/'));
    return photosData;
});

// 管理后台静态页面
app.get('/admin', (c) => {
    try {
        const adminHtml = readFileSync(join(__dirname, 'admin/index.html'), 'utf-8');
        return c.html(adminHtml);
    } catch (error) {
        return c.text('管理后台页面未找到', 404);
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
