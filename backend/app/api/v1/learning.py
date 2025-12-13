"""
学习记录API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.section import Section
from app.models.learning_record import LearningRecord
from app.models.collection import Collection
from app.schemas.learning_record import (
    LearningRecordCreate, LearningRecordUpdate, LearningRecordResponse
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/records", response_model=LearningRecordResponse, summary="创建/更新学习记录")
def save_learning_record(
    record_in: LearningRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """保存学习记录"""
    # 检查课程和小节是否存在
    course = db.query(Course).filter(Course.id == record_in.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")
    
    section = db.query(Section).filter(Section.id == record_in.section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="小节不存在")
    
    # 查找是否已有学习记录
    existing_record = db.query(LearningRecord).filter(
        LearningRecord.user_id == current_user.id,
        LearningRecord.section_id == record_in.section_id
    ).first()
    
    if existing_record:
        # 更新现有记录
        existing_record.progress = record_in.progress
        existing_record.last_position = record_in.last_position
        
        # 如果进度达到100%，标记为已完成
        if record_in.progress >= 100:
            existing_record.is_completed = True
        
        db.commit()
        db.refresh(existing_record)
        return existing_record
    else:
        # 创建新记录
        db_record = LearningRecord(
            user_id=current_user.id,
            course_id=record_in.course_id,
            section_id=record_in.section_id,
            progress=record_in.progress,
            last_position=record_in.last_position,
            is_completed=record_in.progress >= 100
        )
        
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record


@router.get("/records/course/{course_id}", response_model=List[LearningRecordResponse], summary="获取课程学习记录")
def get_course_learning_records(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取指定课程的学习记录"""
    records = db.query(LearningRecord).filter(
        LearningRecord.user_id == current_user.id,
        LearningRecord.course_id == course_id
    ).all()
    
    return records


@router.get("/my-courses", summary="我的课程")
def get_my_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取我正在学习的课程"""
    # 获取有学习记录的课程
    query = db.query(Course).join(LearningRecord).filter(
        LearningRecord.user_id == current_user.id
    ).distinct()
    
    total = query.count()
    courses = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # 为每个课程添加学习进度
    result = []
    for course in courses:
        # 计算课程总进度
        records = db.query(LearningRecord).filter(
            LearningRecord.user_id == current_user.id,
            LearningRecord.course_id == course.id
        ).all()
        
        if records:
            avg_progress = sum(r.progress for r in records) / len(records)
            completed_count = sum(1 for r in records if r.is_completed)
        else:
            avg_progress = 0
            completed_count = 0
        
        result.append({
            "course": course,
            "progress": round(avg_progress, 2),
            "completed_sections": completed_count,
            "total_sections": len(records),
            "last_learn_time": max((r.updated_at for r in records), default=None)
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": result
    }


@router.post("/collections/{course_id}", summary="收藏课程")
def collect_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """收藏课程"""
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")
    
    # 检查是否已收藏
    existing = db.query(Collection).filter(
        Collection.user_id == current_user.id,
        Collection.course_id == course_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="已经收藏过此课程")
    
    # 创建收藏
    collection = Collection(
        user_id=current_user.id,
        course_id=course_id
    )
    
    db.add(collection)
    db.commit()
    
    return {"message": "收藏成功"}


@router.delete("/collections/{course_id}", summary="取消收藏")
def uncollect_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消收藏课程"""
    collection = db.query(Collection).filter(
        Collection.user_id == current_user.id,
        Collection.course_id == course_id
    ).first()
    
    if not collection:
        raise HTTPException(status_code=404, detail="未收藏此课程")
    
    db.delete(collection)
    db.commit()
    
    return {"message": "取消收藏成功"}


@router.get("/collections/check/{course_id}", summary="检查是否收藏")
def check_collection(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """检查是否收藏了指定课程"""
    collection = db.query(Collection).filter(
        Collection.user_id == current_user.id,
        Collection.course_id == course_id
    ).first()

    return {"is_collected": collection is not None}


@router.get("/collections", summary="我的收藏")
def get_my_collections(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取我收藏的课程"""
    query = db.query(Course).join(Collection).filter(
        Collection.user_id == current_user.id
    )

    total = query.count()
    courses = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": courses
    }


@router.get("/stats", summary="学习统计")
def get_learning_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取学习统计数据"""
    # 学习中的课程数
    learning_courses = db.query(Course.id).join(LearningRecord).filter(
        LearningRecord.user_id == current_user.id
    ).distinct().count()
    
    # 已完成的小节数
    completed_sections = db.query(LearningRecord).filter(
        LearningRecord.user_id == current_user.id,
        LearningRecord.is_completed == True
    ).count()
    
    # 累计学习时长（秒）
    total_time = db.query(func.sum(LearningRecord.learning_time)).filter(
        LearningRecord.user_id == current_user.id
    ).scalar() or 0
    
    # 收藏的课程数
    collections_count = db.query(Collection).filter(
        Collection.user_id == current_user.id
    ).count()
    
    return {
        "learning_courses": learning_courses,
        "completed_sections": completed_sections,
        "total_learning_time": total_time,
        "total_learning_hours": round(total_time / 3600, 2),
        "collections_count": collections_count
    }


