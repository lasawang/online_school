"""
分类管理API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import require_admin

router = APIRouter()


@router.get("", response_model=List[CategoryResponse], summary="获取分类列表")
def get_categories(db: Session = Depends(get_db)):
    """获取所有分类（树形结构）"""
    # 获取顶级分类
    categories = db.query(Category).filter(
        Category.parent_id.is_(None),
        Category.is_active == True
    ).order_by(Category.sort_order).all()
    
    return categories


@router.post("", response_model=CategoryResponse, summary="创建分类")
def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """创建分类（管理员）"""
    # 检查父分类是否存在
    if category_in.parent_id:
        parent = db.query(Category).filter(Category.id == category_in.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="父分类不存在")
    
    db_category = Category(**category_in.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/{category_id}", response_model=CategoryResponse, summary="更新分类")
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新分类（管理员）"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    update_data = category_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", summary="删除分类")
def delete_category(
    category_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """删除分类（管理员）"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    # 检查是否有子分类
    if category.children:
        raise HTTPException(status_code=400, detail="该分类下有子分类，无法删除")
    
    # 检查是否有课程
    if category.courses:
        raise HTTPException(status_code=400, detail="该分类下有课程，无法删除")
    
    db.delete(category)
    db.commit()
    return {"message": "分类删除成功"}


