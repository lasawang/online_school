"""
FastAPI应用入口 - Updated
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import auth, courses, chapters, categories, lives, upload, comments, learning, banners, notifications
from app.api.v1 import settings as settings_api
from app.api.v1 import wallet, admin, live_manage
from app.websocket import sio
import socketio

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="IT学习课程平台后端API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    allow_origin_regex=r"http://192\.168\.0\.102:\d+"
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["课程"])
app.include_router(chapters.router, prefix="/api/v1/chapters", tags=["章节"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["分类"])
app.include_router(lives.router, prefix="/api/v1/lives", tags=["直播"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["文件上传"])
app.include_router(comments.router, prefix="/api/v1/comments", tags=["评论"])
app.include_router(learning.router, prefix="/api/v1/learning", tags=["学习记录"])
app.include_router(banners.router, prefix="/api/v1/banners", tags=["轮播图"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["通知"])
app.include_router(settings_api.router, prefix="/api/v1/settings", tags=["系统设置"])
app.include_router(wallet.router, prefix="/api/v1/wallet", tags=["钱包"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["管理员"])
app.include_router(live_manage.router, prefix="/api/v1/live-manage", tags=["直播管理"])


@app.get("/")
def root():
    """根路径"""
    return {
        "message": "欢迎使用IT学习课程平台API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    """健康检查"""
    return {"status": "ok"}


# 包装FastAPI应用为Socket.IO ASGI应用
# 注意：这会替换原来的app变量，使得uvicorn app.main:app能够正确启动
app = socketio.ASGIApp(sio, other_asgi_app=app)


if __name__ == "__main__":
    import uvicorn
    # 运行包装后的应用
    uvicorn.run(app, host="0.0.0.0", port=8000)
