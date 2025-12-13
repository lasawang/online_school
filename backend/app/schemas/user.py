"""
用户Schema
"""
from typing import Optional, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


class UserBase(BaseModel):
    """用户基础Schema"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱")
    full_name: Optional[str] = Field(None, max_length=100, description="真实姓名")
    phone: Optional[str] = Field(None, max_length=20, description="手机号")


class UserCreate(UserBase):
    """创建用户Schema"""
    password: str = Field(..., min_length=6, max_length=72, description="密码")
    role: Union[UserRole, str] = Field(default=UserRole.STUDENT, description="角色")
    
    @field_validator('role', mode='before')
    @classmethod
    def convert_role(cls, v):
        """转换role字符串为枚举（支持大小写）"""
        if isinstance(v, str):
            # 尝试转换为大写的枚举
            try:
                return UserRole[v.upper()]
            except KeyError:
                # 如果失败，尝试直接匹配值
                for role in UserRole:
                    if role.value.upper() == v.upper():
                        return role
                raise ValueError(f"Invalid role: {v}. Must be one of: student, teacher, admin")
        return v


class UserUpdate(BaseModel):
    """更新用户Schema"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserChangePassword(BaseModel):
    """修改密码Schema"""
    old_password: str = Field(..., max_length=72, description="旧密码")
    new_password: str = Field(..., min_length=6, max_length=72, description="新密码")


class UserLogin(BaseModel):
    """用户登录Schema"""
    username: str = Field(..., description="用户名或邮箱")
    password: str = Field(..., max_length=72, description="密码")


class UserResponse(UserBase):
    """用户响应Schema"""
    id: int
    role: UserRole
    avatar: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token Schema"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    user: UserResponse = Field(..., description="用户信息")


class TokenData(BaseModel):
    """Token数据Schema"""
    user_id: Optional[int] = None
    username: Optional[str] = None




