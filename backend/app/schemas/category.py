"""
分类Schema
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """分类基础Schema"""
    name: str = Field(..., min_length=1, max_length=100, description="分类名称")
    description: Optional[str] = Field(None, description="分类描述")
    sort_order: int = Field(default=0, description="排序")


class CategoryCreate(CategoryBase):
    """创建分类Schema"""
    parent_id: Optional[int] = Field(None, description="父分类ID")


class CategoryUpdate(BaseModel):
    """更新分类Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """分类响应Schema"""
    id: int
    parent_id: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    children: List["CategoryResponse"] = []
    
    class Config:
        from_attributes = True


# 更新模型
CategoryResponse.model_rebuild()




