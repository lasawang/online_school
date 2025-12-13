# IT学习课程平台

一个基于 **FastAPI + React + Figma设计** 的在线学习课程平台，支持视频点播、直播授课、课程管理等功能。

## 🎨 设计参考

本项目UI设计参考自：[Quiz Game (Community) - Figma](https://www.figma.com/design/zBUccvNJHt9MVMTwCmCqXJ/Quiz-Game--Community-)

**设计风格**：
- 主色调：#1935CA (蓝色)
- 字体：Poppins
- 布局：现代化卡片式设计
- 风格：简洁、清晰、专业

详细设计文档：[docs/FRONTEND_DESIGN.md](docs/FRONTEND_DESIGN.md)

## 📋 项目简介

这是一个完整的IT在线学习平台毕业设计项目，包含：
- ✅ 用户管理（学员、讲师、管理员）
- ✅ 课程管理（课程发布、章节管理、视频上传）
- ✅ 视频点播（本地存储、播放进度记录）
- ✅ 直播课程（基于SRS流媒体服务器）
- ✅ 互动功能（评论、评分、收藏）
- ✅ 数据统计（学习记录、课程数据）
- ✅ 精美的现代化UI界面

## 🛠️ 技术栈

### 后端
- **FastAPI** - 现代化Python Web框架
- **MySQL 8.0** - 关系型数据库
- **Redis** - 缓存和会话管理
- **SQLAlchemy** - ORM框架
- **JWT** - 用户认证
- **Alembic** - 数据库迁移

### 前端
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Ant Design** - UI组件库
- **Redux Toolkit** - 状态管理
- **React Router v6** - 路由管理
- **Axios** - HTTP客户端
- **Video.js** - 视频播放器
- **Vite** - 构建工具

### 设计工具
- **Figma** - UI/UX设计
- **Figma MCP** - 设计资源导出

### 视频/直播
- **FFmpeg** - 视频转码
- **SRS** - 开源流媒体服务器

## 📁 项目结构

```
it_study/
├── backend/                    # 后端项目
│   ├── app/
│   │   ├── api/               # API路由
│   │   │   └── v1/            # API版本1
│   │   │       ├── auth.py           # 认证接口
│   │   │       ├── courses.py        # 课程管理
│   │   │       ├── chapters.py       # 章节管理
│   │   │       ├── categories.py     # 分类管理
│   │   │       ├── lives.py          # 直播管理
│   │   │       ├── upload.py         # 文件上传
│   │   │       ├── comments.py       # 评论管理
│   │   │       └── learning.py       # 学习记录
│   │   ├── core/              # 核心配置
│   │   ├── models/            # 数据库模型
│   │   ├── schemas/           # Pydantic模型
│   │   ├── services/          # 业务逻辑
│   │   └── utils/             # 工具函数
│   ├── static/                # 静态文件
│   ├── requirements.txt       # Python依赖
│   └── .env                   # 环境变量
│
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── assets/            # 静态资源
│   │   ├── components/        # 组件
│   │   │   ├── Layout/        # 布局组件
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── CourseCard/    # 课程卡片
│   │   │   └── VideoPlayer/   # 视频播放器
│   │   ├── pages/             # 页面
│   │   │   ├── Home/          # 首页
│   │   │   ├── Course/        # 课程页面
│   │   │   │   ├── CourseList.tsx
│   │   │   │   └── CourseDetail.tsx
│   │   │   └── User/          # 用户中心
│   │   ├── services/          # API服务
│   │   ├── store/             # Redux状态
│   │   └── utils/             # 工具函数
│   ├── package.json
│   └── vite.config.ts
│
└── docs/                       # 文档
    ├── README.md              # 项目说明
    ├── API.md                 # API文档
    ├── DATABASE.md            # 数据库设计
    └── FRONTEND_DESIGN.md     # 前端设计文档
```

## 🚀 快速开始

### 前置要求
- Python 3.9+
- Node.js 16+
- MySQL 8.0
- Redis

### 后端启动

1. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

2. 配置环境变量
```bash
# 创建 .env 文件，配置数据库等信息
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/it_study_platform
```

3. 数据库已通过MCP创建，包含13张表

4. 启动服务
```bash
python -m app.main
# 或使用 uvicorn
uvicorn app.main:app --reload
```

访问 http://localhost:8000/api/docs 查看API文档

### 前端启动

1. 安装依赖
```bash
cd frontend
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 📊 数据库设计

已创建的核心表（13张）：
- ✅ `users` - 用户表
- ✅ `categories` - 课程分类表
- ✅ `courses` - 课程表
- ✅ `chapters` - 章节表
- ✅ `sections` - 小节表
- ✅ `learning_records` - 学习记录表
- ✅ `collections` - 收藏表
- ✅ `comments` - 评论表
- ✅ `live_rooms` - 直播间表
- ✅ `live_chat_messages` - 直播聊天表
- ✅ `banners` - 轮播图表
- ✅ `operation_logs` - 操作日志表
- ✅ `course_enrollments` - 课程报名表

详细设计见：[docs/DATABASE.md](docs/DATABASE.md)

## 🔌 API接口

### 已实现的API

**认证相关** (`/api/v1/auth`)
- ✅ POST `/register` - 用户注册
- ✅ POST `/login` - 用户登录
- ✅ POST `/change-password` - 修改密码
- ✅ GET `/me` - 获取当前用户信息

**课程管理** (`/api/v1/courses`)
- ✅ GET `/` - 获取课程列表
- ✅ GET `/{id}` - 获取课程详情
- ✅ POST `/` - 创建课程
- ✅ PUT `/{id}` - 更新课程
- ✅ DELETE `/{id}` - 删除课程

**章节管理** (`/api/v1/chapters`)
- ✅ POST `/` - 创建章节
- ✅ PUT `/{id}` - 更新章节
- ✅ DELETE `/{id}` - 删除章节
- ✅ POST `/sections` - 创建小节
- ✅ PUT `/sections/{id}` - 更新小节
- ✅ DELETE `/sections/{id}` - 删除小节

**分类管理** (`/api/v1/categories`)
- ✅ GET `/` - 获取分类列表
- ✅ POST `/` - 创建分类
- ✅ PUT `/{id}` - 更新分类
- ✅ DELETE `/{id}` - 删除分类

**直播管理** (`/api/v1/lives`)
- ✅ GET `/` - 获取直播列表
- ✅ GET `/{id}` - 获取直播详情
- ✅ POST `/` - 创建直播
- ✅ PUT `/{id}` - 更新直播
- ✅ DELETE `/{id}` - 删除直播

**文件上传** (`/api/v1/upload`)
- ✅ POST `/image` - 上传图片
- ✅ POST `/video` - 上传视频
- ✅ POST `/images` - 批量上传图片

**评论管理** (`/api/v1/comments`)
- ✅ POST `/` - 发表评论
- ✅ GET `/` - 获取评论列表
- ✅ PUT `/{id}` - 更新评论
- ✅ DELETE `/{id}` - 删除评论
- ✅ POST `/{id}/like` - 点赞评论

**学习记录** (`/api/v1/learning`)
- ✅ POST `/records` - 保存学习记录
- ✅ GET `/records/course/{id}` - 获取课程学习记录
- ✅ GET `/my-courses` - 我的课程
- ✅ POST `/collections/{id}` - 收藏课程
- ✅ DELETE `/collections/{id}` - 取消收藏
- ✅ GET `/collections` - 我的收藏
- ✅ GET `/stats` - 学习统计

详细API文档见：[docs/API.md](docs/API.md) 或访问 http://localhost:8000/api/docs

## 🎨 前端页面

### 已实现的页面

- ✅ **Dashboard (首页)** - 展示学习统计、精选课程、提醒事项
- ✅ **CourseList (课程列表)** - 课程浏览、搜索、分类筛选
- ✅ **CourseDetail (课程详情)** - 视频播放、章节列表、评论区
- ✅ **Login/Register** - 用户登录注册
- ✅ **Header** - 顶部导航栏
- ✅ **Sidebar** - 侧边栏导航
- ✅ **CourseCard** - 课程卡片组件
- ✅ **VideoPlayer** - 视频播放器组件

详细设计文档见：[docs/FRONTEND_DESIGN.md](docs/FRONTEND_DESIGN.md)

## 🎯 核心功能

### ✅ 已完成功能

1. **用户系统**
   - 注册/登录/JWT认证
   - 角色权限（学员/讲师/管理员）
   - 个人信息管理

2. **课程系统**
   - 课程CRUD操作
   - 分类管理
   - 章节/小节管理
   - 课程搜索/筛选

3. **学习系统**
   - 学习进度记录
   - 播放位置记忆
   - 学习统计
   - 收藏功能

4. **互动系统**
   - 评论/回复
   - 点赞
   - 评分

5. **直播系统**
   - 直播间管理
   - 推拉流地址生成
   - 直播状态管理

6. **文件系统**
   - 图片上传
   - 视频上传
   - 批量上传

7. **UI界面**
   - 现代化设计
   - 响应式布局
   - Figma设计风格还原

## 📝 开发说明

### 后端开发
- 使用SQLAlchemy ORM操作数据库
- Pydantic进行数据验证
- JWT实现用户认证
- Redis缓存热门数据

### 前端开发
- 使用TypeScript开发
- Ant Design组件库
- Redux Toolkit管理全局状态
- Axios封装API请求
- Video.js实现视频播放

### 设计规范
- 遵循Figma设计系统
- 使用Poppins字体
- 蓝色主色调 (#1935CA)
- 卡片式布局
- 统一的圆角和阴影

## 📄 许可证

本项目仅供学习交流使用。

## 👨‍💻 作者

毕业设计项目 - IT学习课程平台

## 🙏 致谢

- 感谢 [Quiz Game (Community)](https://www.figma.com/community) 提供的设计灵感
- 感谢所有开源项目的贡献者！

---

## ⭐ 项目亮点

1. **✅ 完整的后端API** - 基于FastAPI，13张数据库表，涵盖所有核心功能
2. **✅ 现代化前端界面** - 基于Figma设计，使用React + Ant Design
3. **✅ 完善的文档** - API文档、数据库设计文档、前端设计文档
4. **✅ 规范的代码结构** - 清晰的目录组织，易于维护和扩展
5. **✅ 响应式设计** - 支持PC、平板、手机多端访问
6. **✅ 实用的功能** - 视频播放、学习进度、评论互动、直播支持

## 🔗 相关链接

- Figma设计: https://www.figma.com/design/zBUccvNJHt9MVMTwCmCqXJ/Quiz-Game--Community-
- API文档: http://localhost:8000/api/docs
- 前端应用: http://localhost:3000
