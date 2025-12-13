"""
初始化数据库表结构
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models import *

# 导入所有模型
from app.models.user import User
from app.models.category import Category
from app.models.course import Course
from app.models.chapter import Chapter
from app.models.section import Section
from app.models.learning_record import LearningRecord
from app.models.collection import Collection
from app.models.comment import Comment
from app.models.live_room import LiveRoom
from app.models.banner import Banner
from app.models.operation_log import OperationLog
from app.models.course_enrollment import CourseEnrollment
from app.models.wallet import Wallet, Transaction
from app.models.notification import Notification
from app.models.system_setting import SystemSetting

from app.core.database import Base, engine

def init_db():
    """初始化数据库"""
    print("=" * 50)
    print("  初始化数据库表结构")
    print("=" * 50)
    print(f"\n数据库URL: {settings.DATABASE_URL}\n")
    
    try:
        # 删除所有表（谨慎！）
        print("删除现有表...")
        Base.metadata.drop_all(bind=engine)
        print("✓ 现有表已删除\n")
        
        # 创建所有表
        print("创建数据表...")
        Base.metadata.create_all(bind=engine)
        print("✓ 数据表创建成功\n")
        
        # 显示创建的表
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            print("已创建的表:")
            for i, table in enumerate(tables, 1):
                print(f"  {i}. {table}")
        
        print(f"\n总计: {len(tables)} 张表")
        print("\n" + "=" * 50)
        print("✅ 数据库初始化完成！")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ 错误: {str(e)}")
        raise

if __name__ == "__main__":
    init_db()
