"""
收藏模型
"""
from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Collection(Base):
    """收藏表"""
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID")
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True, comment="课程ID")
    created_at = Column(TIMESTAMP, server_default=func.now(), comment="创建时间")
    
    # 关系
    user = relationship("User", back_populates="collections")
    course = relationship("Course", back_populates="collections")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course'),
    )
    
    def __repr__(self):
        return f"<Collection(user_id={self.user_id}, course_id={self.course_id})>"




