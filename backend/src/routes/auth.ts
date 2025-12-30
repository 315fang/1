import { Hono } from 'hono';
import { compareSync } from 'bcryptjs';

const auth = new Hono();

// 简单的密码验证
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 登录验证
auth.post('/login', async (c) => {
    try {
        const { password } = await c.req.json();

        // 简单密码比对（生产环境建议用 bcrypt hash）
        if (password === ADMIN_PASSWORD) {
            // 生成简单 token（生产环境建议用 JWT）
            const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

            return c.json({
                success: true,
                token,
                message: '登录成功'
            });
        }

        return c.json({ success: false, message: '密码错误' }, 401);
    } catch (error) {
        console.error('登录失败:', error);
        return c.json({ success: false, message: '登录失败' }, 500);
    }
});

// 验证 token 中间件
export const authMiddleware = async (c: any, next: () => Promise<void>) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: '未授权访问' }, 401);
    }

    const token = authHeader.substring(7);

    try {
        // 解码并验证 token（简单验证）
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        if (decoded.startsWith('admin:')) {
            await next();
            return;
        }
    } catch {
        // ignore
    }

    return c.json({ error: 'Token 无效' }, 401);
};

export default auth;
