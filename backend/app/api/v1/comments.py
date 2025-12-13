"""
评论管理API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("", response_model=CommentResponse, summary="发表评论")
def create_comment(
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """发表评论"""
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == comment_in.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")
    
    # 如果是回复评论，检查父评论是否存在
    if comment_in.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == comment_in.parent_id).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="父评论不存在")
    
    # 创建评论
    db_comment = Comment(
        **comment_in.model_dump(),
        user_id=current_user.id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # 如果有评分，更新课程评分
    if comment_in.rating:
        # 重新计算课程平均分
        comments_with_rating = db.query(Comment).filter(
            Comment.course_id == comment_in.course_id,
            Comment.rating.isnot(None),
            Comment.is_deleted == False
        ).all()
        
        if comments_with_rating:
            avg_rating = sum(c.rating for c in comments_with_rating) / len(comments_with_rating)
            course.rating = round(avg_rating, 2)
            course.rating_count = len(comments_with_rating)
            db.commit()
    
    return db_comment


@router.get("", response_model=List[CommentResponse], summary="获取评论列表")
def get_comments(
    course_id: int = Query(..., description="课程ID"),
    parent_id: Optional[int] = Query(None, description="父评论ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取评论列表"""
    query = db.query(Comment).filter(
        Comment.course_id == course_id,
        Comment.is_deleted == False
    )
    
    # 只获取顶级评论或指定父评论的回复
    if parent_id is None:
        query = query.filter(Comment.parent_id.is_(None))
    else:
        query = query.filter(Comment.parent_id == parent_id)
    
    comments = query.order_by(Comment.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return comments


@router.put("/{comment_id}", response_model=CommentResponse, summary="更新评论")
def update_comment(
    comment_id: int,
    comment_in: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新评论"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    
    # 只能编辑自己的评论
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权限编辑此评论")
    
    update_data = comment_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(comment, key, value)
    
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}", summary="删除评论")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除评论（软删除）"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    
    # 只能删除自己的评论或管理员
    if comment.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权限删除此评论")
    
    # 软删除
    comment.is_deleted = True
    db.commit()
    
    return {"message": "评论删除成功"}


@router.post("/{comment_id}/like", summary="点赞评论")
def like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """点赞评论"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    
    # 简单实现：直接增加点赞数
    # 实际项目中应该记录用户点赞关系，防止重复点赞
    comment.like_count += 1
    db.commit()
    
    return {"message": "点赞成功", "like_count": comment.like_count}


