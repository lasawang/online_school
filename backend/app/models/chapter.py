"""
章节模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Chapter(Base):
    """课程章节表"""
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True, comment="课程ID")
    title = Column(String(200), nullable=False, comment="章节标题")
    description = Column(Text, nullable=True, comment="章节描述")
    sort_order = Column(Integer, default=0, index=True, comment="排序")
    created_at = Column(TIMESTAMP, server_default=func.now(), comment="创建时间")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关系
    course = relationship("Course", back_populates="chapters")
    sections = relationship("Section", back_populates="chapter", cascade="all, delete-orphan", order_by="Section.sort_order")
    
    def __repr__(self):
        return f"<Chapter(id={self.id}, title='{self.title}', course_id={self.course_id})>"




