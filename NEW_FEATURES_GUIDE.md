# 新功能使用指南

## 🎉 最新功能更新

本次更新实现了三大核心功能：

1. **视频进度条拖动** - 自由控制视频播放进度
2. **首页轮播图** - 动态Banner展示，可自定义管理
3. **钱包充值管理** - 管理员为用户账户充值

---

## 1️⃣ 视频进度条拖动功能

### 功能说明
视频播放器已支持完整的进度条拖动功能，用户可以：
- ✅ 拖动进度条快进/快退
- ✅ 点击进度条跳转到指定位置
- ✅ 自动保存观看进度
- ✅ 下次观看时从上次位置继续

### 使用方法
1. 登录系统
2. 进入任意课程详情页
3. 点击播放视频
4. 使用鼠标拖动视频播放器下方的进度条

### 技术实现
- 使用HTML5原生 `<video>` 标签的 `controls` 属性
- 原生支持所有浏览器标准操作
- 进度自动保存到后端

### 相关文件
- `frontend/src/pages/Course/VideoPlay.tsx` - 视频播放组件

---

## 2️⃣ 首页轮播图功能

### 功能说明
首页顶部显示动态轮播Banner，支持：
- ✅ 自动播放（3秒切换）
- ✅ 点击Banner跳转到指定链接
- ✅ 图片标题渐变遮罩效果
- ✅ 响应式设计

### 用户端使用
1. 访问首页
2. 轮播图自动显示和切换
3. 点击轮播图可跳转到关联链接

### 管理端使用
详见下一节"轮播图管理"

---

## 3️⃣ 轮播图管理（管理后台）

### 访问路径
**管理后台 → 轮播图管理**

### 功能列表

#### 📋 轮播图列表
- 查看所有轮播图
- 显示图片预览
- 显示标题、链接、排序、状态

#### ➕ 添加轮播图
1. 点击"添加轮播图"按钮
2. 填写表单：
   - **标题**（必填）：轮播图标题
   - **图片URL**（必填）：图片地址
   - **链接URL**（可选）：点击跳转的链接
   - **排序**（必填）：数字越小越靠前
   - **状态**：启用/禁用

示例数据：
```
标题：IT学习课程推荐
图片URL：https://picsum.photos/1200/400?random=1
链接URL：https://example.com/courses
排序：1
状态：启用
```

#### ✏️ 编辑轮播图
1. 点击列表中的"编辑"按钮
2. 修改任意字段
3. 点击"确定"保存

#### 🗑️ 删除轮播图
1. 点击列表中的"删除"按钮
2. 确认删除操作
3. 轮播图从前台消失

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | 字符串 | 是 | 轮播图标题，显示在图片底部 |
| image_url | 字符串 | 是 | 图片地址，建议尺寸1200x400 |
| link_url | 字符串 | 否 | 点击跳转链接，可留空 |
| sort_order | 数字 | 是 | 排序，数字越小越靠前 |
| is_active | 布尔 | 是 | 是否启用，禁用后不在前台显示 |

### 使用建议

**图片规范：**
- 推荐尺寸：1200x400 像素
- 格式：JPG、PNG、WebP
- 大小：建议 < 500KB
- 内容：清晰、美观、与主题相关

**排序规则：**
- 1、2、3... 按数字顺序显示
- 可以使用 10、20、30... 方便插入

**链接设置：**
- 绝对路径：`https://example.com/page`
- 相对路径：`/courses/1`
- 留空：仅展示，不可点击

---

## 4️⃣ 钱包充值管理（管理后台）

### 访问路径
**管理后台 → 钱包管理**

### 功能说明
管理员可以为任意用户账户充值，支持：
- ✅ 查看所有用户列表
- ✅ 为用户账户充值任意金额
- ✅ 添加充值说明/备注
- ✅ 自动记录充值交易

### 使用步骤

#### 1. 查看用户列表
- 显示用户名、邮箱、姓名、角色
- 每个用户都有"充值"按钮

#### 2. 为用户充值
1. 点击目标用户的"充值"按钮
2. 弹出充值对话框，显示用户信息
3. 填写充值表单：
   - **充值金额**（必填）：必须大于0
   - **充值说明**（可选）：备注信息

示例：
```
充值金额：100
充值说明：活动奖励充值
```

4. 点击"确定"完成充值
5. 系统自动创建交易记录

#### 3. 充值记录
- 充值后自动创建交易记录
- 用户可在"我的钱包"中查看余额和交易记录
- 交易类型：ADMIN_ADD（管理员充值）

### 权限要求
- **管理员专属功能**
- 仅ADMIN角色可访问
- 教师和学生无法访问此功能

### 金额验证
- ✅ 必须输入金额
- ✅ 金额必须大于0
- ✅ 支持小数（如 99.50）
- ❌ 不支持负数
- ❌ 不支持0

### 使用场景

**常见充值场景：**
1. **新用户优惠**：注册奖励
2. **活动奖励**：完成任务获得奖励
3. **补偿充值**：系统问题补偿
4. **测试充值**：测试环境测试
5. **VIP权益**：VIP用户福利

**充值说明示例：**
- "新用户注册奖励"
- "完成课程学习奖励"
- "系统bug补偿"
- "VIP月度福利"
- "推荐好友奖励"

---

## 🔌 后端API说明

### Banner轮播图API

#### 获取轮播图列表
```
GET /api/v1/banners
```

**响应示例：**
```json
[
  {
    "id": 1,
    "title": "IT学习课程推荐",
    "image_url": "https://picsum.photos/1200/400",
    "link_url": "https://example.com",
    "sort_order": 1,
    "is_active": true,
    "created_at": "2025-12-14T10:00:00"
  }
]
```

#### 创建轮播图（管理员）
```
POST /api/v1/banners
Authorization: Bearer {token}

{
  "title": "课程推荐",
  "image_url": "https://example.com/image.jpg",
  "link_url": "https://example.com/page",
  "sort_order": 1,
  "is_active": true
}
```

#### 更新轮播图（管理员）
```
PUT /api/v1/banners/{banner_id}
Authorization: Bearer {token}

{
  "title": "新标题",
  "is_active": false
}
```

#### 删除轮播图（管理员）
```
DELETE /api/v1/banners/{banner_id}
Authorization: Bearer {token}
```

---

### 钱包充值API

#### 管理员为用户充值
```
POST /api/v1/wallet/admin/add-balance/{user_id}?amount=100&description=管理员充值
Authorization: Bearer {admin_token}
```

**参数说明：**
- `user_id`：用户ID（路径参数）
- `amount`：充值金额（查询参数，必填）
- `description`：充值说明（查询参数，可选）

**响应示例：**
```json
{
  "id": 123,
  "wallet_id": 45,
  "user_id": 2,
  "type": "ADMIN_ADD",
  "amount": 100.00,
  "balance_before": 50.00,
  "balance_after": 150.00,
  "description": "管理员充值",
  "created_at": "2025-12-14T10:30:00"
}
```

#### 获取用户钱包
```
GET /api/v1/wallet/my
Authorization: Bearer {token}
```

#### 获取交易记录
```
GET /api/v1/wallet/transactions?skip=0&limit=20
Authorization: Bearer {token}
```

---

## 📱 界面截图说明

### 首页轮播图
- 位置：首页顶部，欢迎区域下方
- 高度：300px
- 自动播放：3秒切换
- 渐变遮罩：底部标题区域

### 管理后台 - 轮播图管理
- 表格展示：图片预览、标题、链接、排序、状态
- 操作按钮：编辑、删除
- 添加按钮：右上角"添加轮播图"

### 管理后台 - 钱包管理
- 用户列表：用户名、邮箱、姓名、角色
- 充值按钮：每行末尾
- 充值对话框：显示用户信息、输入金额和说明

---

## 🚀 快速开始

### 测试轮播图功能

1. **添加测试轮播图：**
```bash
# 登录管理后台
访问：https://3000-xxx.sandbox.novita.ai
账号：admin / admin123

# 进入轮播图管理
点击左侧菜单 → 轮播图管理

# 添加轮播图
点击"添加轮播图"
填写：
  标题：欢迎使用IT学习平台
  图片URL：https://picsum.photos/1200/400?random=1
  链接URL：/courses
  排序：1
  状态：启用
点击"确定"
```

2. **查看效果：**
```bash
# 返回首页
点击左侧菜单 → 返回首页
或直接访问：https://3000-xxx.sandbox.novita.ai

# 查看轮播图
首页顶部应该显示轮播图
自动切换动画
点击可跳转
```

### 测试钱包充值功能

1. **为用户充值：**
```bash
# 进入钱包管理
管理后台 → 钱包管理

# 选择用户
找到用户"student"
点击"充值"按钮

# 填写充值信息
充值金额：100
充值说明：测试充值
点击"确定"
```

2. **验证充值：**
```bash
# 切换到学生账号
退出登录
使用 student / student123 登录

# 查看钱包
点击顶部"我的钱包"
应该看到余额增加100元
交易记录中显示"测试充值"
```

---

## 💡 常见问题

### Q1: 轮播图不显示？
**A:** 检查以下几点：
1. Banner是否设置为"启用"状态
2. 图片URL是否可访问
3. 浏览器控制台是否有错误
4. 刷新页面重试

### Q2: 图片显示不正常？
**A:** 
- 检查图片URL是否正确
- 确保图片可公开访问（无需认证）
- 推荐使用图床或CDN
- 图片尺寸建议1200x400

### Q3: 充值后余额未更新？
**A:**
- 刷新页面
- 重新登录
- 检查交易记录是否有新记录
- 查看后端日志是否有错误

### Q4: 钱包管理看不到用户？
**A:**
- 确保使用管理员账号登录
- 教师和学生无权访问
- 检查用户是否存在于数据库

### Q5: 视频进度条拖不动？
**A:**
- 确保视频已加载
- 检查视频URL是否有效
- 尝试刷新页面
- 检查浏览器是否支持HTML5视频

---

## 🔧 技术细节

### 前端技术栈
- **UI框架：** Ant Design 5
- **轮播组件：** Carousel
- **视频播放：** HTML5 Video
- **状态管理：** React Hooks
- **HTTP请求：** Axios

### 后端技术栈
- **框架：** FastAPI
- **ORM：** SQLAlchemy
- **数据库：** MySQL/MariaDB
- **认证：** JWT

### 数据库表结构

**banners表：**
```sql
CREATE TABLE banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**transactions表：**
```sql
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('RECHARGE', 'PURCHASE', 'REFUND', 'ADMIN_ADD') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 功能统计

### 已实现功能数量
- **视频功能：** 1个（进度条拖动）
- **轮播图：** 5个（列表、添加、编辑、删除、显示）
- **钱包管理：** 3个（用户列表、充值、记录）
- **总计：** 9个新功能

### API接口数量
- **Banner API：** 4个接口
- **Wallet API：** 1个新接口（已有4个）
- **总计：** 5个接口

---

## 🎯 后续优化建议

### 轮播图功能
1. 添加图片上传功能
2. 支持拖拽排序
3. 添加点击统计
4. 支持定时发布
5. 添加轮播效果设置

### 钱包功能
1. 批量充值功能
2. 充值审核流程
3. 充值限额设置
4. 导出充值记录
5. 充值统计报表

### 视频功能
1. 记忆播放速度
2. 添加字幕支持
3. 画质切换
4. 播放列表
5. 快捷键操作

---

## 📞 技术支持

### 相关文档
- **项目仓库：** https://github.com/lasawang/online_school
- **API文档：** https://8000-xxx.sandbox.novita.ai/docs
- **功能完成报告：** FINAL_COMPLETION_REPORT.md

### 测试账号
- **管理员：** admin / admin123
- **教师：** teacher / teacher123
- **学生：** student / student123

### 访问地址
- **前端：** https://3000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai
- **后端：** https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai

---

*更新时间：2025-12-14*  
*版本：v2.0.0*  
*状态：生产就绪 ✅*
