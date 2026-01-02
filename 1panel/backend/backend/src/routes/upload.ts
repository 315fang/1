import { Hono } from 'hono';
import { uploadToOSS } from '../services/oss.js';

const upload = new Hono();

/**
 * 上传图片到 OSS
 * POST /api/admin/upload
 * 
 * Request: multipart/form-data
 *   - file: 图片文件
 *   - folder: 存储目录（可选，默认 photos）
 * 
 * Response:
 *   - success: boolean
 *   - url: OSS 访问链接
 *   - name: OSS 文件路径
 */
upload.post('/', async (c) => {
    try {
        const formData = await c.req.formData();
        const file = formData.get('file') as File | null;
        const folder = (formData.get('folder') as string) || 'photos';

        if (!file) {
            return c.json({ success: false, error: '请选择要上传的文件' }, 400);
        }

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return c.json({
                success: false,
                error: '不支持的文件类型，仅支持 JPG/PNG/GIF/WebP'
            }, 400);
        }

        // 限制文件大小（10MB）
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return c.json({
                success: false,
                error: '文件过大，最大支持 10MB'
            }, 400);
        }

        // 转换为 Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 上传到 OSS
        const result = await uploadToOSS(buffer, file.name, folder);

        if (result.success) {
            return c.json({
                success: true,
                url: result.url,
                name: result.name,
            });
        } else {
            return c.json({
                success: false,
                error: result.error
            }, 500);
        }
    } catch (error: any) {
        console.error('上传处理失败:', error);
        return c.json({
            success: false,
            error: error.message || '上传处理失败'
        }, 500);
    }
});

export default upload;
