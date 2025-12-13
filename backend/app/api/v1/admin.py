"""
管理员专用API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import require_admin
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment
from app.models.notification import Notification, NotificationType

router = APIRouter()


class AddStudentRequest(BaseModel):
    """添加学员请求"""
    user_id: int
    course_id: int


class SendNotificationRequest(BaseModel):
    """发送通知请求"""
    user_ids: List[int]  # 接收用户ID列表
    title: str
    content: str
    type: str = "system"  # system, course, live
    course_id: int = None
    live_id: int = None


@router.post("/add-student")
def add_student_to_course(
    request: AddStudentRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员添加学员到课程（免费分配）"""
    # 检查用户是否存在
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    # 检查是否已经报名
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == request.user_id,
        CourseEnrollment.course_id == request.course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="该用户已经报名此课程")

    # 创建报名记录
    enrollment = CourseEnrollment(
        user_id=request.user_id,
        course_id=request.course_id
    )
    db.add(enrollment)

    # 增加课程学生数
    course.student_count += 1

    # 发送通知给用户
    notification = Notification(
        user_id=request.user_id,
        type=NotificationType.COURSE,
        title="课程分配通知",
        content=f"管理员为您分配了课程：{course.title}",
        sender_id=current_admin.id,
        course_id=course.id,
        link_url=f"/courses/{course.id}"
    )
    db.add(notification)

    db.commit()

    return {
        "message": f"成功添加用户 {user.username} 到课程 {course.title}",
        "enrollment_id": enrollment.id
    }


@router.post("/send-notification")
def send_notification_to_users(
    request: SendNotificationRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员/老师发送通知给用户"""
    # 验证接收用户
    users = db.query(User).filter(User.id.in_(request.user_ids)).all()
    if len(users) != len(request.user_ids):
        raise HTTPException(status_code=400, detail="部分用户不存在")

    # 验证NotificationType
    try:
        notif_type = NotificationType[request.type.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"无效的通知类型: {request.type}")

    # 创建通知记录
    notifications = []
    for user_id in request.user_ids:
        notification = Notification(
            user_id=user_id,
            type=notif_type,
            title=request.title,
            content=request.content,
            sender_id=current_admin.id,
            course_id=request.course_id,
            live_id=request.live_id
        )
        notifications.append(notification)
        db.add(notification)

    db.commit()

    return {
        "message": f"成功发送通知给 {len(request.user_ids)} 位用户",
        "notification_count": len(notifications)
    }


@router.post("/broadcast-notification")
def broadcast_notification(
    request: SendNotificationRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """广播通知给所有用户"""
    # 获取所有活跃用户
    users = db.query(User).filter(User.is_active == True).all()

    # 验证NotificationType
    try:
        notif_type = NotificationType[request.type.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"无效的通知类型: {request.type}")

    # 创建通知记录
    notifications = []
    for user in users:
        notification = Notification(
            user_id=user.id,
            type=notif_type,
            title=request.title,
            content=request.content,
            sender_id=current_admin.id,
            course_id=request.course_id,
            live_id=request.live_id
        )
        notifications.append(notification)
        db.add(notification)

    db.commit()

    return {
        "message": f"成功广播通知给 {len(users)} 位用户",
        "notification_count": len(notifications)
    }


@router.get("/enrollments/{course_id}")
def get_course_enrollments(
    course_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取课程的所有报名学员"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id
    ).all()

    result = []
    for enrollment in enrollments:
        user = db.query(User).filter(User.id == enrollment.user_id).first()
        result.append({
            "enrollment_id": enrollment.id,
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "enrolled_at": enrollment.enrolled_at
        })

    return {
        "course_id": course_id,
        "course_title": course.title,
        "total_students": len(result),
        "students": result
    }


@router.delete("/remove-student/{enrollment_id}")
def remove_student_from_course(
    enrollment_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """移除学员"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="报名记录不存在")

    # 减少课程学生数
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if course and course.student_count > 0:
        course.student_count -= 1

    db.delete(enrollment)
    db.commit()

    return {"message": "成功移除学员"}


@router.get("/stats")
def get_admin_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取管理员统计数据"""
    # 统计用户数
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_teachers = db.query(User).filter(User.role == UserRole.TEACHER).count()
    
    # 统计课程数
    total_courses = db.query(Course).count()
    published_courses = db.query(Course).filter(Course.status == "PUBLISHED").count()
    
    # 统计报名数
    total_enrollments = db.query(CourseEnrollment).count()
    
    # 统计通知数
    total_notifications = db.query(Notification).count()
    unread_notifications = db.query(Notification).filter(Notification.is_read == False).count()
    
    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_courses": total_courses,
        "published_courses": published_courses,
        "total_enrollments": total_enrollments,
        "total_notifications": total_notifications,
        "unread_notifications": unread_notifications
    }
