#!/bin/bash
# IT学习课程平台 - 停止服务脚本

echo "======================================"
echo "  IT学习课程平台 - 停止服务"
echo "======================================"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 停止后端
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "停止后端服务 (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || echo "  后端服务已停止"
    rm -f .backend.pid
else
    echo "未找到后端PID文件"
fi

# 停止前端
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "停止前端服务 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || echo "  前端服务已停止"
    rm -f .frontend.pid
else
    echo "未找到前端PID文件"
fi

# 额外清理可能残留的进程
echo ""
echo "清理可能残留的进程..."
pkill -f "uvicorn app.main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo ""
echo "======================================"
echo "  所有服务已停止"
echo "======================================"
