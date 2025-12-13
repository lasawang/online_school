"""
创建系统设置表的数据库迁移脚本
"""
from app.core.database import engine, Base
from app.models.system_setting import SystemSetting

def create_system_settings_table():
    """创建系统设置表"""
    print("正在创建系统设置表...")
    Base.metadata.create_all(bind=engine, tables=[SystemSetting.__table__])
    print("系统设置表创建成功！")

if __name__ == "__main__":
    create_system_settings_table()
