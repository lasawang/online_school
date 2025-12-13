"""
文件上传API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.models.user import User
from app.api.deps import get_current_user
from app.utils.file_utils import save_upload_file, is_allowed_file
from app.core.config import settings

router = APIRouter()


@router.post("/image", summary="上传图片")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    上传图片（支持：jpg, jpeg, png, gif, webp）
    """
    # 检查文件类型
    if not is_allowed_file(file.filename, 'image'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的图片格式，仅支持：{settings.ALLOWED_IMAGE_TYPES}"
        )
    
    # 检查文件大小
    content = await file.read()
    await file.seek(0)  # 重置文件指针
    
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制（{settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB）"
        )
    
    # 保存文件
    file_path = await save_upload_file(file, file_type='image')
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="文件保存失败"
        )
    
    return {
        "url": file_path,
        "filename": file.filename,
        "size": len(content)
    }


@router.post("/video", summary="上传视频")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    上传视频（支持：mp4, avi, mov, flv）
    """
    # 检查文件类型
    if not is_allowed_file(file.filename, 'video'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的视频格式，仅支持：{settings.ALLOWED_VIDEO_TYPES}"
        )
    
    # 保存文件
    file_path = await save_upload_file(file, file_type='video')
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="文件保存失败"
        )
    
    return {
        "url": file_path,
        "filename": file.filename,
        "message": "视频上传成功，如需转码请使用转码接口"
    }


@router.post("/images", summary="批量上传图片")
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    批量上传图片
    """
    uploaded_files = []
    errors = []
    
    for file in files:
        try:
            if not is_allowed_file(file.filename, 'image'):
                errors.append(f"{file.filename}: 不支持的格式")
                continue
            
            file_path = await save_upload_file(file, file_type='image')
            
            if file_path:
                uploaded_files.append({
                    "url": file_path,
                    "filename": file.filename
                })
            else:
                errors.append(f"{file.filename}: 保存失败")
        
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    return {
        "uploaded": uploaded_files,
        "errors": errors,
        "total": len(files),
        "success_count": len(uploaded_files)
    }


