# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:8000/api/v1`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 认证说明

除了公开接口外，其他接口需要在请求头中携带 Token：

```
Authorization: Bearer <your_token>
```

---

## 1. 认证模块

### 1.1 用户注册

**接口**: `POST /auth/register`

**请求参数**:
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "role": "student",  // student | teacher | admin
  "full_name": "string",
  "phone": "string"
}
```

**响应示例**:
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "role": "student",
  "avatar": null,
  "full_name": "张三",
  "phone": "13800138000",
  "is_active": true,
  "created_at": "2025-11-05T15:30:00",
  "updated_at": "2025-11-05T15:30:00"
}
```

---

### 1.2 用户登录

**接口**: `POST /auth/login`

**请求参数**:
```json
{
  "username": "zhangsan",  // 用户名或邮箱
  "password": "password123"
}
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "role": "student",
    "avatar": null
  }
}
```

---

### 1.3 获取当前用户信息

**接口**: `GET /auth/me`

**需要认证**: ✅

**响应示例**:
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "role": "student",
  "avatar": null,
  "full_name": "张三",
  "is_active": true
}
```

---

### 1.4 修改密码

**接口**: `POST /auth/change-password`

**需要认证**: ✅

**请求参数**:
```json
{
  "old_password": "oldpassword",
  "new_password": "newpassword123"
}
```

---

## 2. 课程模块

### 2.1 获取课程列表

**接口**: `GET /courses`

**查询参数**:
- `page`: 页码，默认1
- `page_size`: 每页数量，默认10
- `category_id`: 分类ID
- `status`: 课程状态 (draft | published | offline)
- `keyword`: 搜索关键词

**响应示例**:
```json
{
  "total": 100,
  "page": 1,
  "page_size": 10,
  "items": [
    {
      "id": 1,
      "title": "Python从入门到精通",
      "description": "全面系统的Python课程",
      "cover_image": "/static/uploads/images/course1.jpg",
      "category_id": 1,
      "teacher_id": 2,
      "price": 199.00,
      "original_price": 299.00,
      "status": "published",
      "level": "beginner",
      "student_count": 1580,
      "rating": 4.8,
      "view_count": 5600,
      "created_at": "2025-10-01T10:00:00"
    }
  ]
}
```

---

### 2.2 获取课程详情

**接口**: `GET /courses/{course_id}`

**响应示例**:
```json
{
  "id": 1,
  "title": "Python从入门到精通",
  "description": "全面系统的Python课程...",
  "cover_image": "/static/uploads/images/course1.jpg",
  "teacher_id": 2,
  "category_id": 1,
  "price": 199.00,
  "status": "published",
  "level": "beginner",
  "student_count": 1580,
  "rating": 4.8,
  "chapters": [
    {
      "id": 1,
      "title": "第一章：Python基础",
      "sort_order": 1,
      "sections": [
        {
          "id": 1,
          "title": "1.1 Python简介",
          "video_url": "/static/uploads/videos/video1.mp4",
          "video_duration": 1200,
          "is_free": true,
          "sort_order": 1
        }
      ]
    }
  ]
}
```

---

### 2.3 创建课程

**接口**: `POST /courses`

**需要认证**: ✅ (讲师/管理员)

**请求参数**:
```json
{
  "title": "Python从入门到精通",
  "description": "课程描述",
  "cover_image": "/static/uploads/images/cover.jpg",
  "category_id": 1,
  "price": 199.00,
  "original_price": 299.00,
  "level": "beginner",
  "tags": "Python,编程,后端"
}
```

---

### 2.4 更新课程

**接口**: `PUT /courses/{course_id}`

**需要认证**: ✅ (课程讲师/管理员)

**请求参数**:
```json
{
  "title": "更新的标题",
  "description": "更新的描述",
  "status": "published"
}
```

---

### 2.5 删除课程

**接口**: `DELETE /courses/{course_id}`

**需要认证**: ✅ (课程讲师/管理员)

---

## 3. 章节模块

### 3.1 创建章节

**接口**: `POST /chapters`

**需要认证**: ✅ (课程讲师/管理员)

**请求参数**:
```json
{
  "course_id": 1,
  "title": "第一章：Python基础",
  "description": "章节描述",
  "sort_order": 1
}
```

---

### 3.2 创建小节

**接口**: `POST /chapters/sections`

**需要认证**: ✅ (课程讲师/管理员)

**请求参数**:
```json
{
  "chapter_id": 1,
  "title": "1.1 Python简介",
  "video_url": "/static/uploads/videos/video1.mp4",
  "video_duration": 1200,
  "video_size": 52428800,
  "video_format": "mp4",
  "is_free": true,
  "sort_order": 1
}
```

---

## 4. 分类模块

### 4.1 获取分类列表

**接口**: `GET /categories`

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "后端开发",
    "parent_id": null,
    "sort_order": 1,
    "is_active": true,
    "children": [
      {
        "id": 2,
        "name": "Python",
        "parent_id": 1,
        "sort_order": 1
      }
    ]
  }
]
```

---

### 4.2 创建分类

**接口**: `POST /categories`

**需要认证**: ✅ (管理员)

**请求参数**:
```json
{
  "name": "Python",
  "parent_id": 1,
  "description": "Python相关课程",
  "sort_order": 1
}
```

---

## 5. 直播模块

### 5.1 获取直播列表

**接口**: `GET /lives`

**查询参数**:
- `page`: 页码
- `page_size`: 每页数量
- `status`: 直播状态 (not_started | living | finished)

**响应示例**:
```json
{
  "total": 20,
  "page": 1,
  "page_size": 10,
  "items": [
    {
      "id": 1,
      "title": "Python实战直播课",
      "description": "直播描述",
      "teacher_id": 2,
      "cover_image": "/static/uploads/images/live1.jpg",
      "status": "living",
      "start_time": "2025-11-05T19:00:00",
      "viewer_count": 156,
      "max_viewer_count": 200
    }
  ]
}
```

---

### 5.2 创建直播

**接口**: `POST /lives`

**需要认证**: ✅ (讲师/管理员)

**请求参数**:
```json
{
  "title": "Python实战直播课",
  "description": "直播描述",
  "cover_image": "/static/uploads/images/live.jpg",
  "start_time": "2025-11-06T19:00:00"
}
```

**响应示例**:
```json
{
  "id": 1,
  "title": "Python实战直播课",
  "push_url": "rtmp://localhost/live/room_1",
  "pull_url_rtmp": "rtmp://localhost/live/room_1",
  "pull_url_flv": "http://localhost:8080/live/room_1.flv",
  "pull_url_hls": "http://localhost:8080/live/room_1.m3u8",
  "status": "not_started"
}
```

---

## 错误响应格式

```json
{
  "detail": "错误信息描述"
}
```

### 常见状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权（未登录或Token无效）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 在线文档

访问 `http://localhost:8000/api/docs` 查看完整的交互式API文档（Swagger UI）。


