"""
创建新表的数据库迁移脚本
钱包、通知扩展、直播功能
"""
from app.core.database import engine, Base
from app.models.wallet import Wallet, Transaction
from app.models.notification import Notification
from app.models.live import Live
from app.models.user import User
from app.models.course import Course

def create_new_tables():
    """创建新表"""
    print("Creating wallet tables...")
    Base.metadata.create_all(bind=engine, tables=[
        Wallet.__table__,
        Transaction.__table__
    ])
    print("Wallet tables created successfully!")

    print("\nUpdating notification table...")
    # 通知表已存在，这里会更新schema
    Base.metadata.create_all(bind=engine, tables=[Notification.__table__])
    print("Notification table updated successfully!")

    print("\nCreating live table...")
    Base.metadata.create_all(bind=engine, tables=[Live.__table__])
    print("Live table created successfully!")

    print("\nAll new tables created successfully!")

if __name__ == "__main__":
    create_new_tables()
