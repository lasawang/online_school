# IT学习课程平台 - 部署文档

## 📦 生产环境部署指南

### 目录
1. [服务器要求](#服务器要求)
2. [后端部署](#后端部署)
3. [前端部署](#前端部署)
4. [数据库配置](#数据库配置)
5. [Nginx配置](#nginx配置)
6. [域名与SSL](#域名与ssl)
7. [监控与日志](#监控与日志)

---

## 服务器要求

### 最低配置
- CPU: 2核
- 内存: 4GB
- 存储: 20GB SSD
- 带宽: 5Mbps
- 操作系统: Ubuntu 20.04+ / CentOS 7+

### 推荐配置
- CPU: 4核
- 内存: 8GB
- 存储: 50GB SSD
- 带宽: 10Mbps

### 必需软件
- Python 3.9+
- Node.js 16+
- MySQL 8.0
- Redis 6.0+
- Nginx 1.18+

---

## 后端部署

### 1. 安装系统依赖

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv
sudo apt install mysql-server redis-server nginx

# CentOS/RHEL
sudo yum install python3 python3-pip
sudo yum install mysql-server redis nginx
```

### 2. 创建部署目录

```bash
sudo mkdir -p /var/www/it-learning
sudo chown -R $USER:$USER /var/www/it-learning
cd /var/www/it-learning
```

### 3. 克隆代码

```bash
git clone <repository-url> .
# 或使用已有代码
```

### 4. 配置Python环境

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. 配置环境变量

```bash
cp .env.example .env
vim .env
```

生产环境配置示例：
```bash
APP_NAME=IT_Learning_Platform
DEBUG=False
SECRET_KEY=<生成一个强密钥>
JWT_SECRET_KEY=<生成另一个强密钥>

DATABASE_URL=mysql+pymysql://dbuser:dbpassword@localhost:3306/it_learning
DATABASE_ECHO=False

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<Redis密码>

BACKEND_CORS_ORIGINS=https://yourdomain.com

UPLOAD_DIR=/var/www/it-learning/backend/static/uploads
```

### 6. 使用Gunicorn运行

安装Gunicorn：
```bash
pip install gunicorn
```

创建systemd服务文件：
```bash
sudo vim /etc/systemd/system/it-learning-backend.service
```

内容：
```ini
[Unit]
Description=IT Learning Platform Backend
After=network.target mysql.service redis.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/it-learning/backend
Environment="PATH=/var/www/it-learning/backend/venv/bin"
ExecStart=/var/www/it-learning/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable it-learning-backend
sudo systemctl start it-learning-backend
sudo systemctl status it-learning-backend
```

---

## 前端部署

### 1. 安装Node.js

```bash
# 使用NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 构建前端

```bash
cd /var/www/it-learning/frontend

# 配置生产环境变量
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# 安装依赖
npm install

# 构建
npm run build
```

构建产物在 `dist/` 目录

### 3. 使用PM2管理（可选）

如需SSR或开发服务器：
```bash
npm install -g pm2
pm2 start npm --name "it-learning-frontend" -- run dev
pm2 save
pm2 startup
```

---

## 数据库配置

### 1. 创建数据库

```sql
CREATE DATABASE it_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 创建数据库用户

```sql
CREATE USER 'it_learning_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON it_learning.* TO 'it_learning_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 导入表结构

数据库表已通过MCP创建，包含以下13张表：
- users (用户表)
- categories (分类表)
- courses (课程表)
- chapters (章节表)
- sections (小节表)
- learning_records (学习记录表)
- collections (收藏表)
- comments (评论表)
- live_rooms (直播间表)
- banners (轮播图表)
- operation_logs (操作日志表)
- course_enrollments (课程报名表)
- wallets & transactions (钱包相关表)

### 4. 创建测试数据

```bash
cd /var/www/it-learning/backend
source venv/bin/activate
python create_test_data.py
```

---

## Nginx配置

### 1. 创建配置文件

```bash
sudo vim /etc/nginx/sites-available/it-learning
```

### 2. 配置内容

```nginx
# 后端API
upstream backend_api {
    server 127.0.0.1:8000;
}

# 前端（如果使用PM2）
upstream frontend_app {
    server 127.0.0.1:3000;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# 主站点 - HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    root /var/www/it-learning/frontend/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API代理
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态文件（上传的文件）
    location /static/ {
        alias /var/www/it-learning/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 文件上传大小限制
    client_max_body_size 100M;
}
```

### 3. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/it-learning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 域名与SSL

### 1. 使用Let's Encrypt获取免费SSL证书

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. 自动续期

Certbot会自动创建续期定时任务。测试续期：
```bash
sudo certbot renew --dry-run
```

---

## 监控与日志

### 1. 后端日志

```bash
# 查看systemd日志
sudo journalctl -u it-learning-backend -f

# 查看Gunicorn日志
sudo tail -f /var/www/it-learning/backend/gunicorn.log
```

### 2. 前端日志

```bash
# PM2日志
pm2 logs it-learning-frontend

# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 3. 使用监控工具

推荐工具：
- **Prometheus + Grafana**: 系统指标监控
- **ELK Stack**: 日志聚合分析
- **Sentry**: 错误追踪
- **Uptime Robot**: 服务可用性监控

---

## 备份策略

### 1. 数据库备份

创建备份脚本：
```bash
#!/bin/bash
# /usr/local/bin/backup-database.sh

BACKUP_DIR="/var/backups/it-learning"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mysqldump -u it_learning_user -p'password' it_learning > $BACKUP_DIR/db_backup_$DATE.sql

# 保留最近30天的备份
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +30 -delete
```

添加到crontab（每天凌晨2点备份）：
```bash
0 2 * * * /usr/local/bin/backup-database.sh
```

### 2. 文件备份

备份上传的文件：
```bash
tar -czf /var/backups/it-learning/uploads_$(date +%Y%m%d).tar.gz \
    /var/www/it-learning/backend/static/uploads/
```

---

## 安全建议

1. **防火墙配置**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

2. **禁用DEBUG模式**
生产环境务必设置 `DEBUG=False`

3. **使用强密码**
为数据库、Redis等服务设置强密码

4. **定期更新**
```bash
sudo apt update && sudo apt upgrade
pip install -r requirements.txt --upgrade
npm update
```

5. **限流配置**
在Nginx中配置请求频率限制

---

## 性能优化

1. **数据库优化**
- 添加必要的索引
- 配置查询缓存
- 定期优化表

2. **Redis缓存**
- 缓存热点数据
- 缓存API响应
- Session存储

3. **CDN加速**
- 静态资源使用CDN
- 视频文件使用对象存储

4. **负载均衡**
- 使用Nginx负载均衡
- 多实例部署

---

## 故障恢复

### 快速恢复步骤

1. 停止服务
```bash
sudo systemctl stop it-learning-backend
sudo systemctl stop nginx
```

2. 恢复数据库
```bash
mysql -u it_learning_user -p it_learning < backup.sql
```

3. 恢复代码
```bash
git checkout stable-branch
```

4. 重启服务
```bash
sudo systemctl start it-learning-backend
sudo systemctl start nginx
```

---

## 联系与支持

部署遇到问题？请查看：
- [API文档](http://localhost:8000/docs)
- [GitHub Issues](https://github.com/your-repo/issues)
- [技术文档](docs/)

---

**祝部署顺利！** 🚀
