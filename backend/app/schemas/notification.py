"""
通知相关Schema
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    """通知基础Schema"""
    type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    link_url: Optional[str] = Field(None, max_length=500)


class NotificationCreate(NotificationBase):
    """创建通知Schema"""
    user_id: int


class NotificationUpdate(BaseModel):
    """更新通知Schema"""
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    """通知响应Schema"""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True
