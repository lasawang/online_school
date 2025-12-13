import api from './api'

export interface Notification {
  id: number
  user_id: number
  type: 'SYSTEM' | 'COURSE' | 'LIVE' | 'COMMENT'
  title: string
  content?: string
  link_url?: string
  is_read: boolean
  created_at: string
  read_at?: string
}

export interface NotificationListResponse {
  items: Notification[]
  total: number
  page: number
  page_size: number
  pages: number
}

export const notificationApi = {
  // 获取通知列表
  getNotifications(params?: { page?: number; page_size?: number; is_read?: boolean }) {
    return api.get<NotificationListResponse>('/api/v1/notifications', { params })
  },

  // 获取未读数量
  getUnreadCount() {
    return api.get<{ count: number }>('/api/v1/notifications/unread-count')
  },

  // 标记单个为已读
  markAsRead(id: number) {
    return api.put<Notification>(`/api/v1/notifications/${id}/read`)
  },

  // 标记全部为已读
  markAllRead() {
    return api.put<{ message: string; updated_count: number }>('/api/v1/notifications/mark-all-read')
  },

  // 删除通知
  deleteNotification(id: number) {
    return api.delete<{ message: string }>(`/api/v1/notifications/${id}`)
  },
}
