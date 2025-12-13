"""
系统设置相关Schema
"""
from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class SystemSettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None
    is_public: bool = False


class SystemSettingCreate(SystemSettingBase):
    pass


class SystemSettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class SystemSettingResponse(SystemSettingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemSettingsBatchUpdate(BaseModel):
    """批量更新系统设置"""
    siteName: Optional[str] = None
    siteDescription: Optional[str] = None
    enableRegistration: Optional[bool] = None
    enableComments: Optional[bool] = None
    enableNotifications: Optional[bool] = None
    maintenanceMode: Optional[bool] = None
