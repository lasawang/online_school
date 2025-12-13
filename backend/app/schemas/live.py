"""
直播Schema
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.live_room import LiveStatus, MessageType


class LiveRoomBase(BaseModel):
    """直播间基础Schema"""
    title: str = Field(..., min_length=1, max_length=200, description="直播标题")
    description: Optional[str] = Field(None, description="直播描述")
    cover_image: Optional[str] = Field(None, description="封面图片")
    start_time: Optional[datetime] = Field(None, description="开始时间")


class LiveRoomCreate(LiveRoomBase):
    """创建直播间Schema"""
    pass


class LiveRoomUpdate(BaseModel):
    """更新直播间Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    cover_image: Optional[str] = None
    status: Optional[LiveStatus] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class LiveRoomResponse(LiveRoomBase):
    """直播间响应Schema"""
    id: int
    teacher_id: int
    push_url: Optional[str]
    pull_url_rtmp: Optional[str]
    pull_url_flv: Optional[str]
    pull_url_hls: Optional[str]
    status: LiveStatus
    end_time: Optional[datetime]
    viewer_count: int
    max_viewer_count: int
    created_at: datetime
    updated_at: datetime
    
    # 关联数据
    teacher_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class LiveChatMessageCreate(BaseModel):
    """创建聊天消息Schema"""
    live_room_id: int = Field(..., description="直播间ID")
    message: str = Field(..., min_length=1, description="消息内容")


class LiveChatMessageResponse(BaseModel):
    """聊天消息响应Schema"""
    id: int
    live_room_id: int
    user_id: int
    message: str
    message_type: MessageType
    created_at: datetime
    
    # 关联数据
    username: Optional[str] = None
    user_avatar: Optional[str] = None
    
    class Config:
        from_attributes = True




