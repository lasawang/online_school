#!/bin/bash
# IT学习课程平台 - 状态检查脚本

echo "======================================"
echo "  IT学习课程平台 - 系统状态检查"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1: $(command -v $1)"
        if [ "$1" = "python3" ]; then
            echo "  版本: $(python3 --version)"
        elif [ "$1" = "node" ]; then
            echo "  版本: $(node --version)"
        elif [ "$1" = "npm" ]; then
            echo "  版本: $(npm --version)"
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $1: 未安装"
        return 1
    fi
}

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} 端口 $1: 正在使用"
        echo "  进程: $(lsof -Pi :$1 -sTCP:LISTEN | tail -n +2 | awk '{print $1}' | head -1)"
        return 0
    else
        echo -e "${YELLOW}○${NC} 端口 $1: 空闲"
        return 1
    fi
}

# 1. 检查必需工具
echo "1. 检查必需工具："
echo "-----------------------------------"
check_command python3
check_command node
check_command npm
check_command mysql
check_command redis-server
echo ""

# 2. 检查项目文件
echo "2. 检查项目文件："
echo "-----------------------------------"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env 存在"
else
    echo -e "${RED}✗${NC} backend/.env 缺失"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env 存在"
else
    echo -e "${RED}✗${NC} frontend/.env 缺失"
fi

if [ -d "backend/venv" ]; then
    echo -e "${GREEN}✓${NC} Python虚拟环境已创建"
else
    echo -e "${YELLOW}○${NC} Python虚拟环境未创建"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node模块已安装"
else
    echo -e "${YELLOW}○${NC} Node模块未安装"
fi
echo ""

# 3. 检查目录结构
echo "3. 检查目录结构："
echo "-----------------------------------"
if [ -d "backend/static/uploads" ]; then
    echo -e "${GREEN}✓${NC} backend/static/uploads 存在"
else
    echo -e "${RED}✗${NC} backend/static/uploads 缺失"
fi
echo ""

# 4. 检查端口占用
echo "4. 检查端口状态："
echo "-----------------------------------"
check_port 8000
check_port 3000
check_port 3306
check_port 6379
echo ""

# 5. 检查服务状态
echo "5. 检查服务状态："
echo "-----------------------------------"
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} 后端服务运行中 (PID: $BACKEND_PID)"
    else
        echo -e "${RED}✗${NC} 后端服务已停止 (PID文件存在但进程不存在)"
    fi
else
    echo -e "${YELLOW}○${NC} 后端服务未启动"
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} 前端服务运行中 (PID: $FRONTEND_PID)"
    else
        echo -e "${RED}✗${NC} 前端服务已停止 (PID文件存在但进程不存在)"
    fi
else
    echo -e "${YELLOW}○${NC} 前端服务未启动"
fi
echo ""

# 6. 检查数据库连接
echo "6. 检查数据库连接："
echo "-----------------------------------"
if command -v mysql &> /dev/null; then
    # 从.env读取数据库配置
    if [ -f "backend/.env" ]; then
        DB_URL=$(grep DATABASE_URL backend/.env | cut -d '=' -f2)
        echo "  数据库URL: $DB_URL"
        # 这里可以添加实际的数据库连接测试
    fi
fi
echo ""

# 总结
echo "======================================"
echo "  状态检查完成"
echo "======================================"
echo ""
echo "快速启动命令："
echo "  启动所有服务: ./start_all.sh"
echo "  停止所有服务: ./stop_all.sh"
echo "  查看日志: tail -f backend.log frontend.log"
echo ""
