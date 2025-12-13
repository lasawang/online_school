"""
评论Schema
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class CommentBase(BaseModel):
    """评论基础Schema"""
    content: str = Field(..., min_length=1, description="评论内容")
    rating: Optional[int] = Field(None, ge=1, le=5, description="评分(1-5)")


class CommentCreate(CommentBase):
    """创建评论Schema"""
    course_id: int = Field(..., description="课程ID")
    parent_id: Optional[int] = Field(None, description="父评论ID")


class CommentUpdate(BaseModel):
    """更新评论Schema"""
    content: Optional[str] = Field(None, min_length=1)


class CommentResponse(CommentBase):
    """评论响应Schema"""
    id: int
    user_id: int
    course_id: int
    parent_id: Optional[int]
    like_count: int
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    
    # 关联数据
    username: Optional[str] = None
    user_avatar: Optional[str] = None
    replies: List["CommentResponse"] = []
    
    class Config:
        from_attributes = True


# 更新模型
CommentResponse.model_rebuild()




