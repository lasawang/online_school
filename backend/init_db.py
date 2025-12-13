"""
初始化数据库
"""
from app.core.database import Base, engine
from app.models import *  # 导入所有模型

def init_database():
    """创建所有表"""
    print("正在创建数据库表...")
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成！")

if __name__ == "__main__":
    init_database()
