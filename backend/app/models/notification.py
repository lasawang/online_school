"""
通知模型
"""
from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class NotificationType(str, enum.Enum):
    """通知类型枚举"""
    SYSTEM = "SYSTEM"
    COURSE = "COURSE"
    LIVE = "LIVE"
    COMMENT = "COMMENT"


class Notification(Base):
    """通知表"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID")
    type = Column(Enum(NotificationType), nullable=False, comment="通知类型")
    title = Column(String(200), nullable=False, comment="通知标题")
    content = Column(Text, nullable=True, comment="通知内容")
    link_url = Column(String(500), nullable=True, comment="跳转链接")
    is_read = Column(Boolean, default=False, index=True, comment="是否已读")
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="发送者ID")
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, comment="关联课程ID")
    live_id = Column(Integer, ForeignKey("lives.id", ondelete="SET NULL"), nullable=True, comment="关联直播ID")
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True, comment="创建时间")
    read_at = Column(TIMESTAMP, nullable=True, comment="阅读时间")

    # 关系
    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])
    sender = relationship("User", foreign_keys=[sender_id])
    course = relationship("Course")
    live = relationship("Live")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, title='{self.title}', is_read={self.is_read})>"
