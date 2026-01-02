import { Hono } from 'hono';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../../data.db');

const db = new Database(DB_PATH);

// 确保 settings 表存在
db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
`);

// 默认配置
const defaultSettings: Record<string, any> = {
    easter_egg_message: '我永远爱你 ❤️',
    music_playlist: JSON.stringify([
        {
            id: 1,
            title: '告白气球',
            artist: '周杰伦',
            url: 'https://music.163.com/song/media/outer/url?id=418602084.mp3',
            cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
        }
    ])
};

// 初始化默认设置
for (const [key, value] of Object.entries(defaultSettings)) {
    const exists = db.prepare('SELECT 1 FROM settings WHERE key = ?').get(key);
    if (!exists) {
        db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(
            key,
            typeof value === 'string' ? value : JSON.stringify(value)
        );
    }
}

const settings = new Hono();

// 获取所有设置（公开）
settings.get('/', (c) => {
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const result: Record<string, any> = {};

    for (const row of rows) {
        // 尝试解析 JSON
        try {
            result[row.key] = JSON.parse(row.value);
        } catch {
            result[row.key] = row.value;
        }
    }

    return c.json(result);
});

// 获取单个设置
settings.get('/:key', (c) => {
    const key = c.req.param('key');
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;

    if (!row) {
        return c.json({ error: '设置不存在' }, 404);
    }

    // 尝试解析 JSON
    try {
        return c.json(JSON.parse(row.value));
    } catch {
        return c.json({ value: row.value });
    }
});

// 更新设置（需认证，由 adminApi 包装）
settings.put('/:key', async (c) => {
    const key = c.req.param('key');
    const body = await c.req.json();
    const value = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);

    db.prepare(`
        INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now', 'localtime'))
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now', 'localtime')
    `).run(key, value, value);

    return c.json({ success: true, message: '设置已更新' });
});

export default settings;
