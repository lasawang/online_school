"""
安全相关功能：密码哈希、JWT令牌等
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码
    
    Args:
        plain_password: 明文密码
        hashed_password: 哈希密码
    
    Returns:
        bool: 密码是否匹配
    """
    # bcrypt限制密码长度不超过72字节
    # 确保不会在UTF-8多字节字符中间切断
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        # 从72字节往前找到合法的UTF-8字符边界
        truncate_at = 72
        while truncate_at > 0 and (password_bytes[truncate_at] & 0xC0) == 0x80:
            truncate_at -= 1
        password_bytes = password_bytes[:truncate_at]
    truncated_password = password_bytes.decode('utf-8')
    return pwd_context.verify(truncated_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    生成密码哈希
    
    Args:
        password: 明文密码
    
    Returns:
        str: 哈希密码
    """
    # bcrypt限制密码长度不超过72字节
    # 确保不会在UTF-8多字节字符中间切断
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # 从72字节往前找到合法的UTF-8字符边界
        truncate_at = 72
        while truncate_at > 0 and (password_bytes[truncate_at] & 0xC0) == 0x80:
            truncate_at -= 1
        password_bytes = password_bytes[:truncate_at]
    truncated_password = password_bytes.decode('utf-8')
    return pwd_context.hash(truncated_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    创建JWT访问令牌
    
    Args:
        data: 要编码的数据
        expires_delta: 过期时间增量
    
    Returns:
        str: JWT令牌
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    解码JWT令牌
    
    Args:
        token: JWT令牌
    
    Returns:
        Optional[Dict[str, Any]]: 解码后的数据，失败返回None
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

