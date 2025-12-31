import Database, { Database as DatabaseType } from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const DB_PATH = join(__dirname, '../../data.db');

// 创建数据库连接
const db: DatabaseType = new Database(DB_PATH);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 类型定义
export interface Photo {
    id: number;
    title: string;
    en_title: string;
    image_url: string;
    description: string;
    date: string;
    tags: string[]; // 运行时解析为数组
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: number;
    name1: string;
    name2: string;
    avatar1: string;
    avatar2: string;
    together_date: string;
    site_title: string;
    bio: string;
}

export interface TimelineEvent {
    id: number;
    title: string;
    description: string;
    date: string;
    icon: string;
    photo_id: number | null;
}

// 数据库操作封装
export const photosDB = {
    getAll: () => {
        const rows = db.prepare('SELECT * FROM photos ORDER BY date DESC').all() as any[];
        return rows.map(row => ({
            ...row,
            tags: JSON.parse(row.tags || '[]')
        })) as Photo[];
    },

    getById: (id: number) => {
        const row = db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as any;
        if (!row) return null;
        return { ...row, tags: JSON.parse(row.tags || '[]') } as Photo;
    },

    create: (photo: Omit<Photo, 'id' | 'created_at' | 'updated_at'>) => {
        const stmt = db.prepare(`
            INSERT INTO photos (title, en_title, image_url, description, date, tags)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            photo.title,
            photo.en_title || '',
            photo.image_url,
            photo.description || '',
            photo.date,
            JSON.stringify(photo.tags || [])
        );
        return result.lastInsertRowid;
    },

    update: (id: number, photo: Partial<Photo>) => {
        const updates: string[] = [];
        const values: any[] = [];

        if (photo.title !== undefined) { updates.push('title = ?'); values.push(photo.title); }
        if (photo.en_title !== undefined) { updates.push('en_title = ?'); values.push(photo.en_title); }
        if (photo.image_url !== undefined) { updates.push('image_url = ?'); values.push(photo.image_url); }
        if (photo.description !== undefined) { updates.push('description = ?'); values.push(photo.description); }
        if (photo.date !== undefined) { updates.push('date = ?'); values.push(photo.date); }
        if (photo.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(photo.tags)); }

        updates.push("updated_at = datetime('now', 'localtime')");
        values.push(id);

        const stmt = db.prepare(`UPDATE photos SET ${updates.join(', ')} WHERE id = ?`);
        return stmt.run(...values);
    },

    delete: (id: number) => {
        return db.prepare('DELETE FROM photos WHERE id = ?').run(id);
    }
};

export const profileDB = {
    get: () => {
        return db.prepare('SELECT * FROM profile WHERE id = 1').get() as Profile | undefined;
    },

    update: (profile: Partial<Profile>) => {
        const updates: string[] = [];
        const values: any[] = [];

        if (profile.name1 !== undefined) { updates.push('name1 = ?'); values.push(profile.name1); }
        if (profile.name2 !== undefined) { updates.push('name2 = ?'); values.push(profile.name2); }
        if (profile.avatar1 !== undefined) { updates.push('avatar1 = ?'); values.push(profile.avatar1); }
        if (profile.avatar2 !== undefined) { updates.push('avatar2 = ?'); values.push(profile.avatar2); }
        if (profile.together_date !== undefined) { updates.push('together_date = ?'); values.push(profile.together_date); }
        if (profile.site_title !== undefined) { updates.push('site_title = ?'); values.push(profile.site_title); }
        if (profile.bio !== undefined) { updates.push('bio = ?'); values.push(profile.bio); }

        updates.push("updated_at = datetime('now', 'localtime')");

        const stmt = db.prepare(`UPDATE profile SET ${updates.join(', ')} WHERE id = 1`);
        return stmt.run(...values);
    }
};

export const timelineDB = {
    getAll: () => {
        return db.prepare('SELECT * FROM timeline ORDER BY date DESC').all() as TimelineEvent[];
    },

    create: (event: Omit<TimelineEvent, 'id'>) => {
        const stmt = db.prepare(`
            INSERT INTO timeline (title, description, date, icon, photo_id)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            event.title,
            event.description || '',
            event.date,
            event.icon || 'heart',
            event.photo_id || null
        );
        return result.lastInsertRowid;
    },

    update: (id: number, event: Partial<TimelineEvent>) => {
        const updates: string[] = [];
        const values: any[] = [];

        if (event.title !== undefined) { updates.push('title = ?'); values.push(event.title); }
        if (event.description !== undefined) { updates.push('description = ?'); values.push(event.description); }
        if (event.date !== undefined) { updates.push('date = ?'); values.push(event.date); }
        if (event.icon !== undefined) { updates.push('icon = ?'); values.push(event.icon); }
        if (event.photo_id !== undefined) { updates.push('photo_id = ?'); values.push(event.photo_id); }

        values.push(id);
        const stmt = db.prepare(`UPDATE timeline SET ${updates.join(', ')} WHERE id = ?`);
        return stmt.run(...values);
    },

    delete: (id: number) => {
        return db.prepare('DELETE FROM timeline WHERE id = ?').run(id);
    }
};
