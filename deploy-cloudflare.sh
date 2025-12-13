#!/bin/bash
# Cloudflare Pages 部署脚本

echo "======================================"
echo "  Cloudflare Pages 部署"
echo "======================================"

# 进入前端目录
cd "$(dirname "$0")/frontend"

echo "📦 安装依赖..."
npm install

echo ""
echo "🔨 构建前端..."
npm run build

echo ""
echo "📤 部署到 Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=it-learning-platform

echo ""
echo "======================================"
echo "  部署完成！"
echo "======================================"
