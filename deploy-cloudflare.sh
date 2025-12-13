#!/bin/bash
# Cloudflare Pages 部署脚本

echo "======================================"
echo "  Cloudflare Pages 部署"
echo "======================================"

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "正在安装 Wrangler..."
    npm install -g wrangler
fi

echo "✅ Wrangler 版本: $(wrangler --version)"
echo ""

# 进入前端目录
cd "$(dirname "$0")/frontend"

echo "📦 安装依赖..."
npm install

echo ""
echo "🔨 构建前端..."
npm run build

echo ""
echo "📤 部署到 Cloudflare Pages..."
wrangler pages deploy dist --project-name=it-learning-platform

echo ""
echo "======================================"
echo "  部署完成！"
echo "======================================"
echo ""
echo "查看部署状态："
echo "  https://dash.cloudflare.com"
echo ""
