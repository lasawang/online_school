# IT学习课程平台 - Cloudflare 部署指南

## 📋 目录
1. [前置准备](#前置准备)
2. [Cloudflare Pages 部署](#cloudflare-pages-部署)
3. [环境变量配置](#环境变量配置)
4. [自定义域名](#自定义域名)
5. [CI/CD 自动部署](#cicd-自动部署)
6. [故障排查](#故障排查)

---

## 前置准备

### 1. 注册 Cloudflare 账号
访问 [Cloudflare](https://dash.cloudflare.com/) 注册账号（免费）

### 2. 安装 Wrangler CLI
```bash
npm install -g wrangler

# 验证安装
wrangler --version
```

### 3. 登录 Cloudflare
```bash
wrangler login
```
这会打开浏览器窗口，完成 OAuth 认证。

---

## Cloudflare Pages 部署

### 方法1：使用部署脚本（推荐）

```bash
# 一键部署
./deploy-cloudflare.sh
```

这个脚本会：
1. 检查并安装 Wrangler CLI
2. 安装前端依赖
3. 构建前端项目
4. 部署到 Cloudflare Pages

### 方法2：手动部署

#### 步骤1：构建前端
```bash
cd frontend
npm install
npm run build
```

#### 步骤2：使用 Wrangler 部署
```bash
# 首次部署
wrangler pages deploy dist --project-name=it-learning-platform

# 后续部署
wrangler pages deploy dist
```

### 方法3：通过 Dashboard 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 **Pages** > **Create a project**
3. 连接 GitHub 仓库
4. 配置构建设置：
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
5. 点击 **Save and Deploy**

---

## 环境变量配置

### 在 Cloudflare Dashboard 中设置

1. 进入项目 Settings > Environment variables
2. 添加以下变量：

**生产环境变量**:
```
VITE_API_BASE_URL = https://api.yourdomain.com
VITE_WS_URL = https://api.yourdomain.com
VITE_APP_TITLE = IT学习课程平台
```

**预览环境变量**:
```
VITE_API_BASE_URL = https://api-preview.yourdomain.com
VITE_WS_URL = https://api-preview.yourdomain.com
```

### 通过 wrangler.toml 配置

编辑 `frontend/wrangler.toml`:
```toml
[vars]
VITE_API_BASE_URL = "https://api.yourdomain.com"
VITE_WS_URL = "https://api.yourdomain.com"

[env.production]
vars = { VITE_API_BASE_URL = "https://api.yourdomain.com" }

[env.preview]
vars = { VITE_API_BASE_URL = "https://api-preview.yourdomain.com" }
```

---

## 自定义域名

### 添加自定义域名

1. 在 Cloudflare Pages 项目中，选择 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入您的域名，如：`app.yourdomain.com`
4. Cloudflare 会自动配置 DNS 记录

### DNS 配置示例

如果手动配置 DNS，添加 CNAME 记录：
```
app.yourdomain.com  CNAME  your-project.pages.dev
```

### SSL/TLS 配置

Cloudflare 自动提供免费 SSL 证书，无需额外配置。

---

## CI/CD 自动部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - master
      - main
  pull_request:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: it-learning-platform
          directory: frontend/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加：
1. `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
   - 在 Cloudflare Dashboard > My Profile > API Tokens 创建
   - 使用 "Edit Cloudflare Workers" 模板
2. `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
   - 在 Cloudflare Dashboard 右侧栏查看

---

## API 代理配置

由于前后端分离，前端部署在 Cloudflare Pages，后端部署在其他服务器，需要配置 API 代理。

### 方法1：使用 _redirects 文件

`frontend/_redirects`:
```
/api/*  https://api.yourdomain.com/api/:splat  200
```

### 方法2：使用 Cloudflare Workers

创建 `frontend/functions/api/[[path]].ts`:
```typescript
export async function onRequest(context) {
  const url = new URL(context.request.url)
  const apiUrl = `https://api.yourdomain.com${url.pathname}`
  
  return fetch(apiUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body
  })
}
```

---

## 性能优化

### 1. 启用 HTTP/3
在 Cloudflare Dashboard > Speed > Optimization 中启用 HTTP/3

### 2. 配置缓存规则
在 `frontend/_headers` 中配置：
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

### 3. 启用 Brotli 压缩
Cloudflare 默认启用，无需配置

### 4. 图片优化
使用 Cloudflare Images 或 Image Resizing 功能

---

## 监控和分析

### Cloudflare Analytics
- 访问 Cloudflare Dashboard > Analytics
- 查看流量、带宽、请求数等指标

### Web Analytics
- 在 Cloudflare Dashboard > Analytics > Web Analytics
- 添加网站以获取详细访问数据

---

## 故障排查

### 部署失败

**问题**: `No wrangler config found`  
**解决**: 确保 `wrangler.toml` 文件存在且格式正确

**问题**: 构建失败  
**解决**: 
```bash
# 本地测试构建
cd frontend
npm install
npm run build
```

### 环境变量不生效

**问题**: API 请求失败  
**解决**: 
1. 检查 Cloudflare Dashboard 中的环境变量配置
2. 确保变量名以 `VITE_` 开头（Vite 要求）
3. 重新部署项目

### CORS 错误

**问题**: API 请求被 CORS 阻止  
**解决**: 在后端添加 CORS 配置
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.pages.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 路由不工作

**问题**: SPA 路由刷新 404  
**解决**: 确保 `_redirects` 文件配置正确
```
/*  /index.html  200
```

---

## 后端部署建议

虽然 Cloudflare Pages 主要用于静态前端，后端建议部署到：

### 选项1：传统服务器
- VPS (DigitalOcean, Linode, AWS EC2)
- 使用 Nginx + Gunicorn
- 参考 `DEPLOYMENT.md`

### 选项2：Serverless
- **Cloudflare Workers**: 适合简单 API
- **AWS Lambda**: 适合复杂业务逻辑
- **Google Cloud Functions**: 适合需要 Python 环境

### 选项3：容器化
- **Docker + Kubernetes**
- **Google Cloud Run**
- **AWS ECS/Fargate**

---

## 费用估算

### Cloudflare Pages 免费套餐
- ✅ 无限静态请求
- ✅ 无限带宽
- ✅ 每月 500 次构建
- ✅ 并发构建: 1个
- ✅ 自定义域名
- ✅ 免费 SSL 证书

### 超出限制
如需更多构建次数或并发，可升级到 **Pages Pro** ($20/月)

---

## 有用的命令

```bash
# 查看部署列表
wrangler pages deployments list

# 查看项目信息
wrangler pages project list

# 删除部署
wrangler pages deployment delete <deployment-id>

# 回滚到之前的部署
wrangler pages deployment rollback <deployment-id>

# 查看日志
wrangler pages deployment tail
```

---

## 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [GitHub Actions 集成](https://github.com/cloudflare/pages-action)

---

## 联系支持

遇到问题？
- [Cloudflare Community](https://community.cloudflare.com/)
- [Discord](https://discord.cloudflare.com/)
- [Twitter @cloudflaredev](https://twitter.com/cloudflaredev)

---

**祝部署顺利！** 🚀
