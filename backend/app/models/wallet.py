"""
用户钱包模型
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class TransactionType(str, enum.Enum):
    """交易类型"""
    RECHARGE = "recharge"  # 充值
    PURCHASE = "purchase"  # 购买课程
    REFUND = "refund"  # 退款
    ADMIN_ADD = "admin_add"  # 管理员添加


class Wallet(Base):
    """用户钱包表"""
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True, comment="用户ID")
    balance = Column(Float, default=0.0, comment="余额")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")


class Transaction(Base):
    """交易记录表"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False, index=True, comment="钱包ID")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True, comment="用户ID")
    type = Column(Enum(TransactionType), nullable=False, comment="交易类型")
    amount = Column(Float, nullable=False, comment="交易金额")
    balance_before = Column(Float, nullable=False, comment="交易前余额")
    balance_after = Column(Float, nullable=False, comment="交易后余额")
    description = Column(Text, comment="交易描述")
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True, comment="关联课程ID")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    wallet = relationship("Wallet", back_populates="transactions")
    user = relationship("User")
    course = relationship("Course")
