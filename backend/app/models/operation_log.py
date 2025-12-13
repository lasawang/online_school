"""
操作日志模型
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class OperationLog(Base):
    """操作日志表"""
    __tablename__ = "operation_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="用户ID")
    action = Column(String(100), nullable=False, index=True, comment="操作类型")
    module = Column(String(50), nullable=False, comment="模块名称")
    description = Column(Text, nullable=True, comment="操作描述")
    ip_address = Column(String(50), nullable=True, comment="IP地址")
    user_agent = Column(Text, nullable=True, comment="User Agent")
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True, comment="创建时间")
    
    def __repr__(self):
        return f"<OperationLog(id={self.id}, action='{self.action}', module='{self.module}')>"




