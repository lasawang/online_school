"""
系统设置API
"""
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.system_setting import SystemSetting
from app.schemas.system_setting import (
    SystemSettingCreate,
    SystemSettingUpdate,
    SystemSettingResponse,
    SystemSettingsBatchUpdate
)
from app.api.deps import get_current_user

router = APIRouter()


def get_setting_value(db: Session, key: str, default: Any = None) -> Any:
    """获取单个设置值"""
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        return default
    try:
        # 尝试解析JSON
        return json.loads(setting.value)
    except:
        return setting.value


def set_setting_value(db: Session, key: str, value: Any, description: str = "", is_public: bool = False):
    """设置单个配置值"""
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()

    # 将值转为JSON字符串
    if isinstance(value, (dict, list)):
        value_str = json.dumps(value, ensure_ascii=False)
    elif isinstance(value, bool):
        value_str = json.dumps(value)
    else:
        value_str = str(value)

    if setting:
        setting.value = value_str
        if description:
            setting.description = description
        setting.is_public = is_public
    else:
        setting = SystemSetting(
            key=key,
            value=value_str,
            description=description,
            is_public=is_public
        )
        db.add(setting)

    db.commit()
    db.refresh(setting)
    return setting


@router.get("", response_model=Dict[str, Any], summary="获取系统设置")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取系统设置（管理员）
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )

    settings = {
        "siteName": get_setting_value(db, "site_name", "IT学习平台"),
        "siteDescription": get_setting_value(db, "site_description", "专业的IT在线学习平台"),
        "enableRegistration": get_setting_value(db, "enable_registration", True),
        "enableComments": get_setting_value(db, "enable_comments", True),
        "enableNotifications": get_setting_value(db, "enable_notifications", True),
        "maintenanceMode": get_setting_value(db, "maintenance_mode", False),
    }

    return settings


@router.put("", response_model=Dict[str, Any], summary="更新系统设置")
def update_settings(
    settings_in: SystemSettingsBatchUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    批量更新系统设置（管理员）
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )

    # 更新各个设置项
    if settings_in.siteName is not None:
        set_setting_value(db, "site_name", settings_in.siteName, "网站名称", is_public=True)

    if settings_in.siteDescription is not None:
        set_setting_value(db, "site_description", settings_in.siteDescription, "网站描述", is_public=True)

    if settings_in.enableRegistration is not None:
        set_setting_value(db, "enable_registration", settings_in.enableRegistration, "是否允许用户注册")

    if settings_in.enableComments is not None:
        set_setting_value(db, "enable_comments", settings_in.enableComments, "是否允许评论")

    if settings_in.enableNotifications is not None:
        set_setting_value(db, "enable_notifications", settings_in.enableNotifications, "是否启用通知")

    if settings_in.maintenanceMode is not None:
        set_setting_value(db, "maintenance_mode", settings_in.maintenanceMode, "维护模式")

    return {"message": "设置已保存"}


@router.get("/public", response_model=Dict[str, Any], summary="获取公开设置")
def get_public_settings(db: Session = Depends(get_db)):
    """
    获取公开的系统设置（无需认证）
    """
    public_settings = db.query(SystemSetting).filter(SystemSetting.is_public == True).all()

    result = {}
    for setting in public_settings:
        try:
            result[setting.key] = json.loads(setting.value)
        except:
            result[setting.key] = setting.value

    # 如果数据库中没有设置，返回默认值
    if not result:
        result = {
            "site_name": "IT学习平台",
            "site_description": "专业的IT在线学习平台"
        }

    return result


@router.get("/list", response_model=List[SystemSettingResponse], summary="获取所有设置列表")
def get_settings_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取所有系统设置列表（管理员）
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )

    settings = db.query(SystemSetting).all()
    return settings


@router.post("", response_model=SystemSettingResponse, summary="创建设置项")
def create_setting(
    setting_in: SystemSettingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建新的设置项（管理员）
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )

    # 检查key是否已存在
    existing = db.query(SystemSetting).filter(SystemSetting.key == setting_in.key).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="设置项已存在"
        )

    db_setting = SystemSetting(**setting_in.model_dump())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)

    return db_setting


@router.put("/{key}", response_model=SystemSettingResponse, summary="更新单个设置")
def update_setting(
    key: str,
    setting_in: SystemSettingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新单个设置项（管理员）
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )

    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="设置项不存在"
        )

    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)

    db.commit()
    db.refresh(setting)

    return setting


@router.delete("/{key}", summary="删除设置项")
def delete_setting(
    key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除设置项（管理员）
    """
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限访问"
        )

    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="设置项不存在"
        )

    db.delete(setting)
    db.commit()

    return {"message": "设置项已删除"}
