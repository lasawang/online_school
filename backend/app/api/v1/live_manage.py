"""
直播管理API（老师/管理员）
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.live import Live, LiveStatus
from app.models.notification import Notification, NotificationType
from app.models.course_enrollment import CourseEnrollment

router = APIRouter()


class LiveCreate(BaseModel):
    """创建直播"""
    title: str
    description: str = None
    course_id: int = None
    cover_image: str = None
    scheduled_time: datetime = None


class LiveUpdate(BaseModel):
    """更新直播信息"""
    title: str = None
    description: str = None
    cover_image: str = None
    scheduled_time: datetime = None


@router.post("/create")
def create_live(
    request: LiveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建直播间"""
    # 检查权限：必须是老师或管理员
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="只有老师和管理员可以创建直播")

    # 生成推流和拉流地址（这里使用模拟地址，实际应该对接直播服务商）
    live_id = datetime.now().timestamp()
    push_url = f"rtmp://push.example.com/live/{live_id}"
    pull_url = f"rtmp://pull.example.com/live/{live_id}"

    # 创建直播记录
    live = Live(
        title=request.title,
        description=request.description,
        teacher_id=current_user.id,
        course_id=request.course_id,
        cover_image=request.cover_image,
        status=LiveStatus.SCHEDULED,
        push_url=push_url,
        pull_url=pull_url,
        scheduled_time=request.scheduled_time
    )

    db.add(live)
    db.commit()
    db.refresh(live)

    # 如果关联了课程，通知所有报名学员
    if request.course_id:
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == request.course_id
        ).all()

        for enrollment in enrollments:
            notification = Notification(
                user_id=enrollment.user_id,
                type=NotificationType.LIVE,
                title="直播通知",
                content=f"您报名的课程即将开始直播：{request.title}",
                sender_id=current_user.id,
                course_id=request.course_id,
                live_id=live.id,
                link_url=f"/live/{live.id}"
            )
            db.add(notification)

        db.commit()

    return {
        "message": "直播创建成功",
        "live_id": live.id,
        "push_url": push_url,
        "pull_url": pull_url,
        "live": {
            "id": live.id,
            "title": live.title,
            "status": live.status,
            "scheduled_time": live.scheduled_time
        }
    }


@router.put("/{live_id}")
def update_live(
    live_id: int,
    request: LiveUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新直播信息"""
    live = db.query(Live).filter(Live.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="直播不存在")

    # 检查权限
    if live.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="无权修改此直播")

    # 更新字段
    if request.title is not None:
        live.title = request.title
    if request.description is not None:
        live.description = request.description
    if request.cover_image is not None:
        live.cover_image = request.cover_image
    if request.scheduled_time is not None:
        live.scheduled_time = request.scheduled_time

    db.commit()
    db.refresh(live)

    return {"message": "直播信息更新成功", "live_id": live.id}


@router.post("/{live_id}/start")
def start_live(
    live_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """开始直播"""
    live = db.query(Live).filter(Live.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="直播不存在")

    # 检查权限
    if live.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="无权操作此直播")

    if live.status == LiveStatus.LIVING:
        raise HTTPException(status_code=400, detail="直播已经在进行中")

    # 更新状态
    live.status = LiveStatus.LIVING
    live.start_time = datetime.now()

    db.commit()
    db.refresh(live)

    return {
        "message": "直播已开始",
        "live_id": live.id,
        "start_time": live.start_time,
        "pull_url": live.pull_url
    }


@router.post("/{live_id}/end")
def end_live(
    live_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """结束直播"""
    live = db.query(Live).filter(Live.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="直播不存在")

    # 检查权限
    if live.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="无权操作此直播")

    if live.status == LiveStatus.ENDED:
        raise HTTPException(status_code=400, detail="直播已经结束")

    # 更新状态
    live.status = LiveStatus.ENDED
    live.end_time = datetime.now()

    db.commit()
    db.refresh(live)

    return {
        "message": "直播已结束",
        "live_id": live.id,
        "end_time": live.end_time,
        "duration": (live.end_time - live.start_time).total_seconds() if live.start_time else 0
    }


@router.get("/my-lives")
def get_my_lives(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取我的直播列表"""
    # 检查权限
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="只有老师和管理员可以查看直播管理")

    lives = db.query(Live).filter(Live.teacher_id == current_user.id).order_by(Live.created_at.desc()).all()

    result = []
    for live in lives:
        result.append({
            "id": live.id,
            "title": live.title,
            "description": live.description,
            "status": live.status,
            "viewer_count": live.viewer_count,
            "scheduled_time": live.scheduled_time,
            "start_time": live.start_time,
            "end_time": live.end_time,
            "created_at": live.created_at
        })

    return {"total": len(result), "lives": result}


@router.get("/{live_id}/detail")
def get_live_detail(
    live_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取直播详情"""
    live = db.query(Live).filter(Live.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="直播不存在")

    # 检查权限：只有创建者或管理员可以看到推流地址
    show_push_url = (live.teacher_id == current_user.id or current_user.role == UserRole.ADMIN)

    teacher = db.query(User).filter(User.id == live.teacher_id).first()

    return {
        "id": live.id,
        "title": live.title,
        "description": live.description,
        "teacher_name": teacher.username if teacher else None,
        "status": live.status,
        "cover_image": live.cover_image,
        "push_url": live.push_url if show_push_url else None,
        "pull_url": live.pull_url,
        "viewer_count": live.viewer_count,
        "scheduled_time": live.scheduled_time,
        "start_time": live.start_time,
        "end_time": live.end_time,
        "created_at": live.created_at
    }


@router.delete("/{live_id}")
def delete_live(
    live_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除直播"""
    live = db.query(Live).filter(Live.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="直播不存在")

    # 检查权限
    if live.teacher_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="无权删除此直播")

    # 不允许删除正在直播的内容
    if live.status == LiveStatus.LIVING:
        raise HTTPException(status_code=400, detail="无法删除正在进行的直播")

    db.delete(live)
    db.commit()

    return {"message": "直播删除成功"}
