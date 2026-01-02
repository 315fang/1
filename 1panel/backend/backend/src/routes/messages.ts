import { Hono } from 'hono';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../../data.db');

const db = new Database(DB_PATH);

// 确保 messages 表存在
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        effective_date TEXT DEFAULT (date('now', 'localtime')),
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
`);

// 插入默认留言（如果表为空）
const count = db.prepare('SELECT COUNT(*) as count FROM messages').get() as { count: number };
if (count.count === 0) {
    db.prepare(`INSERT INTO messages (content, effective_date) VALUES (?, ?)`).run(
        '欢迎来到我们的小世界！点击这里查看今日情话 💕',
        new Date().toISOString().split('T')[0]
    );
}

const messages = new Hono();

// 获取当前生效的最新留言
messages.get('/latest', (c) => {
    const today = new Date().toISOString().split('T')[0];

    // 获取今天或之前最近的生效留言
    const message = db.prepare(`
        SELECT * FROM messages 
        WHERE effective_date <= ? 
        ORDER BY effective_date DESC, id DESC 
        LIMIT 1
    `).get(today);

    if (!message) {
        return c.json({ content: '今日没有新留言，但我依然想你 💕' });
    }

    return c.json(message);
});

// 获取所有留言（管理用）
messages.get('/', (c) => {
    const allMessages = db.prepare('SELECT * FROM messages ORDER BY effective_date DESC').all();
    return c.json(allMessages);
});

// 创建新留言（需要认证，由 adminApi 包装）
messages.post('/', async (c) => {
    const body = await c.req.json();
    const { content, effective_date } = body;

    if (!content) {
        return c.json({ error: '留言内容不能为空' }, 400);
    }

    const result = db.prepare(`
        INSERT INTO messages (content, effective_date) VALUES (?, ?)
    `).run(content, effective_date || new Date().toISOString().split('T')[0]);

    return c.json({ id: result.lastInsertRowid, message: '创建成功' });
});

// 删除留言
messages.delete('/:id', (c) => {
    const id = c.req.param('id');
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return c.json({ message: '删除成功' });
});

export default messages;
