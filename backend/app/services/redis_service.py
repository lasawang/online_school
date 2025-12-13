"""
Redis服务
"""
import json
from typing import Optional, Any
import redis
from app.core.config import settings


class RedisService:
    """Redis服务类"""
    
    def __init__(self):
        """初始化Redis连接"""
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存
        
        Args:
            key: 键
        
        Returns:
            Any: 值
        """
        value = self.redis_client.get(key)
        if value:
            try:
                return json.loads(value)
            except:
                return value
        return None
    
    def set(self, key: str, value: Any, expire: int = None) -> bool:
        """
        设置缓存
        
        Args:
            key: 键
            value: 值
            expire: 过期时间（秒）
        
        Returns:
            bool: 是否成功
        """
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            if expire:
                return self.redis_client.setex(key, expire, value)
            else:
                return self.redis_client.set(key, value)
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        删除缓存
        
        Args:
            key: 键
        
        Returns:
            bool: 是否成功
        """
        try:
            return self.redis_client.delete(key) > 0
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """
        检查键是否存在
        
        Args:
            key: 键
        
        Returns:
            bool: 是否存在
        """
        return self.redis_client.exists(key) > 0
    
    def incr(self, key: str, amount: int = 1) -> int:
        """
        递增
        
        Args:
            key: 键
            amount: 递增量
        
        Returns:
            int: 递增后的值
        """
        return self.redis_client.incrby(key, amount)
    
    def decr(self, key: str, amount: int = 1) -> int:
        """
        递减
        
        Args:
            key: 键
            amount: 递减量
        
        Returns:
            int: 递减后的值
        """
        return self.redis_client.decrby(key, amount)


# 创建全局Redis服务实例
redis_service = RedisService()




