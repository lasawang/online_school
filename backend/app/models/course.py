"""
课程模型
"""
from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP, Text, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class CourseStatus(str, enum.Enum):
    """课程状态枚举"""
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    OFFLINE = "OFFLINE"


class CourseLevel(str, enum.Enum):
    """课程难度枚举"""
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"


class Course(Base):
    """课程表"""
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False, comment="课程标题")
    description = Column(Text, nullable=True, comment="课程描述")
    cover_image = Column(String(255), nullable=True, comment="封面图片")
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True, comment="分类ID")
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True, comment="讲师ID")
    price = Column(DECIMAL(10, 2), default=0.00, comment="价格")
    original_price = Column(DECIMAL(10, 2), default=0.00, comment="原价")
    status = Column(Enum(CourseStatus), default=CourseStatus.DRAFT, index=True, comment="状态")
    level = Column(Enum(CourseLevel), default=CourseLevel.BEGINNER, comment="难度")
    tags = Column(String(255), nullable=True, comment="标签")
    student_count = Column(Integer, default=0, comment="学习人数")
    rating = Column(DECIMAL(3, 2), default=0.00, comment="评分")
    rating_count = Column(Integer, default=0, comment="评分人数")
    view_count = Column(Integer, default=0, comment="浏览次数")
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True, comment="创建时间")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关系
    category = relationship("Category", back_populates="courses")
    teacher = relationship("User", back_populates="courses", foreign_keys=[teacher_id])
    chapters = relationship("Chapter", back_populates="course", cascade="all, delete-orphan", order_by="Chapter.sort_order")
    learning_records = relationship("LearningRecord", back_populates="course", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="course", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Course(id={self.id}, title='{self.title}', status='{self.status}')>"




