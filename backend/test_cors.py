"""
测试 CORS 配置是否正确加载
"""
from app.core.config import settings

print("=" * 60)
print("CORS 配置测试")
print("=" * 60)
print(f"BACKEND_CORS_ORIGINS (原始): {settings.BACKEND_CORS_ORIGINS}")
print(f"CORS Origins (解析后): {settings.get_cors_origins()}")
print("=" * 60)
