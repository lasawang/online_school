"""
章节Schema
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class ChapterBase(BaseModel):
    """章节基础Schema"""
    title: str = Field(..., min_length=1, max_length=200, description="章节标题")
    description: Optional[str] = Field(None, description="章节描述")
    sort_order: int = Field(default=0, description="排序")


class ChapterCreate(ChapterBase):
    """创建章节Schema"""
    course_id: int = Field(..., description="课程ID")


class ChapterUpdate(BaseModel):
    """更新章节Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    sort_order: Optional[int] = None


class SectionBase(BaseModel):
    """小节基础Schema"""
    title: str = Field(..., min_length=1, max_length=200, description="小节标题")
    video_url: Optional[str] = Field(None, description="视频URL")
    video_duration: int = Field(default=0, description="视频时长(秒)")
    video_size: int = Field(default=0, description="视频大小(字节)")
    video_format: Optional[str] = Field(None, description="视频格式")
    is_free: bool = Field(default=False, description="是否免费试看")
    sort_order: int = Field(default=0, description="排序")


class SectionCreate(SectionBase):
    """创建小节Schema"""
    chapter_id: int = Field(..., description="章节ID")


class SectionUpdate(BaseModel):
    """更新小节Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    video_url: Optional[str] = None
    video_duration: Optional[int] = None
    video_size: Optional[int] = None
    video_format: Optional[str] = None
    is_free: Optional[bool] = None
    sort_order: Optional[int] = None


class SectionResponse(SectionBase):
    """小节响应Schema"""
    id: int
    chapter_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ChapterResponse(ChapterBase):
    """章节响应Schema"""
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime
    sections: List[SectionResponse] = []
    
    class Config:
        from_attributes = True




