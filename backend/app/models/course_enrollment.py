"""
课程报名模型
"""
from sqlalchemy import Column, Integer, Boolean, TIMESTAMP, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class CourseEnrollment(Base):
    """课程报名表"""
    __tablename__ = "course_enrollments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID")
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True, comment="课程ID")
    enrollment_date = Column(TIMESTAMP, server_default=func.now(), comment="报名时间")
    expiry_date = Column(TIMESTAMP, nullable=True, comment="过期时间")
    is_active = Column(Boolean, default=True, comment="是否有效")
    
    # 关系
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course'),
    )
    
    def __repr__(self):
        return f"<CourseEnrollment(user_id={self.user_id}, course_id={self.course_id})>"




