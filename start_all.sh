#!/bin/bash
# IT学习课程平台 - 一键启动脚本

echo "======================================"
echo "  IT学习课程平台 - 完整启动"
echo "======================================"
echo ""
echo "正在启动后端和前端服务..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 启动后端（后台运行）
echo "1. 启动后端服务..."
cd "$SCRIPT_DIR"
bash start_backend.sh > backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端服务已启动 (PID: $BACKEND_PID)"
echo "   日志文件: backend.log"

# 等待后端启动
echo "   等待后端服务启动..."
sleep 5

# 启动前端（后台运行）
echo ""
echo "2. 启动前端服务..."
cd "$SCRIPT_DIR"
bash start_frontend.sh > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端服务已启动 (PID: $FRONTEND_PID)"
echo "   日志文件: frontend.log"

# 保存PID到文件
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "======================================"
echo "  服务启动完成！"
echo "======================================"
echo ""
echo "  前端地址: http://localhost:3000"
echo "  后端地址: http://localhost:8000"
echo "  API文档:  http://localhost:8000/docs"
echo ""
echo "  查看后端日志: tail -f backend.log"
echo "  查看前端日志: tail -f frontend.log"
echo ""
echo "  停止服务: bash stop_all.sh"
echo ""
echo "======================================"
