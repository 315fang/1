import OSS from 'ali-oss';
import 'dotenv/config';

// ECS 元数据服务地址
const ECS_METADATA_URL = 'http://100.100.100.200/latest/meta-data';

// STS 凭证缓存
let stsCredentials: {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    expiration: Date;
} | null = null;

// OSS 客户端缓存
let ossClient: any = null;

/**
 * 从 ECS 元数据服务获取 RAM 角色名称
 */
async function getRoleName(): Promise<string> {
    const response = await fetch(`${ECS_METADATA_URL}/ram/security-credentials/`);
    if (!response.ok) {
        throw new Error('无法获取 RAM 角色名称，请确保 ECS 已绑定 RAM 角色');
    }
    const roleName = await response.text();
    return roleName.trim();
}

/**
 * 从 ECS 元数据服务获取 STS 临时凭证
 */
async function getSTSCredentials(): Promise<{
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    expiration: Date;
}> {
    // 检查缓存是否有效（提前5分钟过期）
    if (stsCredentials && new Date() < new Date(stsCredentials.expiration.getTime() - 5 * 60 * 1000)) {
        return stsCredentials;
    }

    console.log('🔑 正在从 ECS 元数据服务获取 STS 凭证...');

    // 获取角色名称
    const roleName = await getRoleName();
    console.log(`   角色名称: ${roleName}`);

    // 获取 STS 凭证
    const response = await fetch(`${ECS_METADATA_URL}/ram/security-credentials/${roleName}`);
    if (!response.ok) {
        throw new Error(`获取 STS 凭证失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.Code !== 'Success') {
        throw new Error(`STS 凭证错误: ${data.Code}`);
    }

    stsCredentials = {
        accessKeyId: data.AccessKeyId,
        accessKeySecret: data.AccessKeySecret,
        securityToken: data.SecurityToken,
        expiration: new Date(data.Expiration),
    };

    console.log(`   凭证有效期至: ${stsCredentials.expiration.toISOString()}`);

    // 重置 OSS 客户端，下次使用时会用新凭证创建
    ossClient = null;

    return stsCredentials;
}

/**
 * 获取 OSS 客户端（使用 ECS RAM Role 或 AccessKey）
 */
async function getOSSClient(): Promise<any> {
    const region = process.env.OSS_REGION || 'oss-cn-hangzhou';
    const bucket = process.env.OSS_BUCKET || 'resour';

    // 方式1：如果有 AccessKey 配置，直接使用（本地开发）
    if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) {
        if (!ossClient) {
            ossClient = new OSS({
                region,
                bucket,
                accessKeyId: process.env.OSS_ACCESS_KEY_ID,
                accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
            });
        }
        return ossClient;
    }

    // 方式2：使用 ECS RAM Role 获取 STS 凭证
    const credentials = await getSTSCredentials();

    if (!ossClient) {
        ossClient = new OSS({
            region,
            bucket,
            accessKeyId: credentials.accessKeyId,
            accessKeySecret: credentials.accessKeySecret,
            stsToken: credentials.securityToken,
        });
    }

    return ossClient;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    name?: string;
    error?: string;
}

/**
 * 上传文件到 OSS
 */
export async function uploadToOSS(
    buffer: Buffer,
    filename: string,
    folder: string = 'photos'
): Promise<UploadResult> {
    try {
        const client = await getOSSClient();

        // 生成唯一文件名
        const ext = filename.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ossPath = `${folder}/${timestamp}_${randomStr}.${ext}`;

        // 上传到 OSS
        const result = await client.put(ossPath, buffer);

        // 返回 HTTPS URL
        let url = result.url;
        if (url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
        }

        console.log(`✅ 上传成功: ${ossPath}`);

        return {
            success: true,
            url,
            name: ossPath,
        };
    } catch (error: any) {
        console.error('❌ OSS 上传失败:', error.message);
        return {
            success: false,
            error: error.message || '上传失败',
        };
    }
}

/**
 * 删除 OSS 文件
 */
export async function deleteFromOSS(ossPath: string): Promise<boolean> {
    try {
        const client = await getOSSClient();
        await client.delete(ossPath);
        return true;
    } catch (error) {
        console.error('OSS 删除失败:', error);
        return false;
    }
}

export default { uploadToOSS, deleteFromOSS };
