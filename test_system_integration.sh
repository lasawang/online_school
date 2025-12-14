#!/bin/bash

# IT学习课程平台 - 系统集成测试脚本
# 测试前端、后端、数据库的完整集成

set -e

echo "========================================"
echo "IT学习课程平台 - 系统集成测试"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0

# 测试函数
test_component() {
    local name="$1"
    local command="$2"
    
    echo -n "测试 $name ... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

# 1. 数据库测试
echo -e "${YELLOW}[1] 数据库测试${NC}"
test_component "MySQL服务" "sudo systemctl is-active mariadb"
test_component "数据库连接" "mysql -uit_user -pit_password_2024 -e 'USE it_learning; SELECT 1'"
test_component "用户表数据" "mysql -uit_user -pit_password_2024 -e 'SELECT COUNT(*) FROM it_learning.users' | grep -q '[0-9]'"
test_component "课程表数据" "mysql -uit_user -pit_password_2024 -e 'SELECT COUNT(*) FROM it_learning.courses' | grep -q '[0-9]'"
echo ""

# 2. 后端测试
echo -e "${YELLOW}[2] 后端API测试${NC}"
test_component "后端进程运行" "lsof -i:8000 > /dev/null"
test_component "健康检查接口" "curl -s http://localhost:8000/api/health | grep -q 'ok'"
test_component "根路径接口" "curl -s http://localhost:8000/ | grep -q '欢迎使用'"
test_component "登录接口" "curl -s -X POST http://localhost:8000/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}' | grep -q 'access_token'"
test_component "课程列表接口" "curl -s http://localhost:8000/api/v1/courses | grep -q 'items'"
test_component "分类列表接口" "curl -s http://localhost:8000/api/v1/categories | grep -q 'id'"
echo ""

# 3. CORS测试
echo -e "${YELLOW}[3] CORS跨域测试${NC}"
test_component "OPTIONS预检请求" "curl -s -X OPTIONS http://localhost:8000/api/v1/courses -H 'Origin: https://3000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai' -i | grep -q 'access-control-allow-origin'"
test_component "跨域GET请求" "curl -s http://localhost:8000/api/v1/courses -H 'Origin: https://3000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai' -i | grep -q 'access-control-allow-origin'"
echo ""

# 4. 前端测试
echo -e "${YELLOW}[4] 前端服务测试${NC}"
test_component "前端进程运行" "lsof -i:3000 > /dev/null"
test_component "前端页面访问" "curl -s http://localhost:3000 | grep -q 'IT学习课程平台'"
test_component "前端JS加载" "curl -s http://localhost:3000 | grep -q 'src.*main.tsx'"
echo ""

# 5. 前后端集成测试
echo -e "${YELLOW}[5] 前后端集成测试${NC}"

# 登录获取token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    test_component "Token获取" "[ ! -z '$TOKEN' ]"
    test_component "认证接口(带Token)" "curl -s http://localhost:8000/api/v1/auth/me -H 'Authorization: Bearer $TOKEN' | grep -q 'admin'"
    test_component "我的课程(带Token)" "curl -s http://localhost:8000/api/v1/learning/my-courses -H 'Authorization: Bearer $TOKEN' | grep -q 'courses\|items'"
    test_component "学习统计(带Token)" "curl -s http://localhost:8000/api/v1/learning/stats -H 'Authorization: Bearer $TOKEN' | grep -q 'learning_courses'"
else
    echo -e "${RED}✗ 无法获取Token，跳过认证测试${NC}"
    ((FAIL_COUNT+=4))
fi
echo ""

# 6. 数据一致性测试
echo -e "${YELLOW}[6] 数据一致性测试${NC}"
DB_USER_COUNT=$(mysql -uit_user -pit_password_2024 -sN -e "SELECT COUNT(*) FROM it_learning.users")
DB_COURSE_COUNT=$(mysql -uit_user -pit_password_2024 -sN -e "SELECT COUNT(*) FROM it_learning.courses WHERE status='PUBLISHED'")

test_component "用户数据一致性" "[ $DB_USER_COUNT -gt 0 ]"
test_component "课程数据一致性" "[ $DB_COURSE_COUNT -gt 0 ]"
echo ""

# 7. 性能测试
echo -e "${YELLOW}[7] 基础性能测试${NC}"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:8000/api/health)
test_component "API响应时间(<1s)" "echo $RESPONSE_TIME | awk '{if($1 < 1) exit 0; else exit 1}'"
echo ""

# 总结
echo "========================================"
echo "测试总结"
echo "========================================"
echo -e "总测试数: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}通过: $PASS_COUNT${NC}"
echo -e "${RED}失败: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 所有测试通过！系统完全可用！${NC}"
    echo ""
    echo "前端地址: https://3000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai"
    echo "后端地址: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai"
    echo "API文档: https://8000-is16wm2i8rtfwbbxs5fmi-b237eb32.sandbox.novita.ai/docs"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}✗ 有测试失败，请检查系统配置${NC}"
    exit 1
fi
