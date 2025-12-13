"""
学习记录模型
"""
from sqlalchemy import Column, Integer, Boolean, TIMESTAMP, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class LearningRecord(Base):
    """学习记录表"""
    __tablename__ = "learning_records"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID")
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True, comment="课程ID")
    section_id = Column(Integer, ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, comment="小节ID")
    progress = Column(Integer, default=0, comment="学习进度百分比(0-100)")
    last_position = Column(Integer, default=0, comment="最后观看位置(秒)")
    is_completed = Column(Boolean, default=False, comment="是否完成")
    learning_time = Column(Integer, default=0, comment="累计学习时长(秒)")
    created_at = Column(TIMESTAMP, server_default=func.now(), comment="创建时间")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关系
    user = relationship("User", back_populates="learning_records")
    course = relationship("Course", back_populates="learning_records")
    section = relationship("Section", back_populates="learning_records")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'section_id', name='unique_user_section'),
    )
    
    def __repr__(self):
        return f"<LearningRecord(user_id={self.user_id}, section_id={self.section_id}, progress={self.progress}%)>"




