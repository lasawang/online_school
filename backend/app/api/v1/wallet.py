"""
钱包相关API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User
from app.models.wallet import Wallet, Transaction, TransactionType
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment
from app.schemas.wallet import (
    WalletResponse, RechargeRequest, PurchaseCourseRequest, TransactionResponse
)

router = APIRouter()


@router.get("/my", response_model=WalletResponse)
def get_my_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户钱包"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()

    if not wallet:
        # 如果钱包不存在，创建一个
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return wallet


@router.post("/recharge", response_model=TransactionResponse)
def recharge_wallet(
    request: RechargeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """充值钱包"""
    # 获取或创建钱包
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.flush()

    # 记录充值前余额
    balance_before = wallet.balance

    # 充值
    wallet.balance += request.amount

    # 创建交易记录
    transaction = Transaction(
        wallet_id=wallet.id,
        user_id=current_user.id,
        type=TransactionType.RECHARGE,
        amount=request.amount,
        balance_before=balance_before,
        balance_after=wallet.balance,
        description=f"充值 ¥{request.amount}"
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.post("/purchase-course", response_model=TransactionResponse)
def purchase_course(
    request: PurchaseCourseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """购买课程"""
    # 查询课程
    course = db.query(Course).filter(Course.id == request.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="课程不存在")

    # 检查是否已经报名
    existing_enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course.id
    ).first()

    if existing_enrollment:
        raise HTTPException(status_code=400, detail="您已经报名过该课程")

    # 获取钱包
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.flush()

    # 检查余额
    if wallet.balance < course.price:
        raise HTTPException(status_code=400, detail=f"余额不足，需要 ¥{course.price}，当前余额 ¥{wallet.balance}")

    # 扣款
    balance_before = wallet.balance
    wallet.balance -= course.price

    # 创建交易记录
    transaction = Transaction(
        wallet_id=wallet.id,
        user_id=current_user.id,
        type=TransactionType.PURCHASE,
        amount=-course.price,
        balance_before=balance_before,
        balance_after=wallet.balance,
        description=f"购买课程: {course.title}",
        course_id=course.id
    )
    db.add(transaction)

    # 创建课程报名记录
    enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=course.id
    )
    db.add(enrollment)

    # 增加课程学生数
    course.student_count += 1

    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("/transactions", response_model=List[TransactionResponse])
def get_my_transactions(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取我的交易记录"""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()

    return transactions


@router.post("/admin/add-balance/{user_id}", response_model=TransactionResponse)
def admin_add_balance(
    user_id: int,
    amount: float,
    description: str = "管理员充值",
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员给用户添加余额"""
    # 查询用户
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 获取或创建钱包
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=0.0)
        db.add(wallet)
        db.flush()

    # 添加余额
    balance_before = wallet.balance
    wallet.balance += amount

    # 创建交易记录
    transaction = Transaction(
        wallet_id=wallet.id,
        user_id=user_id,
        type=TransactionType.ADMIN_ADD,
        amount=amount,
        balance_before=balance_before,
        balance_after=wallet.balance,
        description=description
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction
