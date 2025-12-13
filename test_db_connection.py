#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库连接测试脚本
测试连接到 192.168.0.102 的 MySQL 数据库
"""
import sys
import os

# 设置UTF-8编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import pymysql
from pymysql.cursors import DictCursor
import time
from datetime import datetime

# 从项目配置中读取的数据库信息
DB_CONFIG = {
    'host': '192.168.0.102',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'it_learning',
    'charset': 'utf8mb4'
}


def print_separator():
    """打印分隔线"""
    print("=" * 70)


def test_basic_connection():
    """测试基本连接"""
    print("\n[1] 测试基本连接...")
    print(f"    目标: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"    用户: {DB_CONFIG['user']}")
    print(f"    数据库: {DB_CONFIG['database']}")

    try:
        start_time = time.time()
        connection = pymysql.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            charset=DB_CONFIG['charset'],
            connect_timeout=10
        )
        elapsed_time = time.time() - start_time

        print(f"    ✓ 连接成功! (耗时: {elapsed_time:.2f}秒)")

        # 获取数据库版本信息
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()[0]
            print(f"    MySQL版本: {version}")

        connection.close()
        return True

    except pymysql.MySQLError as e:
        print(f"    ✗ 连接失败!")
        print(f"    错误代码: {e.args[0]}")
        print(f"    错误信息: {e.args[1]}")
        return False
    except Exception as e:
        print(f"    ✗ 连接失败!")
        print(f"    异常: {str(e)}")
        return False


def test_database_exists():
    """测试数据库是否存在"""
    print("\n[2] 检查数据库是否存在...")

    try:
        connection = pymysql.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            charset=DB_CONFIG['charset']
        )

        with connection.cursor() as cursor:
            cursor.execute("SHOW DATABASES LIKE %s", (DB_CONFIG['database'],))
            result = cursor.fetchone()

            if result:
                print(f"    ✓ 数据库 '{DB_CONFIG['database']}' 存在")
                connection.close()
                return True
            else:
                print(f"    ✗ 数据库 '{DB_CONFIG['database']}' 不存在")
                connection.close()
                return False

    except Exception as e:
        print(f"    ✗ 检查失败: {str(e)}")
        return False


def test_tables():
    """测试数据表"""
    print("\n[3] 检查数据表...")

    try:
        connection = pymysql.connect(**DB_CONFIG)

        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

            if tables:
                print(f"    ✓ 找到 {len(tables)} 个数据表:")
                for table in tables:
                    print(f"      - {table[0]}")
            else:
                print("    ! 数据库中没有数据表")

        connection.close()
        return True

    except Exception as e:
        print(f"    ✗ 检查失败: {str(e)}")
        return False


def test_permissions():
    """测试权限"""
    print("\n[4] 测试数据库权限...")

    try:
        connection = pymysql.connect(**DB_CONFIG)

        # 测试SELECT权限
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                print("    ✓ SELECT权限: 正常")
        except Exception as e:
            print(f"    ✗ SELECT权限: 失败 - {str(e)}")

        # 测试INSERT权限（不实际插入）
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s", (DB_CONFIG['database'],))
                print("    ✓ 读取权限: 正常")
        except Exception as e:
            print(f"    ✗ 读取权限: 失败 - {str(e)}")

        connection.close()
        return True

    except Exception as e:
        print(f"    ✗ 权限测试失败: {str(e)}")
        return False


def test_connection_pool():
    """测试连接池"""
    print("\n[5] 测试多连接...")

    try:
        connections = []
        max_connections = 5

        for i in range(max_connections):
            conn = pymysql.connect(**DB_CONFIG)
            connections.append(conn)
            print(f"    ✓ 连接 {i+1}/{max_connections} 建立成功")

        # 关闭所有连接
        for conn in connections:
            conn.close()

        print(f"    ✓ 成功创建和关闭 {max_connections} 个连接")
        return True

    except Exception as e:
        print(f"    ✗ 多连接测试失败: {str(e)}")
        # 清理连接
        for conn in connections:
            try:
                conn.close()
            except:
                pass
        return False


def test_query_performance():
    """测试查询性能"""
    print("\n[6] 测试查询性能...")

    try:
        connection = pymysql.connect(**DB_CONFIG)

        # 测试简单查询
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        elapsed = time.time() - start_time
        print(f"    简单查询响应时间: {elapsed*1000:.2f}ms")

        # 测试数据库信息查询
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s", (DB_CONFIG['database'],))
            result = cursor.fetchone()
        elapsed = time.time() - start_time
        print(f"    信息查询响应时间: {elapsed*1000:.2f}ms")

        connection.close()
        return True

    except Exception as e:
        print(f"    ✗ 性能测试失败: {str(e)}")
        return False


def main():
    """主函数"""
    print_separator()
    print(f"数据库连接测试工具")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_separator()

    results = []

    # 执行所有测试
    results.append(("基本连接", test_basic_connection()))

    if results[-1][1]:  # 如果基本连接成功，继续其他测试
        results.append(("数据库存在性", test_database_exists()))
        results.append(("数据表检查", test_tables()))
        results.append(("权限检查", test_permissions()))
        results.append(("多连接测试", test_connection_pool()))
        results.append(("性能测试", test_query_performance()))
    else:
        print("\n基本连接失败，跳过其他测试")

    # 打印测试总结
    print_separator()
    print("\n测试总结:")
    success_count = sum(1 for _, result in results if result)
    total_count = len(results)

    for test_name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"  {status} - {test_name}")

    print(f"\n通过率: {success_count}/{total_count} ({success_count/total_count*100:.1f}%)")
    print_separator()

    # 返回状态码
    sys.exit(0 if success_count == total_count else 1)


if __name__ == "__main__":
    main()
