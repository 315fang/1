module.exports = {
    apps: [{
        name: 'couple-gallery-api',
        script: './dist/index.js',
        cwd: '/opt/couple-gallery/backend',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 3001,
            ADMIN_PASSWORD: 'your_secure_password'
        },
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true
    }]
};
