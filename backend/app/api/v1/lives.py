"""
直播管理API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.live_room import LiveRoom, LiveStatus
from app.schemas.live import LiveRoomCreate, LiveRoomUpdate, LiveRoomResponse
from app.schemas.common import PageResponse
from app.api.deps import get_current_user, require_teacher
import hashlib
import time

router = APIRouter()


def generate_stream_urls(room_id: int, app: str = "live") -> dict:
    """生成推拉流地址"""
    stream_key = f"room_{room_id}"
    
    # 简单示例，实际应该根据SRS配置生成
    return {
        "push_url": f"rtmp://localhost/{app}/{stream_key}",
        "pull_url_rtmp": f"rtmp://localhost/{app}/{stream_key}",
        "pull_url_flv": f"http://localhost:8080/{app}/{stream_key}.flv",
        "pull_url_hls": f"http://localhost:8080/{app}/{stream_key}.m3u8"
    }


@router.post("", response_model=LiveRoomResponse, summary="创建直播间")
def create_live_room(
    live_in: LiveRoomCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """创建直播间（讲师/管理员）"""
    db_live = LiveRoom(
        **live_in.model_dump(),
        teacher_id=current_user.id
    )
    
    db.add(db_live)
    db.commit()
    db.refresh(db_live)
    
    # 生成推拉流地址
    urls = generate_stream_urls(db_live.id)
    db_live.push_url = urls["push_url"]
    db_live.pull_url_rtmp = urls["pull_url_rtmp"]
    db_live.pull_url_flv = urls["pull_url_flv"]
    db_live.pull_url_hls = urls["pull_url_hls"]
    
    db.commit()
    db.refresh(db_live)
    
    return db_live


@router.get("", response_model=PageResponse[LiveRoomResponse], summary="获取直播列表")
def get_live_rooms(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[LiveStatus] = None,
    db: Session = Depends(get_db)
):
    """获取直播列表"""
    query = db.query(LiveRoom)
    
    if status:
        query = query.filter(LiveRoom.status == status)
    
    total = query.count()
    live_rooms = query.order_by(LiveRoom.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": live_rooms
    }


@router.get("/{live_id}", response_model=LiveRoomResponse, summary="获取直播详情")
def get_live_room(live_id: int, db: Session = Depends(get_db)):
    """获取直播详情"""
    live_room = db.query(LiveRoom).filter(LiveRoom.id == live_id).first()
    if not live_room:
        raise HTTPException(status_code=404, detail="直播间不存在")
    
    return live_room


@router.put("/{live_id}", response_model=LiveRoomResponse, summary="更新直播")
def update_live_room(
    live_id: int,
    live_in: LiveRoomUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """更新直播（讲师/管理员）"""
    live_room = db.query(LiveRoom).filter(LiveRoom.id == live_id).first()
    if not live_room:
        raise HTTPException(status_code=404, detail="直播间不存在")
    
    if live_room.teacher_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    update_data = live_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(live_room, key, value)
    
    db.commit()
    db.refresh(live_room)
    return live_room


@router.delete("/{live_id}", summary="删除直播")
def delete_live_room(
    live_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """删除直播（讲师/管理员）"""
    live_room = db.query(LiveRoom).filter(LiveRoom.id == live_id).first()
    if not live_room:
        raise HTTPException(status_code=404, detail="直播间不存在")
    
    if live_room.teacher_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="无权限操作")
    
    db.delete(live_room)
    db.commit()
    return {"message": "直播间删除成功"}


