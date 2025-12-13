"""
轮播图模型
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base


class Banner(Base):
    """轮播图表"""
    __tablename__ = "banners"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False, comment="标题")
    image_url = Column(String(255), nullable=False, comment="图片URL")
    link_url = Column(String(500), nullable=True, comment="链接URL")
    sort_order = Column(Integer, default=0, index=True, comment="排序")
    is_active = Column(Boolean, default=True, index=True, comment="是否激活")
    created_at = Column(TIMESTAMP, server_default=func.now(), comment="创建时间")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    def __repr__(self):
        return f"<Banner(id={self.id}, title='{self.title}')>"




