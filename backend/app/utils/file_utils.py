"""
文件处理工具
"""
import os
import uuid
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings


ALLOWED_IMAGE_EXTENSIONS = settings.ALLOWED_IMAGE_TYPES.split(',')
ALLOWED_VIDEO_EXTENSIONS = settings.ALLOWED_VIDEO_TYPES.split(',')


def get_file_extension(filename: str) -> str:
    """
    获取文件扩展名
    
    Args:
        filename: 文件名
    
    Returns:
        str: 扩展名（小写，不含点）
    """
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def is_allowed_file(filename: str, file_type: str = 'image') -> bool:
    """
    检查文件类型是否允许
    
    Args:
        filename: 文件名
        file_type: 文件类型 ('image' 或 'video')
    
    Returns:
        bool: 是否允许
    """
    extension = get_file_extension(filename)
    
    if file_type == 'image':
        return extension in ALLOWED_IMAGE_EXTENSIONS
    elif file_type == 'video':
        return extension in ALLOWED_VIDEO_EXTENSIONS
    
    return False


def generate_unique_filename(original_filename: str) -> str:
    """
    生成唯一的文件名
    
    Args:
        original_filename: 原始文件名
    
    Returns:
        str: 唯一文件名
    """
    extension = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}.{extension}"


async def save_upload_file(
    upload_file: UploadFile,
    file_type: str = 'image',
    subfolder: str = ''
) -> Optional[str]:
    """
    保存上传的文件
    
    Args:
        upload_file: 上传的文件
        file_type: 文件类型 ('image' 或 'video')
        subfolder: 子文件夹名称
    
    Returns:
        Optional[str]: 文件相对路径，失败返回None
    """
    # 检查文件类型
    if not is_allowed_file(upload_file.filename, file_type):
        return None
    
    # 生成唯一文件名
    filename = generate_unique_filename(upload_file.filename)
    
    # 确定保存路径
    if file_type == 'image':
        base_dir = os.path.join(settings.UPLOAD_DIR, 'images')
    elif file_type == 'video':
        base_dir = os.path.join(settings.UPLOAD_DIR, 'videos')
    else:
        base_dir = settings.UPLOAD_DIR
    
    # 添加子文件夹
    if subfolder:
        base_dir = os.path.join(base_dir, subfolder)
    
    # 确保目录存在
    os.makedirs(base_dir, exist_ok=True)
    
    # 完整文件路径
    file_path = os.path.join(base_dir, filename)
    
    # 保存文件
    try:
        with open(file_path, 'wb') as f:
            content = await upload_file.read()
            f.write(content)
        
        # 返回相对路径（用于数据库存储）
        relative_path = file_path.replace(settings.UPLOAD_DIR, '/static/uploads').replace('\\', '/')
        return relative_path
    
    except Exception as e:
        print(f"文件保存失败: {e}")
        return None


def delete_file(file_path: str) -> bool:
    """
    删除文件
    
    Args:
        file_path: 文件路径（相对路径）
    
    Returns:
        bool: 是否成功
    """
    try:
        # 转换为绝对路径
        if file_path.startswith('/static/uploads'):
            file_path = file_path.replace('/static/uploads', settings.UPLOAD_DIR)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    
    except Exception as e:
        print(f"文件删除失败: {e}")
        return False


def get_file_size(file_path: str) -> int:
    """
    获取文件大小
    
    Args:
        file_path: 文件路径
    
    Returns:
        int: 文件大小（字节）
    """
    try:
        if file_path.startswith('/static/uploads'):
            file_path = file_path.replace('/static/uploads', settings.UPLOAD_DIR)
        
        if os.path.exists(file_path):
            return os.path.getsize(file_path)
        return 0
    
    except Exception as e:
        print(f"获取文件大小失败: {e}")
        return 0


