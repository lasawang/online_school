import api from './api'

export interface Wallet {
  id: number
  user_id: number
  balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  wallet_id: number
  user_id: number
  type: string
  amount: number
  balance_before: number
  balance_after: number
  description: string
  course_id?: number
  created_at: string
}

export const walletApi = {
  // 获取我的钱包
  getMyWallet() {
    return api.get<Wallet>('/api/v1/wallet/my')
  },

  // 充值
  recharge(amount: number) {
    return api.post<Transaction>('/api/v1/wallet/recharge', { amount })
  },

  // 购买课程
  purchaseCourse(courseId: number) {
    return api.post<Transaction>('/api/v1/wallet/purchase-course', {
      course_id: courseId,
    })
  },

  // 获取交易记录
  getTransactions(skip: number = 0, limit: number = 20) {
    return api.get<Transaction[]>('/api/v1/wallet/transactions', {
      params: { skip, limit },
    })
  },
}
