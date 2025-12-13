// Cloudflare Worker 入口文件
// 用于 Workers for Platform 部署

export default {
  async fetch(request, env) {
    // 获取静态资产
    const url = new URL(request.url);
    
    // 尝试获取静态文件
    try {
      // 使用 ASSETS 绑定获取静态文件
      return env.ASSETS.fetch(request);
    } catch (e) {
      // 如果没有 ASSETS 绑定，返回简单响应
      return new Response('IT Learning Platform', {
        headers: { 'content-type': 'text/html' }
      });
    }
  }
};
