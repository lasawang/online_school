"""
钱包相关的Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.wallet import TransactionType


class WalletBase(BaseModel):
    """钱包基础Schema"""
    balance: float = Field(..., description="余额")


class WalletResponse(WalletBase):
    """钱包响应Schema"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RechargeRequest(BaseModel):
    """充值请求Schema"""
    amount: float = Field(..., gt=0, description="充值金额")


class PurchaseCourseRequest(BaseModel):
    """购买课程请求Schema"""
    course_id: int = Field(..., description="课程ID")


class TransactionResponse(BaseModel):
    """交易记录响应Schema"""
    id: int
    wallet_id: int
    user_id: int
    type: TransactionType
    amount: float
    balance_before: float
    balance_after: float
    description: Optional[str]
    course_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
