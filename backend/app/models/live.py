"""
直播模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class LiveStatus(str, enum.Enum):
    """直播状态"""
    SCHEDULED = "scheduled"  # 已安排
    LIVING = "living"  # 直播中
    ENDED = "ended"  # 已结束


class Live(Base):
    """直播表"""
    __tablename__ = "lives"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, comment="直播标题")
    description = Column(Text, comment="直播描述")
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True, comment="讲师ID")
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True, comment="关联课程ID")
    cover_image = Column(String(500), comment="封面图")
    status = Column(Enum(LiveStatus), default=LiveStatus.SCHEDULED, comment="直播状态")
    push_url = Column(String(500), comment="推流地址")
    pull_url = Column(String(500), comment="拉流地址")
    viewer_count = Column(Integer, default=0, comment="观看人数")
    scheduled_time = Column(DateTime(timezone=True), comment="计划开播时间")
    start_time = Column(DateTime(timezone=True), comment="实际开播时间")
    end_time = Column(DateTime(timezone=True), comment="结束时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    teacher = relationship("User", back_populates="lives")
    course = relationship("Course")
