# IT学习课程平台 - 快速启动指南

## 🚀 快速开始

### 方法1：一键启动（推荐）

```bash
# 启动前后端服务
./start_all.sh

# 停止所有服务
./stop_all.sh
```

### 方法2：分别启动

```bash
# 仅启动后端
./start_backend.sh

# 仅启动前端（新终端）
./start_frontend.sh
```

## 📋 前置要求

### 系统要求
- Python 3.9+ (已安装: 3.12.11)
- Node.js 16+ (已安装: 20.19.6)
- MySQL 8.0
- Redis (可选，用于缓存)

### 数据库配置

1. 创建MySQL数据库：
```sql
CREATE DATABASE it_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置后端环境变量（`backend/.env`）：
```bash
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/it_learning
```

3. 数据库表已通过MCP创建，包含13张核心表

## 🌐 访问地址

启动成功后：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **ReDoc文档**: http://localhost:8000/redoc

## 📁 项目结构

```
webapp/
├── backend/              # 后端 (FastAPI)
│   ├── app/
│   │   ├── api/         # API路由
│   │   ├── core/        # 核心配置
│   │   ├── models/      # 数据模型
│   │   ├── schemas/     # 数据验证
│   │   └── services/    # 业务逻辑
│   ├── static/          # 静态文件
│   └── .env             # 环境变量
│
├── frontend/            # 前端 (React + TypeScript)
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API服务
│   │   └── store/       # Redux状态
│   └── .env             # 环境变量
│
├── start_backend.sh     # 后端启动脚本
├── start_frontend.sh    # 前端启动脚本
├── start_all.sh         # 一键启动脚本
└── stop_all.sh          # 停止服务脚本
```

## 🔧 手动安装步骤

### 后端安装

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 前端安装

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📝 环境变量配置

### 后端 (`backend/.env`)

```bash
# 应用配置
APP_NAME=IT_Learning_Platform
DEBUG=True

# 数据库
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/it_learning

# JWT
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Redis（可选）
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 前端 (`frontend/.env`)

```bash
# API地址
VITE_API_BASE_URL=http://localhost:8000

# WebSocket地址
VITE_WS_URL=http://localhost:8000
```

## 🎯 核心功能

### 已实现功能

✅ **用户系统**
- 用户注册/登录
- 角色管理（学员/讲师/管理员）
- 个人信息管理
- 密码修改

✅ **课程系统**
- 课程发布与管理
- 章节/小节管理
- 课程分类
- 课程搜索与筛选

✅ **学习系统**
- 学习进度记录
- 视频播放进度保存
- 学习统计
- 课程收藏

✅ **互动系统**
- 评论与回复
- 课程评分
- 点赞功能

✅ **直播系统**
- 直播间管理
- WebSocket实时通信
- 弹幕功能

✅ **文件上传**
- 图片上传
- 视频上传
- 批量上传

✅ **钱包系统**
- 余额管理
- 课程购买
- 交易记录

## 🐛 故障排除

### 后端启动失败

1. **数据库连接错误**
   - 检查MySQL服务是否运行
   - 验证`.env`中的数据库配置
   - 确认数据库已创建

2. **端口被占用**
   ```bash
   # 查找占用8000端口的进程
   lsof -i :8000
   # 杀死进程
   kill -9 <PID>
   ```

3. **依赖安装失败**
   ```bash
   # 升级pip
   pip install --upgrade pip
   # 重新安装依赖
   pip install -r requirements.txt
   ```

### 前端启动失败

1. **端口被占用**
   ```bash
   # 查找占用3000端口的进程
   lsof -i :3000
   # 杀死进程
   kill -9 <PID>
   ```

2. **依赖安装失败**
   ```bash
   # 清除缓存
   rm -rf node_modules package-lock.json
   # 重新安装
   npm install
   ```

## 📚 开发文档

- [API文档](docs/API.md)
- [数据库设计](docs/DATABASE.md)
- [前端设计](docs/FRONTEND_DESIGN.md)

## 🔗 相关链接

- Figma设计: https://www.figma.com/design/zBUccvNJHt9MVMTwCmCqXJ/Quiz-Game--Community-

## 📞 技术支持

如遇问题，请查看：
1. 后端日志: `backend.log`
2. 前端日志: `frontend.log`
3. 浏览器控制台
4. API文档: http://localhost:8000/docs

---

**祝您使用愉快！** 🎉
