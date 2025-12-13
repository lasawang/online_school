#!/bin/bash
# IT学习课程平台 - 后端启动脚本

echo "======================================"
echo "  IT学习课程平台 - 后端服务"
echo "======================================"

# 进入后端目录
cd "$(dirname "$0")/backend"

# 检查Python虚拟环境
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "检查并安装依赖..."
pip install -r requirements.txt

# 创建uploads目录
echo "创建上传目录..."
mkdir -p static/uploads/images
mkdir -p static/uploads/videos
mkdir -p static/uploads/avatars

# 启动后端服务
echo ""
echo "======================================"
echo "  启动后端服务 (http://localhost:8000)"
echo "  API文档: http://localhost:8000/docs"
echo "======================================"
echo ""

# 使用uvicorn启动
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
