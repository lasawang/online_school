"""
Banner Schema
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class BannerBase(BaseModel):
    """轮播图基础Schema"""
    title: str = Field(..., max_length=200, description="标题")
    image_url: str = Field(..., max_length=255, description="图片URL")
    link_url: Optional[str] = Field(None, max_length=255, description="链接URL")
    sort_order: int = Field(default=0, description="排序")
    is_active: bool = Field(default=True, description="是否激活")


class BannerCreate(BannerBase):
    """创建轮播图Schema"""
    pass


class BannerUpdate(BaseModel):
    """更新轮播图Schema"""
    title: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = Field(None, max_length=255)
    link_url: Optional[str] = Field(None, max_length=255)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class BannerResponse(BannerBase):
    """轮播图响应Schema"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
