"""
配置文件
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "IT学习课程平台"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str
    
    # 数据库配置
    DATABASE_URL: str
    DATABASE_ECHO: bool = False
    
    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # JWT配置
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7天（一周）
    
    # 文件上传配置
    UPLOAD_DIR: str = "./static/uploads"
    MAX_UPLOAD_SIZE: int = 1073741824  # 1GB
    ALLOWED_IMAGE_TYPES: str = "jpg,jpeg,png,gif,webp"
    ALLOWED_VIDEO_TYPES: str = "mp4,avi,mov,flv"
    
    # CORS配置
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # SRS直播服务器配置
    SRS_HTTP_API: str = "http://localhost:1985/api/v1"
    SRS_RTMP_SERVER: str = "rtmp://localhost/live"
    SRS_HTTP_SERVER: str = "http://localhost:8080"
    
    # 分页配置
    DEFAULT_PAGE_SIZE: int = 10
    MAX_PAGE_SIZE: int = 100
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        """解析CORS origins"""
        if isinstance(v, str):
            return v
        elif isinstance(v, list):
            return ",".join(v)
        return v
    
    def get_cors_origins(self) -> List[str]:
        """获取CORS origins列表"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局配置实例
settings = Settings()




