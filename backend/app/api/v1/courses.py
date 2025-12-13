"""
课程管理API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.user import User
from app.models.course import Course, CourseStatus
from app.models.category import Category
from app.models.course_enrollment import CourseEnrollment
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseDetail
from app.schemas.common import PageParams, PageResponse
from app.api.deps import get_current_user, require_teacher

router = APIRouter()


@router.post("", response_model=CourseResponse, summary="创建课程")
def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    创建课程（讲师/管理员）
    """
    # 检查分类是否存在
    category = db.query(Category).filter(Category.id == course_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分类不存在"
        )
    
    # 创建课程
    db_course = Course(
        **course_in.model_dump(),
        teacher_id=current_user.id
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return db_course


@router.get("", response_model=PageResponse[CourseResponse], summary="获取课程列表")
def get_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = None,
    status: Optional[CourseStatus] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取课程列表
    """
    query = db.query(Course)
    
    # 筛选条件
    if category_id:
        query = query.filter(Course.category_id == category_id)
    
    if status:
        query = query.filter(Course.status == status)
    else:
        # 默认只显示已发布的课程
        query = query.filter(Course.status == CourseStatus.PUBLISHED)
    
    if keyword:
        query = query.filter(
            or_(
                Course.title.like(f"%{keyword}%"),
                Course.description.like(f"%{keyword}%")
            )
        )
    
    # 总数
    total = query.count()
    
    # 分页
    courses = query.order_by(Course.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    # 为每个课程添加关联信息
    courses_list = []
    for course in courses:
        course_dict = {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "cover_image": course.cover_image,
            "category_id": course.category_id,
            "teacher_id": course.teacher_id,
            "price": course.price,
            "original_price": course.original_price,
            "status": course.status,
            "level": course.level,
            "tags": course.tags,
            "student_count": course.student_count,
            "rating": course.rating,
            "rating_count": course.rating_count,
            "view_count": course.view_count,
            "created_at": course.created_at,
            "updated_at": course.updated_at,
            "teacher_name": course.teacher.full_name or course.teacher.username if course.teacher else None,
            "category_name": course.category.name if course.category else None,
            "chapter_count": len(course.chapters) if course.chapters else 0
        }
        courses_list.append(course_dict)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": courses_list
    }


@router.get("/{course_id}", response_model=CourseDetail, summary="获取课程详情")
def get_course(course_id: int, db: Session = Depends(get_db)):
    """
    获取课程详情
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程不存在"
        )

    # 增加浏览次数
    course.view_count += 1
    db.commit()

    # 构建响应数据，包含关联信息
    course_dict = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "cover_image": course.cover_image,
        "category_id": course.category_id,
        "teacher_id": course.teacher_id,
        "price": course.price,
        "original_price": course.original_price,
        "status": course.status,
        "level": course.level,
        "tags": course.tags,
        "student_count": course.student_count,
        "rating": course.rating,
        "rating_count": course.rating_count,
        "view_count": course.view_count,
        "created_at": course.created_at,
        "updated_at": course.updated_at,
        "teacher_name": course.teacher.full_name or course.teacher.username if course.teacher else None,
        "category_name": course.category.name if course.category else None,
        "chapters": course.chapters
    }

    return course_dict


@router.put("/{course_id}", response_model=CourseResponse, summary="更新课程")
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    更新课程（讲师/管理员）
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程不存在"
        )
    
    # 检查权限（只能编辑自己的课程，管理员除外）
    if course.teacher_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限编辑此课程"
        )
    
    # 更新课程
    update_data = course_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)
    
    db.commit()
    db.refresh(course)
    
    return course


@router.delete("/{course_id}", summary="删除课程")
def delete_course(
    course_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    删除课程（讲师/管理员）
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课程不存在"
        )
    
    # 检查权限
    if course.teacher_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此课程"
        )
    
    db.delete(course)
    db.commit()

    return {"message": "课程删除成功"}


@router.post("/{course_id}/enroll", summary="报名课程")
def enroll_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """报名课程"""
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    # 检查课程状态
    if course.status != CourseStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="课程未发布，无法报名")

    # 检查是否已报名
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="已经报名此课程")

    # 创建报名记录
    enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=course_id
    )

    db.add(enrollment)

    # 更新课程学习人数
    course.student_count += 1

    db.commit()

    return {"message": "报名成功"}


@router.get("/{course_id}/is_enrolled", summary="检查是否已报名")
def check_enrollment(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """检查用户是否已报名课程"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()

    return {"is_enrolled": enrollment is not None}




