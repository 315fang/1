# 项目部署指南

本项目是一个基于 Vite + React + TypeScript 的前端应用。以下是完整的部署说明。

## 1. 环境准备

在开始之前，请确保你的开发环境已经安装了以下工具：

- **Node.js**: 建议版本 v18.0.0 或更高 (推荐使用 LTS 版本)
- **包管理器**: npm (随 Node.js 安装), yarn 或 pnpm

## 2. 本地开发

1. **安装依赖**

   ```bash
   npm install
   # 或者
   yarn install
   # 或者
   pnpm install
   ```

2. **启动开发服务器**

   ```bash
   npm run dev
   ```

   启动后，访问终端显示的本地地址（通常是 `http://localhost:5173`）。

## 3. 构建生产版本

在部署之前，需要构建项目的生产版本：

```bash
npm run build
```

构建完成后，会在项目根目录下生成 `dist` 文件夹，里面包含了所有静态资源文件。

## 4. 部署方案

### 方案 A: 使用 Vercel (推荐)

本项目包含 `vercel.json` 配置文件，非常适合部署在 Vercel 上。

1. 注册并登录 [Vercel](https://vercel.com)。
2. 点击 "Add New..." -> "Project"。
3. 导入你的 GitHub 仓库。
4. Vercel 会自动识别 Vite 框架并配置构建命令。
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. 点击 "Deploy"。

### 方案 B: 使用 Nginx 部署

如果你有自己的服务器（如 CentOS/Ubuntu），可以使用 Nginx 托管静态文件。

1. **安装 Nginx** (如果尚未安装)
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nginx

   # CentOS
   sudo yum install nginx
   ```

2. **上传构建文件**
   将本地 `npm run build` 生成的 `dist` 目录下的所有文件上传到服务器的指定目录，例如 `/var/www/love-gallery`。

3. **配置 Nginx**
   编辑 Nginx 配置文件 (通常在 `/etc/nginx/sites-available/default` 或 `/etc/nginx/conf.d/love.conf`)：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com; # 替换为你的域名

       root /var/www/love-gallery;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # 如果有后端 API 代理需求
       # location /api {
       #     proxy_pass http://localhost:3001;
       # }
   }
   ```

4. **重启 Nginx**
   ```bash
   sudo nginx -t # 检查配置语法
   sudo systemctl restart nginx
   ```

### 方案 C: Docker 部署

你可以创建一个 `Dockerfile` 来容器化部署前端应用。

1. **创建 Dockerfile**
   在项目根目录下创建 `Dockerfile`:

   ```dockerfile
   # 构建阶段
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # 运行阶段
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **构建并运行**
   ```bash
   docker build -t love-gallery .
   docker run -d -p 80:80 love-gallery
   ```

## 5. 环境变量配置

本项目支持环境变量配置。你可以创建 `.env` 文件来设置环境变量。

- `VITE_API_URL`: 后端 API 地址。
  - 默认开发环境: `http://localhost:3001/api`
  - 默认生产环境: `https://api.maodian316.top/api`

如果在 Vercel 部署，请在 Vercel 项目设置的 "Environment Variables" 中添加 `VITE_API_URL`。

## 6. 常见问题

- **页面刷新 404**:
  由于是 SPA (单页应用)，必须配置服务器重写规则指向 `index.html`。
  - Nginx: `try_files $uri $uri/ /index.html;`
  - Vercel: 已通过 `vercel.json` 自动处理。

- **跨域问题 (CORS)**:
  如果前端和后端不在同一个域名下，请确保后端 API 允许了前端域名的跨域请求。
