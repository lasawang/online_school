"""
课程Schema
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from decimal import Decimal
from app.models.course import CourseStatus, CourseLevel


class CourseBase(BaseModel):
    """课程基础Schema"""
    title: str = Field(..., min_length=1, max_length=200, description="课程标题")
    description: Optional[str] = Field(None, description="课程描述")
    cover_image: Optional[str] = Field(None, description="封面图片")
    category_id: int = Field(..., description="分类ID")
    price: Decimal = Field(default=0, ge=0, description="价格")
    original_price: Decimal = Field(default=0, ge=0, description="原价")
    level: CourseLevel = Field(default=CourseLevel.BEGINNER, description="难度")
    tags: Optional[str] = Field(None, description="标签")


class CourseCreate(CourseBase):
    """创建课程Schema"""
    pass


class CourseUpdate(BaseModel):
    """更新课程Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    status: Optional[CourseStatus] = None
    level: Optional[CourseLevel] = None
    tags: Optional[str] = None


class CourseResponse(CourseBase):
    """课程响应Schema"""
    id: int
    teacher_id: int
    status: CourseStatus
    student_count: int
    rating: Decimal
    rating_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime
    
    # 关联数据（可选）
    teacher_name: Optional[str] = None
    category_name: Optional[str] = None
    chapter_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class CourseDetail(CourseResponse):
    """课程详情Schema"""
    chapters: List["ChapterResponse"] = []


# 避免循环导入
from app.schemas.chapter import ChapterResponse
CourseDetail.model_rebuild()




