# 数据库设计文档

## 数据库信息
- 数据库名：`it_study_platform`
- 字符集：`utf8mb4`
- 排序规则：`utf8mb4_unicode_ci`

## 表结构设计

### 1. 用户表 (users)

存储系统用户信息，支持学员、讲师、管理员三种角色。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| role | ENUM | DEFAULT 'student' | 角色(student/teacher/admin) |
| avatar | VARCHAR(255) | NULL | 头像URL |
| full_name | VARCHAR(100) | NULL | 真实姓名 |
| phone | VARCHAR(20) | NULL | 手机号 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否激活 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- UNIQUE INDEX (username)
- UNIQUE INDEX (email)
- INDEX (role)

---

### 2. 课程分类表 (categories)

支持树形结构的课程分类管理。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(100) | NOT NULL | 分类名称 |
| parent_id | INT | FK, NULL | 父分类ID |
| sort_order | INT | DEFAULT 0 | 排序 |
| description | TEXT | NULL | 分类描述 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否激活 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (parent_id) REFERENCES categories(id)
- INDEX (parent_id)
- INDEX (sort_order)

---

### 3. 课程表 (courses)

存储课程基本信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 课程ID |
| title | VARCHAR(200) | NOT NULL | 课程标题 |
| description | TEXT | NULL | 课程描述 |
| cover_image | VARCHAR(255) | NULL | 封面图片 |
| category_id | INT | FK, NOT NULL | 分类ID |
| teacher_id | INT | FK, NOT NULL | 讲师ID |
| price | DECIMAL(10,2) | DEFAULT 0.00 | 价格 |
| original_price | DECIMAL(10,2) | DEFAULT 0.00 | 原价 |
| status | ENUM | DEFAULT 'draft' | 状态(draft/published/offline) |
| level | ENUM | DEFAULT 'beginner' | 难度(beginner/intermediate/advanced) |
| tags | VARCHAR(255) | NULL | 标签 |
| student_count | INT | DEFAULT 0 | 学习人数 |
| rating | DECIMAL(3,2) | DEFAULT 0.00 | 评分 |
| rating_count | INT | DEFAULT 0 | 评分人数 |
| view_count | INT | DEFAULT 0 | 浏览次数 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (category_id) REFERENCES categories(id)
- FOREIGN KEY (teacher_id) REFERENCES users(id)
- INDEX (category_id)
- INDEX (teacher_id)
- INDEX (status)
- INDEX (created_at)
- FULLTEXT INDEX (title, description)

---

### 4. 章节表 (chapters)

课程的章节结构。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 章节ID |
| course_id | INT | FK, NOT NULL | 课程ID |
| title | VARCHAR(200) | NOT NULL | 章节标题 |
| description | TEXT | NULL | 章节描述 |
| sort_order | INT | DEFAULT 0 | 排序 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
- INDEX (course_id)
- INDEX (sort_order)

---

### 5. 小节表 (sections)

章节下的视频小节。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 小节ID |
| chapter_id | INT | FK, NOT NULL | 章节ID |
| title | VARCHAR(200) | NOT NULL | 小节标题 |
| video_url | VARCHAR(500) | NULL | 视频URL |
| video_duration | INT | DEFAULT 0 | 视频时长(秒) |
| video_size | BIGINT | DEFAULT 0 | 视频大小(字节) |
| video_format | VARCHAR(20) | NULL | 视频格式 |
| is_free | BOOLEAN | DEFAULT FALSE | 是否免费试看 |
| sort_order | INT | DEFAULT 0 | 排序 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
- INDEX (chapter_id)
- INDEX (sort_order)

---

### 6. 学习记录表 (learning_records)

记录用户的学习进度。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 记录ID |
| user_id | INT | FK, NOT NULL | 用户ID |
| course_id | INT | FK, NOT NULL | 课程ID |
| section_id | INT | FK, NOT NULL | 小节ID |
| progress | INT | DEFAULT 0 | 学习进度(0-100) |
| last_position | INT | DEFAULT 0 | 最后观看位置(秒) |
| is_completed | BOOLEAN | DEFAULT FALSE | 是否完成 |
| learning_time | INT | DEFAULT 0 | 累计学习时长(秒) |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- UNIQUE KEY (user_id, section_id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
- FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
- INDEX (user_id)
- INDEX (course_id)

---

### 7. 收藏表 (collections)

用户收藏的课程。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 收藏ID |
| user_id | INT | FK, NOT NULL | 用户ID |
| course_id | INT | FK, NOT NULL | 课程ID |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |

**索引**：
- PRIMARY KEY (id)
- UNIQUE KEY (user_id, course_id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
- INDEX (user_id)
- INDEX (course_id)

---

### 8. 评论表 (comments)

课程评论，支持回复。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 评论ID |
| user_id | INT | FK, NOT NULL | 用户ID |
| course_id | INT | FK, NOT NULL | 课程ID |
| parent_id | INT | FK, NULL | 父评论ID |
| content | TEXT | NOT NULL | 评论内容 |
| rating | INT | NULL | 评分(1-5) |
| like_count | INT | DEFAULT 0 | 点赞数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 是否删除 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
- FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
- INDEX (user_id)
- INDEX (course_id)
- INDEX (parent_id)

---

### 9. 直播间表 (live_rooms)

直播课程管理。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 直播间ID |
| title | VARCHAR(200) | NOT NULL | 直播标题 |
| description | TEXT | NULL | 直播描述 |
| teacher_id | INT | FK, NOT NULL | 讲师ID |
| cover_image | VARCHAR(255) | NULL | 封面图片 |
| push_url | VARCHAR(500) | NULL | 推流地址 |
| pull_url_rtmp | VARCHAR(500) | NULL | RTMP拉流地址 |
| pull_url_flv | VARCHAR(500) | NULL | FLV拉流地址 |
| pull_url_hls | VARCHAR(500) | NULL | HLS拉流地址 |
| status | ENUM | DEFAULT 'not_started' | 状态(not_started/living/finished) |
| start_time | TIMESTAMP | NULL | 开始时间 |
| end_time | TIMESTAMP | NULL | 结束时间 |
| viewer_count | INT | DEFAULT 0 | 当前观看人数 |
| max_viewer_count | INT | DEFAULT 0 | 最高观看人数 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (teacher_id) REFERENCES users(id)
- INDEX (teacher_id)
- INDEX (status)
- INDEX (start_time)

---

### 10. 直播聊天消息表 (live_chat_messages)

直播间聊天记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 消息ID |
| live_room_id | INT | FK, NOT NULL | 直播间ID |
| user_id | INT | FK, NOT NULL | 用户ID |
| message | TEXT | NOT NULL | 消息内容 |
| message_type | ENUM | DEFAULT 'text' | 消息类型(text/system) |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (live_room_id) REFERENCES live_rooms(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- INDEX (live_room_id)
- INDEX (created_at)

---

### 11. 轮播图表 (banners)

首页轮播图管理。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 轮播图ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| image_url | VARCHAR(255) | NOT NULL | 图片URL |
| link_url | VARCHAR(500) | NULL | 链接URL |
| sort_order | INT | DEFAULT 0 | 排序 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否激活 |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW | 更新时间 |

**索引**：
- PRIMARY KEY (id)
- INDEX (sort_order)
- INDEX (is_active)

---

### 12. 操作日志表 (operation_logs)

系统操作日志记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 日志ID |
| user_id | INT | FK, NULL | 用户ID |
| action | VARCHAR(100) | NOT NULL | 操作类型 |
| module | VARCHAR(50) | NOT NULL | 模块名称 |
| description | TEXT | NULL | 操作描述 |
| ip_address | VARCHAR(50) | NULL | IP地址 |
| user_agent | TEXT | NULL | User Agent |
| created_at | TIMESTAMP | DEFAULT NOW | 创建时间 |

**索引**：
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
- INDEX (user_id)
- INDEX (action)
- INDEX (created_at)

---

### 13. 课程报名表 (course_enrollments)

用户课程报名记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 报名ID |
| user_id | INT | FK, NOT NULL | 用户ID |
| course_id | INT | FK, NOT NULL | 课程ID |
| enrollment_date | TIMESTAMP | DEFAULT NOW | 报名时间 |
| expiry_date | TIMESTAMP | NULL | 过期时间 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否有效 |

**索引**：
- PRIMARY KEY (id)
- UNIQUE KEY (user_id, course_id)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
- INDEX (user_id)
- INDEX (course_id)

---

## ER关系图

```
users (用户)
  ├── courses (1:N) - 讲师创建的课程
  ├── learning_records (1:N) - 学习记录
  ├── collections (1:N) - 收藏
  ├── comments (1:N) - 评论
  ├── live_rooms (1:N) - 直播间
  └── course_enrollments (1:N) - 课程报名

categories (分类)
  ├── categories (1:N) - 子分类
  └── courses (1:N) - 分类下的课程

courses (课程)
  ├── chapters (1:N) - 章节
  ├── learning_records (1:N) - 学习记录
  ├── collections (1:N) - 收藏
  ├── comments (1:N) - 评论
  └── course_enrollments (1:N) - 课程报名

chapters (章节)
  └── sections (1:N) - 小节

sections (小节)
  └── learning_records (1:N) - 学习记录

live_rooms (直播间)
  └── live_chat_messages (1:N) - 聊天消息

comments (评论)
  └── comments (1:N) - 回复
```


