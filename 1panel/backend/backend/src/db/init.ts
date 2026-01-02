// 数据库初始化脚本
// 运行: npm run db:init

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

console.log('🗃️  正在初始化数据库...');
console.log(`   数据库路径: ${DB_PATH}`);

try {
    const db = new Database(DB_PATH);
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');

    db.exec(schema);

    console.log('✅ 数据库初始化成功！');
    console.log('   - 创建了 photos 表');
    console.log('   - 创建了 profile 表');
    console.log('   - 创建了 timeline 表');
    console.log('   - 插入了示例数据');

    db.close();
} catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
}
