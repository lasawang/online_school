# 新功能实现说明

## 已实现的功能

### 1. 钱包系统 💰
**数据库表**:
- `wallets` - 用户钱包表
- `transactions` - 交易记录表

**API端点** (`/api/v1/wallet`):
- `GET /my` - 获取当前用户钱包
- `POST /recharge` - 充值钱包
- `POST /purchase-course` - 购买课程
- `GET /transactions` - 获取交易记录
- `POST /admin/add-balance/{user_id}` - 管理员给用户添加余额

**功能说明**:
- 用户可以充值余额
- 用户可以使用余额购买课程
- 购买成功后自动创建课程报名记录
- 完整的交易记录追踪

### 2. 管理员功能 👨‍💼
**API端点** (`/api/v1/admin`):
- `POST /add-student` - 管理员添加学员到课程（免费分配）
- `POST /send-notification` - 发送通知给指定用户
- `POST /broadcast-notification` - 广播通知给所有用户
- `GET /enrollments/{course_id}` - 获取课程的所有报名学员
- `DELETE /remove-student/{enrollment_id}` - 移除学员

**功能说明**:
- 管理员可以免费将学员添加到课程
- 管理员可以发送通知给指定用户或广播给所有用户
- 管理员可以查看课程学员列表
- 管理员可以移除学员

### 3. 通知系统扩展 📢
**更新的表**: `notifications`
- 新增 `sender_id` - 发送者ID
- 新增 `course_id` - 关联课程ID
- 新增 `live_id` - 关联直播ID

**功能说明**:
- 支持管理员/老师发送通知
- 可关联课程或直播
- 支持定向发送或广播

### 4. 直播管理功能 📺
**数据库表**: `lives`
- 直播标题、描述、封面图
- 讲师ID、关联课程ID
- 推流地址、拉流地址
- 直播状态（scheduled/living/ended）
- 观看人数、开始时间、结束时间

**API端点** (`/api/v1/live-manage`):
- `POST /create` - 创建直播间
- `PUT /{live_id}` - 更新直播信息
- `POST /{live_id}/start` - 开始直播
- `POST /{live_id}/end` - 结束直播
- `GET /my-lives` - 获取我的直播列表
- `GET /{live_id}/detail` - 获取直播详情
- `DELETE /{live_id}` - 删除直播

**功能说明**:
- 老师/管理员可以创建直播间
- 自动生成推流和拉流地址
- 可关联课程，自动通知报名学员
- 完整的直播生命周期管理
- 支持查看观看人数

## 数据库迁移

运行以下命令创建新表：
```bash
python create_new_tables.py
```

## API文档

启动服务器后访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 使用流程示例

### 购买课程流程:
1. 用户充值钱包: `POST /api/v1/wallet/recharge`
2. 用户购买课程: `POST /api/v1/wallet/purchase-course`
3. 系统自动创建报名记录
4. 扣除相应金额

### 管理员分配课程流程:
1. 管理员添加学员: `POST /api/v1/admin/add-student`
2. 系统自动创建报名记录（免费）
3. 系统发送通知给学员

### 直播上课流程:
1. 老师创建直播: `POST /api/v1/live-manage/create`
2. 系统生成推流/拉流地址
3. 如果关联课程，自动通知所有报名学员
4. 老师开始直播: `POST /api/v1/live-manage/{live_id}/start`
5. 学生通过拉流地址观看
6. 直播结束: `POST /api/v1/live-manage/{live_id}/end`

## 权限说明

- **学生**: 可以充值、购买课程、查看自己的钱包
- **老师**: 除学生权限外，可以创建和管理自己的直播
- **管理员**: 拥有所有权限，可以:
  - 给用户充值
  - 免费分配课程给学员
  - 发送通知
  - 管理所有直播
  - 查看和管理所有学员

## 注意事项

1. 购买课程时会自动检查余额是否足够
2. 管理员添加学员不收费
3. 直播地址目前使用模拟地址，实际部署时需要对接真实的直播服务商（如阿里云直播、腾讯云直播等）
4. 所有交易都有完整的记录可追溯
