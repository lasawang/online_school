"""
章节管理API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.chapter import Chapter
from app.models.section import Section
from app.schemas.chapter import (
    ChapterCreate, ChapterUpdate, ChapterResponse,
    SectionCreate, SectionUpdate, SectionResponse
)
from app.api.deps import get_current_user, require_teacher

router = APIRouter()


# 章节管理
@router.get("/course/{course_id}", response_model=List[ChapterResponse], summary="获取课程章节列表")
def get_course_chapters(
    course_id: int,
    db: Session = Depends(get_db)
):
    """获取课程的所有章节（包含小节）"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    chapters = db.query(Chapter).filter(Chapter.course_id == course_id).order_by(Chapter.sort_order).all()

    # 为每个章节加载小节
    result = []
    for chapter in chapters:
        chapter_dict = {
            "id": chapter.id,
            "course_id": chapter.course_id,
            "title": chapter.title,
            "description": chapter.description,
            "sort_order": chapter.sort_order,
            "created_at": chapter.created_at,
            "updated_at": chapter.updated_at,
            "sections": []
        }

        sections = db.query(Section).filter(Section.chapter_id == chapter.id).order_by(Section.sort_order).all()
        chapter_dict["sections"] = sections
        result.append(chapter_dict)

    return result


@router.post("", response_model=ChapterResponse, summary="创建章节")
def create_chapter(
    chapter_in: ChapterCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """创建章节"""
    course = db.query(Course).filter(Course.id == chapter_in.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    if course.teacher_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="无权限操作此课程")
    
    db_chapter = Chapter(**chapter_in.model_dump())
    db.add(db_chapter)
    db.commit()
    db.refresh(db_chapter)
    return db_chapter


@router.put("/{chapter_id}", response_model=ChapterResponse, summary="更新章节")
def update_chapter(
    chapter_id: int,
    chapter_in: ChapterUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """更新章节"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    course = db.query(Course).filter(Course.id == chapter.course_id).first()
    if course.teacher_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    update_data = chapter_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(chapter, key, value)
    
    db.commit()
    db.refresh(chapter)
    return chapter


@router.delete("/{chapter_id}", summary="删除章节")
def delete_chapter(
    chapter_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """删除章节"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    course = db.query(Course).filter(Course.id == chapter.course_id).first()
    if course.teacher_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    db.delete(chapter)
    db.commit()
    return {"message": "章节删除成功"}


# 小节管理
@router.post("/sections", response_model=SectionResponse, summary="创建小节")
def create_section(
    section_in: SectionCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """创建小节"""
    chapter = db.query(Chapter).filter(Chapter.id == section_in.chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    course = db.query(Course).filter(Course.id == chapter.course_id).first()
    if course.teacher_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    db_section = Section(**section_in.model_dump())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section


@router.put("/sections/{section_id}", response_model=SectionResponse, summary="更新小节")
def update_section(
    section_id: int,
    section_in: SectionUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """更新小节"""
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="小节不存在")
    
    chapter = db.query(Chapter).filter(Chapter.id == section.chapter_id).first()
    course = db.query(Course).filter(Course.id == chapter.course_id).first()
    if course.teacher_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    update_data = section_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(section, key, value)
    
    db.commit()
    db.refresh(section)
    return section


@router.delete("/sections/{section_id}", summary="删除小节")
def delete_section(
    section_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """删除小节"""
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="小节不存在")
    
    chapter = db.query(Chapter).filter(Chapter.id == section.chapter_id).first()
    course = db.query(Course).filter(Course.id == chapter.course_id).first()
    if course.teacher_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    db.delete(section)
    db.commit()
    return {"message": "小节删除成功"}


