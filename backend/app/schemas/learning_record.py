"""
学习记录Schema
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class LearningRecordBase(BaseModel):
    """学习记录基础Schema"""
    progress: int = Field(default=0, ge=0, le=100, description="学习进度百分比")
    last_position: int = Field(default=0, ge=0, description="最后观看位置(秒)")
    is_completed: bool = Field(default=False, description="是否完成")


class LearningRecordCreate(BaseModel):
    """创建学习记录Schema"""
    course_id: int = Field(..., description="课程ID")
    section_id: int = Field(..., description="小节ID")
    progress: int = Field(default=0, ge=0, le=100, description="学习进度百分比")
    last_position: int = Field(default=0, ge=0, description="最后观看位置(秒)")


class LearningRecordUpdate(BaseModel):
    """更新学习记录Schema"""
    progress: Optional[int] = Field(None, ge=0, le=100)
    last_position: Optional[int] = Field(None, ge=0)
    is_completed: Optional[bool] = None
    learning_time: Optional[int] = Field(None, ge=0, description="累计学习时长(秒)")


class LearningRecordResponse(LearningRecordBase):
    """学习记录响应Schema"""
    id: int
    user_id: int
    course_id: int
    section_id: int
    learning_time: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True




