# 🚀 后端部署指南 (1Panel + PM2)

## 📋 前置条件
- 阿里云 ECS 服务器（2G2核）
- 1Panel 已安装
- Node.js 已通过 1Panel 安装

---

## 🔧 步骤 1：上传代码到服务器

**方式一：Git（推荐）**
```bash
cd /opt
git clone 你的仓库地址 couple-gallery
```

**方式二：SFTP**
- 使用 1Panel 文件管理 或 FileZilla
- 上传整个项目到 `/opt/couple-gallery/`

---

## 📦 步骤 2：安装后端依赖

```bash
cd /opt/couple-gallery/backend

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 初始化数据库（创建表和示例数据）
npm run db:init
```

---

## ⚙️ 步骤 3：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
nano .env
```

修改内容：
```bash
# 管理后台密码
ADMIN_PASSWORD=你的管理密码
PORT=3001

# 阿里云 OSS 配置（使用 ECS RAM 角色认证）
OSS_BUCKET=resour
OSS_REGION=oss-cn-hangzhou
# 注意: 不需要配置 AccessKey，ECS 会自动从实例元数据获取凭证
```

> ⚠️ **重要**：确保 ECS 实例已绑定具有 OSS 权限的 RAM 角色！

---

## 🚀 步骤 4：使用 PM2 启动服务

```bash
# 安装 PM2（如未安装）
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.cjs

# 设置开机自启
pm2 save
pm2 startup

# 查看运行状态
pm2 status
pm2 logs couple-gallery-api
```

---

## 🌐 步骤 5：配置 Nginx（1Panel）

1. 打开 1Panel → **网站** → **创建网站**
2. 选择 **反向代理**
3. 填写域名或使用 IP
4. 代理地址填写：`http://127.0.0.1:3001`

或者手动编辑 Nginx 配置，使用 `nginx.conf` 文件内容。

---

## ✅ 步骤 6：验证

```bash
# 检查 API 是否正常
curl http://localhost:3001/api/health

# 检查照片接口
curl http://localhost:3001/api/photos

# 访问管理后台
# 浏览器打开: http://你的IP:3001/admin
```

---

## 🔒 步骤 7：申请 SSL（可选）

1. 1Panel → 网站 → 选择你的网站
2. 点击 **SSL** → **申请证书**
3. 选择 Let's Encrypt，自动续期

---

## ❓ 常见问题

### Q: 端口 3001 被占用？
```bash
lsof -i :3001
kill -9 PID
```

### Q: 数据库连接失败？
```bash
# 确保 data.db 文件存在
ls -la /opt/couple-gallery/backend/data.db

# 重新初始化
npm run db:init
```

### Q: PM2 进程崩溃？
```bash
pm2 logs couple-gallery-api --lines 50
```
