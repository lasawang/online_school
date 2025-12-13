"""
小节模型
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, BigInteger, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Section(Base):
    """课程小节表(视频)"""
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True, comment="章节ID")
    title = Column(String(200), nullable=False, comment="小节标题")
    video_url = Column(String(500), nullable=True, comment="视频URL")
    video_duration = Column(Integer, default=0, comment="视频时长(秒)")
    video_size = Column(BigInteger, default=0, comment="视频大小(字节)")
    video_format = Column(String(20), nullable=True, comment="视频格式")
    is_free = Column(Boolean, default=False, comment="是否免费试看")
    sort_order = Column(Integer, default=0, index=True, comment="排序")
    created_at = Column(TIMESTAMP, server_default=func.now(), comment="创建时间")
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关系
    chapter = relationship("Chapter", back_populates="sections")
    learning_records = relationship("LearningRecord", back_populates="section", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Section(id={self.id}, title='{self.title}', chapter_id={self.chapter_id})>"




