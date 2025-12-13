"""
直播相关模型
"""
from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class LiveStatus(str, enum.Enum):
    """直播状态枚举"""
    NOT_STARTED = "NOT_STARTED"
    LIVING = "LIVING"
    FINISHED = "FINISHED"


class MessageType(str, enum.Enum):
    """消息类型枚举"""
    TEXT = "TEXT"
    SYSTEM = "SYSTEM"


class LiveRoom(Base):
    """直播间表"""
    __tablename__ = "live_rooms"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False, comment="直播标题")
    description = Column(Text, nullable=True, comment="直播描述")
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True, comment="讲师ID")
    cover_image = Column(String(255), nullable=True, comment="封面图片")
    push_url = Column(String(500), nullable=True, comment="推流地址")
    pull_url_rtmp = Column(String(500), nullable=True, comment="RTMP拉流地址")
    pull_url_flv = Column(String(500), nullable=True, comment="FLV拉流地址")
    pull_url_hls = Column(String(500), nullable=True, comment="HLS拉流地址")
    status = Column(Enum(LiveStatus), default=LiveStatus.NOT_STARTED, index=True, comment="状态")
    start_time = Column(TIMESTAMP, nullable=True, index=True, comment="开始时间")
    end_time = Column(TIMESTAMP, nullable=True, comment="结束时间")
    viewer_count = Column(Integer, default=0, comment="当前观看人数")
    max_viewer_count = Column(Integer, default=0, comment="最高观看人数")
    created_at = Column(TIMESTAMP, server_default=func.now(), comment="创建时间")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关系
    teacher = relationship("User", back_populates="live_rooms")
    chat_messages = relationship("LiveChatMessage", back_populates="live_room", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<LiveRoom(id={self.id}, title='{self.title}', status='{self.status}')>"


class LiveChatMessage(Base):
    """直播聊天消息表"""
    __tablename__ = "live_chat_messages"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    live_room_id = Column(Integer, ForeignKey("live_rooms.id", ondelete="CASCADE"), nullable=False, index=True, comment="直播间ID")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, comment="用户ID")
    message = Column(Text, nullable=False, comment="消息内容")
    message_type = Column(Enum(MessageType), default=MessageType.TEXT, comment="消息类型")
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True, comment="创建时间")
    
    # 关系
    live_room = relationship("LiveRoom", back_populates="chat_messages")
    user = relationship("User", back_populates="live_messages")
    
    def __repr__(self):
        return f"<LiveChatMessage(id={self.id}, live_room_id={self.live_room_id}, user_id={self.user_id})>"




