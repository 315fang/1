-- 情侣展示网站数据库初始化脚本
-- SQLite 数据库

-- 删除已存在的表（开发时使用）
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS timeline;

-- 照片表
CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    en_title TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    tags TEXT DEFAULT '[]', -- JSON 数组格式
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 情侣信息表（单条记录）
CREATE TABLE profile (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- 确保只有一条记录
    name1 TEXT NOT NULL DEFAULT '他',
    name2 TEXT NOT NULL DEFAULT '她',
    avatar1 TEXT DEFAULT '',
    avatar2 TEXT DEFAULT '',
    together_date TEXT NOT NULL DEFAULT '2024-01-01',
    site_title TEXT DEFAULT '我们的故事',
    bio TEXT DEFAULT '记录我们的美好时光',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 时间轴事件表
CREATE TABLE timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    icon TEXT DEFAULT 'heart', -- 图标类型: heart, star, gift, cake, ring 等
    photo_id INTEGER,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE SET NULL
);

-- 插入默认的情侣信息
INSERT INTO profile (id, name1, name2, together_date, site_title, bio)
VALUES (1, '他的名字', '她的名字', '2024-01-01', '我们的故事', '记录我们的美好时光 💕');

-- 插入示例照片数据
INSERT INTO photos (title, en_title, image_url, description, date, tags) VALUES
('第一次相遇', 'First Meet', 'https://picsum.photos/seed/couple1/800/1200', '那天的阳光很好，你的笑容更好。', '2024-01-15', '["初遇", "美好"]'),
('一起看日落', 'Sunset Together', 'https://picsum.photos/seed/couple2/800/1200', '海边的夕阳，映照着我们的脸庞。', '2024-03-20', '["旅行", "日落"]'),
('生日快乐', 'Happy Birthday', 'https://picsum.photos/seed/couple3/800/1200', '感谢你来到这个世界，也来到我的世界。', '2024-05-10', '["生日", "纪念日"]');

-- 插入示例时间轴事件
INSERT INTO timeline (title, description, date, icon) VALUES
('我们相遇了', '在那个特别的日子，我们第一次见面。', '2024-01-15', 'heart'),
('第一次旅行', '一起去看了大海和日落。', '2024-03-20', 'star'),
('第一个生日', '一起度过的第一个生日。', '2024-05-10', 'cake');

-- 创建索引优化查询
CREATE INDEX idx_photos_date ON photos(date);
CREATE INDEX idx_timeline_date ON timeline(date);
