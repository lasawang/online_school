"""
通用Schema
"""
from typing import TypeVar, Generic, Optional, List
from pydantic import BaseModel, Field


# 泛型类型
T = TypeVar('T')


class Response(BaseModel, Generic[T]):
    """通用响应模型"""
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="消息")
    data: Optional[T] = Field(default=None, description="数据")


class PageParams(BaseModel):
    """分页参数"""
    page: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=10, ge=1, le=100, description="每页数量")


class PageResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    total: int = Field(description="总数")
    page: int = Field(description="当前页")
    page_size: int = Field(description="每页数量")
    items: List[T] = Field(description="数据列表")


class MessageResponse(BaseModel):
    """消息响应模型"""
    message: str = Field(description="消息内容")




