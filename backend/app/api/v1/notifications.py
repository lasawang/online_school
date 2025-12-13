"""
通知相关API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdate
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=dict, summary="获取用户通知列表")
def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户的通知列表（分页）
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    # 筛选已读/未读
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)

    # 按创建时间倒序
    query = query.order_by(desc(Notification.created_at))

    # 分页
    total = query.count()
    notifications = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": notifications,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }


@router.get("/unread-count", response_model=dict, summary="获取未读通知数量")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户的未读通知数量
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {"count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse, summary="标记通知为已读")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    标记单个通知为已读
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now()
        db.commit()
        db.refresh(notification)

    return notification


@router.put("/mark-all-read", response_model=dict, summary="标记全部通知为已读")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    标记当前用户的所有通知为已读
    """
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.now()
    }, synchronize_session=False)

    db.commit()

    return {
        "message": "所有通知已标记为已读",
        "updated_count": updated_count
    }


@router.delete("/{notification_id}", response_model=dict, summary="删除通知")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除单个通知
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")

    db.delete(notification)
    db.commit()

    return {"message": "通知已删除"}


@router.post("", response_model=NotificationResponse, summary="创建通知（管理员）")
def create_notification(
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建通知（仅供系统内部使用或管理员）
    """
    # 可以添加权限检查
    if current_user.role not in ["ADMIN", "TEACHER"]:
        raise HTTPException(status_code=403, detail="权限不足")

    notification = Notification(**notification_in.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification
