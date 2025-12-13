#!/bin/bash
# IT学习课程平台 - 前端启动脚本

echo "======================================"
echo "  IT学习课程平台 - 前端服务"
echo "======================================"

# 进入前端目录
cd "$(dirname "$0")/frontend"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
else
    echo "检查依赖更新..."
    npm install
fi

# 启动前端服务
echo ""
echo "======================================"
echo "  启动前端服务 (http://localhost:3000)"
echo "======================================"
echo ""

npm run dev
