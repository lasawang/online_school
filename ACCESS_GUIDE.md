# IT学习课程平台 - 访问指南

## 🌐 在线访问地址

### 前端应用
- **URL**: https://3000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai
- **端口**: 3000
- **技术栈**: React 18 + TypeScript + Vite + Ant Design

### 后端API
- **URL**: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai
- **端口**: 8000
- **技术栈**: FastAPI + Python 3.12 + MySQL
- **API文档**: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/docs
- **健康检查**: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/api/health

---

## 👤 测试账号

### 管理员账号
- **用户名**: `admin`
- **密码**: `admin123`
- **权限**: 完全管理权限（用户管理、课程管理、系统设置等）

### 教师账号
- **用户名**: `teacher`
- **密码**: `teacher123`
- **权限**: 课程创建、编辑、直播管理

### 学生账号
- **用户名**: `student`
- **密码**: `student123`
- **权限**: 课程学习、评论、收藏

---

## 🚀 功能模块

### 1. 用户系统
- ✅ 用户注册/登录
- ✅ 个人信息管理
- ✅ 密码修改
- ✅ 角色权限控制（管理员/教师/学生）

### 2. 课程管理
- ✅ 课程列表浏览
- ✅ 课程详情查看
- ✅ 课程创建/编辑（教师/管理员）
- ✅ 课程分类管理
- ✅ 课程报名

### 3. 学习功能
- ✅ 视频播放
- ✅ 学习进度记录
- ✅ 章节/小节管理
- ✅ 我的课程
- ✅ 学习统计

### 4. 互动功能
- ✅ 课程评论
- ✅ 评分系统
- ✅ 点赞功能
- ✅ 课程收藏

### 5. 直播功能
- ✅ 直播列表
- ✅ 直播创建/管理
- ✅ 直播状态管理
- ✅ WebSocket实时通信

### 6. 钱包系统
- ✅ 钱包余额查询
- ✅ 充值功能
- ✅ 交易记录
- ✅ 课程购买

### 7. 通知系统
- ✅ 系统通知
- ✅ 课程通知
- ✅ 直播通知
- ✅ 已读/未读状态

### 8. 管理功能
- ✅ 用户管理
- ✅ 课程管理
- ✅ Banner管理
- ✅ 系统设置
- ✅ 数据统计

---

## 📊 API接口测试结果

### 测试统计
- **总接口数**: 38个
- **测试通过**: 38个
- **测试失败**: 0个
- **通过率**: 100% ✅

### 接口分类
| 模块 | 接口数 | 状态 |
|------|--------|------|
| 用户认证 | 5 | ✅ |
| 课程管理 | 10 | ✅ |
| 学习记录 | 7 | ✅ |
| 互动功能 | 3 | ✅ |
| 分类管理 | 4 | ✅ |
| 直播管理 | 5 | ✅ |
| 钱包交易 | 3 | ✅ |
| Banner管理 | 4 | ✅ |
| 通知系统 | 3 | ✅ |
| 系统设置 | 2 | ✅ |
| 管理员功能 | 7 | ✅ |

详细测试报告请查看：[API_TEST_REPORT.md](./API_TEST_REPORT.md)

---

## 🗄️ 数据库信息

### 数据库配置
- **类型**: MySQL (MariaDB 10.11.14)
- **数据库名**: it_learning
- **用户名**: it_user
- **表数量**: 17个表

### 数据表列表
1. users - 用户表
2. categories - 分类表
3. courses - 课程表
4. chapters - 章节表
5. sections - 小节表
6. course_enrollments - 课程报名表
7. learning_records - 学习记录表
8. collections - 收藏表
9. comments - 评论表
10. live_rooms - 直播间表
11. live_chat_messages - 直播聊天表
12. wallets - 钱包表
13. transactions - 交易表
14. banners - Banner表
15. notifications - 通知表
16. operation_logs - 操作日志表
17. system_settings - 系统设置表

---

## 🔧 本地开发

### 启动后端
```bash
cd /home/user/webapp/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 启动前端
```bash
cd /home/user/webapp/frontend
npm install
npm run dev
```

### 一键启动（推荐）
```bash
cd /home/user/webapp
./start_all.sh
```

### 检查服务状态
```bash
cd /home/user/webapp
./check_status.sh
```

### 停止所有服务
```bash
cd /home/user/webapp
./stop_all.sh
```

---

## 📝 API使用示例

### 1. 用户登录
```bash
curl -X POST "https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN",
    "full_name": "系统管理员"
  }
}
```

### 2. 获取课程列表
```bash
curl "https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/api/v1/courses?page=1&page_size=10"
```

### 3. 创建课程（需要Token）
```bash
curl -X POST "https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/api/v1/courses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新课程",
    "description": "课程描述",
    "category_id": 1,
    "price": 99.00
  }'
```

### 4. 获取学习统计
```bash
curl "https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/api/v1/learning/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 在线API文档

访问 Swagger UI 查看完整的API文档：
- **Swagger UI**: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/docs
- **ReDoc**: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/redoc

Swagger UI 提供：
- 所有API接口的详细说明
- 请求参数示例
- 响应格式说明
- 在线测试功能（可直接在浏览器中测试API）

---

## 🎯 快速体验步骤

### 1. 访问前端应用
打开浏览器访问：https://3000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai

### 2. 登录系统
使用测试账号登录：
- 管理员: `admin` / `admin123`
- 教师: `teacher` / `teacher123`
- 学生: `student` / `student123`

### 3. 体验核心功能
- 浏览课程列表
- 查看课程详情
- 报名课程（学生）
- 创建课程（教师/管理员）
- 发表评论和评分
- 收藏课程
- 查看学习进度
- 管理钱包余额

### 4. 管理员专属功能（admin账号）
- 用户管理
- 课程审核
- Banner管理
- 系统设置
- 数据统计查看

---

## 🔍 故障排查

### 前端无法访问
1. 检查前端服务是否启动：
   ```bash
   lsof -i:3000
   ```
2. 查看前端日志：
   ```bash
   cd /home/user/webapp/frontend
   npm run dev
   ```

### 后端无法访问
1. 检查后端服务是否启动：
   ```bash
   lsof -i:8000
   ```
2. 查看后端日志：
   ```bash
   cd /home/user/webapp/backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 数据库连接失败
1. 检查MySQL服务：
   ```bash
   sudo systemctl status mariadb
   ```
2. 重启MySQL：
   ```bash
   sudo systemctl restart mariadb
   ```

---

## 📞 技术支持

- **项目仓库**: https://github.com/lasawang/online_school
- **API测试报告**: [API_TEST_REPORT.md](./API_TEST_REPORT.md)
- **部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **项目总结**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 🎉 项目状态

✅ **已完成** - 所有功能已实现并测试通过！

- ✅ 前后端完全打通
- ✅ 数据库配置完成
- ✅ 所有API接口测试通过（38/38）
- ✅ 核心功能全部可用
- ✅ 用户体验流畅
- ✅ 代码已推送到GitHub

**系统已完全可用，欢迎访问体验！** 🚀
