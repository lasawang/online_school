"""
创建测试数据
用于开发环境快速测试
"""
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course, CourseLevel, CourseStatus
from app.models.chapter import Chapter
from app.models.section import Section
from app.core.security import get_password_hash
from datetime import datetime

def create_test_data():
    """创建测试数据"""
    db = SessionLocal()
    
    try:
        # 1. 创建测试用户
        print("创建测试用户...")
        
        # 管理员
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                full_name="系统管理员",
                is_active=True
            )
            db.add(admin)
            print("  ✓ 管理员账号: admin / admin123")
        
        # 讲师
        teacher = db.query(User).filter(User.username == "teacher").first()
        if not teacher:
            teacher = User(
                username="teacher",
                email="teacher@example.com",
                password_hash=get_password_hash("teacher123"),
                role=UserRole.TEACHER,
                full_name="张老师",
                is_active=True
            )
            db.add(teacher)
            print("  ✓ 讲师账号: teacher / teacher123")
        
        # 学员
        student = db.query(User).filter(User.username == "student").first()
        if not student:
            student = User(
                username="student",
                email="student@example.com",
                password_hash=get_password_hash("student123"),
                role=UserRole.STUDENT,
                full_name="李同学",
                is_active=True
            )
            db.add(student)
            print("  ✓ 学员账号: student / student123")
        
        db.commit()
        db.refresh(admin)
        db.refresh(teacher)
        db.refresh(student)
        
        # 2. 创建分类
        print("\n创建课程分类...")
        categories_data = [
            {"name": "编程语言", "description": "各类编程语言学习"},
            {"name": "前端开发", "description": "前端技术栈"},
            {"name": "后端开发", "description": "后端技术栈"},
            {"name": "数据库", "description": "数据库技术"},
            {"name": "算法与数据结构", "description": "算法学习"},
        ]
        
        categories = []
        for cat_data in categories_data:
            cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not cat:
                cat = Category(**cat_data, sort_order=len(categories) + 1)
                db.add(cat)
                print(f"  ✓ {cat_data['name']}")
            categories.append(cat)
        
        db.commit()
        for cat in categories:
            db.refresh(cat)
        
        # 3. 创建课程
        print("\n创建示例课程...")
        courses_data = [
            {
                "title": "Python零基础入门",
                "description": "从零开始学习Python编程，适合完全没有编程经验的学员",
                "category_id": categories[0].id,
                "teacher_id": teacher.id,
                "price": 99.00,
                "original_price": 199.00,
                "status": CourseStatus.PUBLISHED,
                "level": CourseLevel.BEGINNER,
                "tags": "Python,编程基础,零基础",
            },
            {
                "title": "React前端开发实战",
                "description": "掌握React框架，开发现代化的前端应用",
                "category_id": categories[1].id,
                "teacher_id": teacher.id,
                "price": 149.00,
                "original_price": 299.00,
                "status": CourseStatus.PUBLISHED,
                "level": CourseLevel.INTERMEDIATE,
                "tags": "React,前端,JavaScript",
            },
            {
                "title": "MySQL数据库从入门到精通",
                "description": "全面掌握MySQL数据库的使用和优化",
                "category_id": categories[3].id,
                "teacher_id": teacher.id,
                "price": 129.00,
                "original_price": 259.00,
                "status": CourseStatus.PUBLISHED,
                "level": CourseLevel.INTERMEDIATE,
                "tags": "MySQL,数据库,SQL",
            },
        ]
        
        courses = []
        for course_data in courses_data:
            course = db.query(Course).filter(Course.title == course_data["title"]).first()
            if not course:
                course = Course(**course_data)
                db.add(course)
                print(f"  ✓ {course_data['title']}")
            courses.append(course)
        
        db.commit()
        for course in courses:
            db.refresh(course)
        
        # 4. 为第一个课程创建章节和小节
        print("\n创建课程章节和小节...")
        if courses:
            first_course = courses[0]
            
            # 章节1
            chapter1 = db.query(Chapter).filter(
                Chapter.course_id == first_course.id,
                Chapter.title == "第一章：Python基础"
            ).first()
            
            if not chapter1:
                chapter1 = Chapter(
                    course_id=first_course.id,
                    title="第一章：Python基础",
                    description="学习Python的基本语法和概念",
                    sort_order=1
                )
                db.add(chapter1)
                db.commit()
                db.refresh(chapter1)
                
                # 小节
                sections_data = [
                    {"title": "1.1 Python简介", "video_duration": 300, "is_free": True, "sort_order": 1},
                    {"title": "1.2 安装Python环境", "video_duration": 600, "is_free": True, "sort_order": 2},
                    {"title": "1.3 第一个Python程序", "video_duration": 900, "is_free": False, "sort_order": 3},
                    {"title": "1.4 变量和数据类型", "video_duration": 1200, "is_free": False, "sort_order": 4},
                ]
                
                for sec_data in sections_data:
                    section = Section(
                        chapter_id=chapter1.id,
                        **sec_data
                    )
                    db.add(section)
                
                print(f"  ✓ 第一章：Python基础 (4个小节)")
            
            # 章节2
            chapter2 = db.query(Chapter).filter(
                Chapter.course_id == first_course.id,
                Chapter.title == "第二章：控制流程"
            ).first()
            
            if not chapter2:
                chapter2 = Chapter(
                    course_id=first_course.id,
                    title="第二章：控制流程",
                    description="学习条件判断和循环",
                    sort_order=2
                )
                db.add(chapter2)
                db.commit()
                db.refresh(chapter2)
                
                sections_data = [
                    {"title": "2.1 if条件判断", "video_duration": 800, "is_free": False, "sort_order": 1},
                    {"title": "2.2 for循环", "video_duration": 900, "is_free": False, "sort_order": 2},
                    {"title": "2.3 while循环", "video_duration": 700, "is_free": False, "sort_order": 3},
                ]
                
                for sec_data in sections_data:
                    section = Section(
                        chapter_id=chapter2.id,
                        **sec_data
                    )
                    db.add(section)
                
                print(f"  ✓ 第二章：控制流程 (3个小节)")
        
        db.commit()
        
        print("\n" + "="*50)
        print("✅ 测试数据创建完成！")
        print("="*50)
        print("\n测试账号：")
        print("  管理员: admin / admin123")
        print("  讲师:   teacher / teacher123")
        print("  学员:   student / student123")
        print("\n" + "="*50)
        
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*50)
    print("  IT学习课程平台 - 创建测试数据")
    print("="*50 + "\n")
    create_test_data()
