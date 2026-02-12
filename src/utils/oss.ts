import OSS from 'ali-oss';

export interface OSSConfig {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
}

export class OSSManager {
    private client: any;

    constructor(config: OSSConfig) {
        if (!config.accessKeyId || !config.accessKeySecret || !config.bucket || !config.region) {
            console.warn('OSS config is incomplete');
            return;
        }

        try {
            this.client = new OSS({
                region: config.region,
                accessKeyId: config.accessKeyId,
                accessKeySecret: config.accessKeySecret,
                bucket: config.bucket,
                secure: true, // Force HTTPS
            });
        } catch (error) {
            console.error('Failed to initialize OSS client:', error);
        }
    }

    async uploadFile(file: File, path: string = 'uploads/'): Promise<string | null> {
        if (!this.client) {
            console.error('OSS client not initialized');
            return null;
        }

        try {
            // Create a unique filename: timestamp-random-filename
            const uniqueName = `${path}${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${file.name}`;
            const result = await this.client.put(uniqueName, file);
            return result.url; // Returns the public URL
        } catch (error) {
            console.error('OSS upload failed:', error);
            throw error;
        }
    }
}
