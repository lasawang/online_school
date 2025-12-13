#!/bin/bash

# IT学习课程平台 - 后端API全面测试脚本
# 测试所有后端接口的功能

BASE_URL="http://localhost:8000"
TOKEN_FILE="/tmp/api_token.txt"
TEST_RESULTS="/tmp/api_test_results.txt"

# 清空测试结果文件
> $TEST_RESULTS

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印测试结果
print_result() {
    local test_name="$1"
    local status="$2"
    local response="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        echo "PASS: $test_name" >> $TEST_RESULTS
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        echo "FAIL: $test_name - $response" >> $TEST_RESULTS
    fi
    echo "Response: $response"
    echo "---"
}

echo "========================================"
echo "IT学习课程平台 API 全面测试"
echo "========================================"
echo ""

# ====================
# 1. 基础接口测试
# ====================
echo -e "${YELLOW}[1] 基础接口测试${NC}"
echo ""

# 1.1 健康检查
echo "1.1 健康检查 GET /api/health"
response=$(curl -s "$BASE_URL/api/health")
if echo "$response" | grep -q '"status":"ok"'; then
    print_result "健康检查" "PASS" "$response"
else
    print_result "健康检查" "FAIL" "$response"
fi

# 1.2 根路径
echo "1.2 根路径 GET /"
response=$(curl -s "$BASE_URL/")
if echo "$response" | grep -q "欢迎使用IT学习课程平台API"; then
    print_result "根路径" "PASS" "$response"
else
    print_result "根路径" "FAIL" "$response"
fi

# ====================
# 2. 认证接口测试
# ====================
echo -e "${YELLOW}[2] 认证接口测试${NC}"
echo ""

# 2.1 用户注册（注册一个新用户用于测试）
echo "2.1 用户注册 POST /api/v1/auth/register"
TIMESTAMP=$(date +%s)
TEST_USER="testuser_$TIMESTAMP"
response=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USER\",
        \"email\": \"$TEST_USER@test.com\",
        \"password\": \"test123456\",
        \"full_name\": \"Test User\"
    }")
if echo "$response" | grep -q "username"; then
    print_result "用户注册" "PASS" "$response"
else
    print_result "用户注册" "FAIL" "$response"
fi

# 2.2 用户登录（使用已存在的admin账号）
echo "2.2 用户登录 POST /api/v1/auth/login"
response=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"admin\",
        \"password\": \"admin123\"
    }")
if echo "$response" | grep -q "access_token"; then
    TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "$TOKEN" > $TOKEN_FILE
    print_result "用户登录" "PASS" "Token已保存"
else
    print_result "用户登录" "FAIL" "$response"
    echo "登录失败，后续需要认证的测试将无法进行"
    exit 1
fi

# 2.3 获取当前用户信息
echo "2.3 获取当前用户信息 GET /api/v1/auth/me"
TOKEN=$(cat $TOKEN_FILE)
response=$(curl -s -X GET "$BASE_URL/api/v1/auth/me" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q '"username":"admin"'; then
    print_result "获取当前用户信息" "PASS" "$response"
else
    print_result "获取当前用户信息" "FAIL" "$response"
fi

# 2.4 修改密码（使用新注册的用户登录后修改）
echo "2.4 修改密码 POST /api/v1/auth/change-password"
# 先登录新用户
new_user_response=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USER\",
        \"password\": \"test123456\"
    }")
NEW_USER_TOKEN=$(echo "$new_user_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# 修改密码
response=$(curl -s -X POST "$BASE_URL/api/v1/auth/change-password" \
    -H "Authorization: Bearer $NEW_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"old_password\": \"test123456\",
        \"new_password\": \"newpass123456\"
    }")
if echo "$response" | grep -q "修改成功\|success"; then
    print_result "修改密码" "PASS" "$response"
else
    print_result "修改密码" "FAIL" "$response"
fi

# 2.5 更新个人信息
echo "2.5 更新个人信息 PUT /api/v1/auth/profile"
response=$(curl -s -X PUT "$BASE_URL/api/v1/auth/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"full_name\": \"Admin Updated\",
        \"phone\": \"13800138000\"
    }")
if echo "$response" | grep -q "Admin Updated\|success"; then
    print_result "更新个人信息" "PASS" "$response"
else
    print_result "更新个人信息" "FAIL" "$response"
fi

# ====================
# 3. 分类接口测试
# ====================
echo -e "${YELLOW}[3] 分类接口测试${NC}"
echo ""

# 3.1 获取分类列表
echo "3.1 获取分类列表 GET /api/v1/categories"
response=$(curl -s "$BASE_URL/api/v1/categories")
if echo "$response" | grep -q "编程语言\|前端开发"; then
    CATEGORY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "获取分类列表" "PASS" "找到分类ID: $CATEGORY_ID"
else
    print_result "获取分类列表" "FAIL" "$response"
fi

# 3.2 创建分类（管理员）
echo "3.2 创建分类 POST /api/v1/categories"
response=$(curl -s -X POST "$BASE_URL/api/v1/categories" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"测试分类_$TIMESTAMP\",
        \"description\": \"这是一个测试分类\"
    }")
if echo "$response" | grep -q "测试分类"; then
    TEST_CATEGORY_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "创建分类" "PASS" "创建分类ID: $TEST_CATEGORY_ID"
else
    print_result "创建分类" "FAIL" "$response"
fi

# 3.3 更新分类
echo "3.3 更新分类 PUT /api/v1/categories/$TEST_CATEGORY_ID"
response=$(curl -s -X PUT "$BASE_URL/api/v1/categories/$TEST_CATEGORY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"测试分类_更新\",
        \"description\": \"更新后的描述\"
    }")
if echo "$response" | grep -q "测试分类_更新\|success"; then
    print_result "更新分类" "PASS" "$response"
else
    print_result "更新分类" "FAIL" "$response"
fi

# ====================
# 4. 课程接口测试
# ====================
echo -e "${YELLOW}[4] 课程接口测试${NC}"
echo ""

# 4.1 获取课程列表
echo "4.1 获取课程列表 GET /api/v1/courses"
response=$(curl -s "$BASE_URL/api/v1/courses?page=1&page_size=10")
if echo "$response" | grep -q '"items":\['; then
    COURSE_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "获取课程列表" "PASS" "找到课程ID: $COURSE_ID"
else
    print_result "获取课程列表" "FAIL" "$response"
fi

# 4.2 获取课程详情
echo "4.2 获取课程详情 GET /api/v1/courses/$COURSE_ID"
response=$(curl -s "$BASE_URL/api/v1/courses/$COURSE_ID")
if echo "$response" | grep -q '"id":'$COURSE_ID; then
    print_result "获取课程详情" "PASS" "$response"
else
    print_result "获取课程详情" "FAIL" "$response"
fi

# 4.3 创建课程（教师/管理员）
echo "4.3 创建课程 POST /api/v1/courses"
response=$(curl -s -X POST "$BASE_URL/api/v1/courses" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"测试课程_$TIMESTAMP\",
        \"description\": \"这是一个测试课程\",
        \"category_id\": $CATEGORY_ID,
        \"price\": 99.00,
        \"cover_image\": \"https://example.com/cover.jpg\"
    }")
if echo "$response" | grep -q "测试课程"; then
    TEST_COURSE_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "创建课程" "PASS" "创建课程ID: $TEST_COURSE_ID"
else
    print_result "创建课程" "FAIL" "$response"
fi

# 4.4 更新课程
echo "4.4 更新课程 PUT /api/v1/courses/$TEST_COURSE_ID"
response=$(curl -s -X PUT "$BASE_URL/api/v1/courses/$TEST_COURSE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"测试课程_更新\",
        \"price\": 199.00
    }")
if echo "$response" | grep -q "测试课程_更新\|success"; then
    print_result "更新课程" "PASS" "$response"
else
    print_result "更新课程" "FAIL" "$response"
fi

# 4.5 报名课程
echo "4.5 报名课程 POST /api/v1/courses/$COURSE_ID/enroll"
response=$(curl -s -X POST "$BASE_URL/api/v1/courses/$COURSE_ID/enroll" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "success\|报名成功\|已报名"; then
    print_result "报名课程" "PASS" "$response"
else
    print_result "报名课程" "FAIL" "$response"
fi

# 4.6 检查报名状态
echo "4.6 检查报名状态 GET /api/v1/courses/$COURSE_ID/is_enrolled"
response=$(curl -s "$BASE_URL/api/v1/courses/$COURSE_ID/is_enrolled" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "true\|enrolled"; then
    print_result "检查报名状态" "PASS" "$response"
else
    print_result "检查报名状态" "FAIL" "$response"
fi

# ====================
# 5. 章节接口测试
# ====================
echo -e "${YELLOW}[5] 章节接口测试${NC}"
echo ""

# 5.1 创建章节
echo "5.1 创建章节 POST /api/v1/chapters"
response=$(curl -s -X POST "$BASE_URL/api/v1/chapters" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"course_id\": $TEST_COURSE_ID,
        \"title\": \"测试章节_$TIMESTAMP\",
        \"order_num\": 1
    }")
if echo "$response" | grep -q "测试章节"; then
    TEST_CHAPTER_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "创建章节" "PASS" "创建章节ID: $TEST_CHAPTER_ID"
else
    print_result "创建章节" "FAIL" "$response"
fi

# 5.2 创建小节
echo "5.2 创建小节 POST /api/v1/chapters/sections"
response=$(curl -s -X POST "$BASE_URL/api/v1/chapters/sections" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"chapter_id\": $TEST_CHAPTER_ID,
        \"title\": \"测试小节_$TIMESTAMP\",
        \"video_url\": \"https://example.com/video.mp4\",
        \"duration\": 600,
        \"order_num\": 1
    }")
if echo "$response" | grep -q "测试小节"; then
    TEST_SECTION_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "创建小节" "PASS" "创建小节ID: $TEST_SECTION_ID"
else
    print_result "创建小节" "FAIL" "$response"
fi

# ====================
# 6. 学习记录接口测试
# ====================
echo -e "${YELLOW}[6] 学习记录接口测试${NC}"
echo ""

# 6.1 创建/更新学习记录
echo "6.1 创建学习记录 POST /api/v1/learning/records"
if [ ! -z "$TEST_SECTION_ID" ]; then
    response=$(curl -s -X POST "$BASE_URL/api/v1/learning/records" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"section_id\": $TEST_SECTION_ID,
            \"progress\": 50,
            \"duration\": 300
        }")
    if echo "$response" | grep -q "success\|id"; then
        print_result "创建学习记录" "PASS" "$response"
    else
        print_result "创建学习记录" "FAIL" "$response"
    fi
else
    print_result "创建学习记录" "SKIP" "没有可用的小节ID"
fi

# 6.2 获取我的课程
echo "6.2 获取我的课程 GET /api/v1/learning/my-courses"
response=$(curl -s "$BASE_URL/api/v1/learning/my-courses" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "courses\|items\|\[\]"; then
    print_result "获取我的课程" "PASS" "$response"
else
    print_result "获取我的课程" "FAIL" "$response"
fi

# 6.3 获取学习统计
echo "6.3 获取学习统计 GET /api/v1/learning/stats"
response=$(curl -s "$BASE_URL/api/v1/learning/stats" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "learning_courses\|completed_sections"; then
    print_result "获取学习统计" "PASS" "$response"
else
    print_result "获取学习统计" "FAIL" "$response"
fi

# ====================
# 7. 收藏接口测试
# ====================
echo -e "${YELLOW}[7] 收藏接口测试${NC}"
echo ""

# 7.1 收藏课程
echo "7.1 收藏课程 POST /api/v1/learning/collections/$COURSE_ID"
response=$(curl -s -X POST "$BASE_URL/api/v1/learning/collections/$COURSE_ID" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "success\|收藏"; then
    print_result "收藏课程" "PASS" "$response"
else
    print_result "收藏课程" "FAIL" "$response"
fi

# 7.2 检查收藏状态
echo "7.2 检查收藏状态 GET /api/v1/learning/collections/check/$COURSE_ID"
response=$(curl -s "$BASE_URL/api/v1/learning/collections/check/$COURSE_ID" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "true\|collected"; then
    print_result "检查收藏状态" "PASS" "$response"
else
    print_result "检查收藏状态" "FAIL" "$response"
fi

# 7.3 获取收藏列表
echo "7.3 获取收藏列表 GET /api/v1/learning/collections"
response=$(curl -s "$BASE_URL/api/v1/learning/collections" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "items\|courses\|\[\]"; then
    print_result "获取收藏列表" "PASS" "$response"
else
    print_result "获取收藏列表" "FAIL" "$response"
fi

# ====================
# 8. 评论接口测试
# ====================
echo -e "${YELLOW}[8] 评论接口测试${NC}"
echo ""

# 8.1 发表评论
echo "8.1 发表评论 POST /api/v1/comments"
response=$(curl -s -X POST "$BASE_URL/api/v1/comments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"course_id\": $COURSE_ID,
        \"content\": \"这是一个测试评论\",
        \"rating\": 5
    }")
if echo "$response" | grep -q "测试评论\|id"; then
    TEST_COMMENT_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "发表评论" "PASS" "创建评论ID: $TEST_COMMENT_ID"
else
    print_result "发表评论" "FAIL" "$response"
fi

# 8.2 获取评论列表
echo "8.2 获取评论列表 GET /api/v1/comments?course_id=$COURSE_ID"
response=$(curl -s "$BASE_URL/api/v1/comments?course_id=$COURSE_ID")
if echo "$response" | grep -q "items\|comments\|\[\]"; then
    print_result "获取评论列表" "PASS" "$response"
else
    print_result "获取评论列表" "FAIL" "$response"
fi

# 8.3 点赞评论
if [ ! -z "$TEST_COMMENT_ID" ]; then
    echo "8.3 点赞评论 POST /api/v1/comments/$TEST_COMMENT_ID/like"
    response=$(curl -s -X POST "$BASE_URL/api/v1/comments/$TEST_COMMENT_ID/like" \
        -H "Authorization: Bearer $TOKEN")
    if echo "$response" | grep -q "success\|点赞"; then
        print_result "点赞评论" "PASS" "$response"
    else
        print_result "点赞评论" "FAIL" "$response"
    fi
fi

# ====================
# 9. 直播接口测试
# ====================
echo -e "${YELLOW}[9] 直播接口测试${NC}"
echo ""

# 9.1 获取直播列表
echo "9.1 获取直播列表 GET /api/v1/lives"
response=$(curl -s "$BASE_URL/api/v1/lives")
if echo "$response" | grep -q "items\|lives\|\[\]"; then
    print_result "获取直播列表" "PASS" "$response"
else
    print_result "获取直播列表" "FAIL" "$response"
fi

# 9.2 创建直播
echo "9.2 创建直播 POST /api/v1/lives"
response=$(curl -s -X POST "$BASE_URL/api/v1/lives" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"测试直播_$TIMESTAMP\",
        \"description\": \"这是一个测试直播\",
        \"course_id\": $COURSE_ID,
        \"scheduled_time\": \"2025-12-20T10:00:00\"
    }")
if echo "$response" | grep -q "测试直播\|id"; then
    TEST_LIVE_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "创建直播" "PASS" "创建直播ID: $TEST_LIVE_ID"
else
    print_result "创建直播" "FAIL" "$response"
fi

# ====================
# 10. Banner接口测试
# ====================
echo -e "${YELLOW}[10] Banner接口测试${NC}"
echo ""

# 10.1 获取Banner列表
echo "10.1 获取Banner列表 GET /api/v1/banners"
response=$(curl -s "$BASE_URL/api/v1/banners")
if echo "$response" | grep -q "items\|banners\|\[\]"; then
    print_result "获取Banner列表" "PASS" "$response"
else
    print_result "获取Banner列表" "FAIL" "$response"
fi

# 10.2 创建Banner（管理员）
echo "10.2 创建Banner POST /api/v1/banners"
response=$(curl -s -X POST "$BASE_URL/api/v1/banners" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"测试Banner_$TIMESTAMP\",
        \"image_url\": \"https://example.com/banner.jpg\",
        \"link_url\": \"https://example.com\",
        \"order_num\": 1
    }")
if echo "$response" | grep -q "测试Banner\|id"; then
    TEST_BANNER_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_result "创建Banner" "PASS" "创建BannerID: $TEST_BANNER_ID"
else
    print_result "创建Banner" "FAIL" "$response"
fi

# ====================
# 11. 钱包接口测试
# ====================
echo -e "${YELLOW}[11] 钱包接口测试${NC}"
echo ""

# 11.1 获取我的钱包
echo "11.1 获取我的钱包 GET /api/v1/wallet/my"
response=$(curl -s "$BASE_URL/api/v1/wallet/my" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "balance\|wallet"; then
    print_result "获取我的钱包" "PASS" "$response"
else
    print_result "获取我的钱包" "FAIL" "$response"
fi

# 11.2 钱包充值
echo "11.2 钱包充值 POST /api/v1/wallet/recharge"
response=$(curl -s -X POST "$BASE_URL/api/v1/wallet/recharge" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"amount\": 100.00
    }")
if echo "$response" | grep -q "success\|balance"; then
    print_result "钱包充值" "PASS" "$response"
else
    print_result "钱包充值" "FAIL" "$response"
fi

# 11.3 获取交易记录
echo "11.3 获取交易记录 GET /api/v1/wallet/transactions"
response=$(curl -s "$BASE_URL/api/v1/wallet/transactions" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "items\|transactions\|\[\]"; then
    print_result "获取交易记录" "PASS" "$response"
else
    print_result "获取交易记录" "FAIL" "$response"
fi

# ====================
# 12. 系统设置接口测试
# ====================
echo -e "${YELLOW}[12] 系统设置接口测试${NC}"
echo ""

# 12.1 获取系统设置
echo "12.1 获取系统设置 GET /api/v1/settings"
response=$(curl -s "$BASE_URL/api/v1/settings")
if echo "$response" | grep -q "items\|settings\|\[\]"; then
    print_result "获取系统设置" "PASS" "$response"
else
    print_result "获取系统设置" "FAIL" "$response"
fi

# ====================
# 13. 通知接口测试
# ====================
echo -e "${YELLOW}[13] 通知接口测试${NC}"
echo ""

# 13.1 获取我的通知
echo "13.1 获取我的通知 GET /api/v1/notifications"
response=$(curl -s "$BASE_URL/api/v1/notifications" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "items\|notifications\|\[\]"; then
    print_result "获取我的通知" "PASS" "$response"
else
    print_result "获取我的通知" "FAIL" "$response"
fi

# ====================
# 14. 管理员接口测试
# ====================
echo -e "${YELLOW}[14] 管理员接口测试${NC}"
echo ""

# 14.1 获取用户列表
echo "14.1 获取用户列表 GET /api/v1/auth/users"
response=$(curl -s "$BASE_URL/api/v1/auth/users?page=1&page_size=10" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "items\|users\|\[\]"; then
    print_result "获取用户列表" "PASS" "$response"
else
    print_result "获取用户列表" "FAIL" "$response"
fi

# 14.2 获取统计数据
echo "14.2 获取统计数据 GET /api/v1/admin/stats"
response=$(curl -s "$BASE_URL/api/v1/admin/stats" \
    -H "Authorization: Bearer $TOKEN")
if echo "$response" | grep -q "total_users\|total_courses"; then
    print_result "获取统计数据" "PASS" "$response"
else
    print_result "获取统计数据" "FAIL" "$response"
fi

# ====================
# 测试总结
# ====================
echo ""
echo "========================================"
echo "测试完成！"
echo "========================================"
echo ""

# 统计测试结果
total_tests=$(grep -c ":" $TEST_RESULTS)
passed_tests=$(grep -c "^PASS" $TEST_RESULTS)
failed_tests=$(grep -c "^FAIL" $TEST_RESULTS)

echo "总测试数: $total_tests"
echo -e "${GREEN}通过: $passed_tests${NC}"
echo -e "${RED}失败: $failed_tests${NC}"
echo ""
echo "详细结果已保存到: $TEST_RESULTS"
echo ""

# 如果有失败的测试，显示失败列表
if [ $failed_tests -gt 0 ]; then
    echo -e "${RED}失败的测试:${NC}"
    grep "^FAIL" $TEST_RESULTS
fi

exit 0
