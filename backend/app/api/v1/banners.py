"""
Banner轮播图管理API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.banner import Banner
from app.schemas.banner import BannerCreate, BannerUpdate, BannerResponse
from app.api.deps import require_admin

router = APIRouter()


@router.get("", response_model=List[BannerResponse], summary="获取轮播图列表")
def get_banners(db: Session = Depends(get_db)):
    """获取所有激活的轮播图"""
    banners = db.query(Banner).filter(
        Banner.is_active == True
    ).order_by(Banner.sort_order).all()

    return banners


@router.post("", response_model=BannerResponse, summary="创建轮播图")
def create_banner(
    banner_in: BannerCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """创建轮播图（管理员）"""
    db_banner = Banner(**banner_in.model_dump())
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    return db_banner


@router.put("/{banner_id}", response_model=BannerResponse, summary="更新轮播图")
def update_banner(
    banner_id: int,
    banner_in: BannerUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新轮播图（管理员）"""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="轮播图不存在")

    update_data = banner_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(banner, key, value)

    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/{banner_id}", summary="删除轮播图")
def delete_banner(
    banner_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """删除轮播图（管理员）"""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="轮播图不存在")

    db.delete(banner)
    db.commit()
    return {"message": "轮播图删除成功"}
