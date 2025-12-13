import api from './api'

export interface SystemSettings {
  siteName: string
  siteDescription: string
  enableRegistration: boolean
  enableComments: boolean
  enableNotifications: boolean
  maintenanceMode: boolean
}

export const settingsApi = {
  // 获取系统设置
  getSettings() {
    return api.get<SystemSettings>('/api/v1/settings')
  },

  // 更新系统设置
  updateSettings(settings: Partial<SystemSettings>) {
    return api.put<{ message: string }>('/api/v1/settings', settings)
  },

  // 获取公开设置（无需认证）
  getPublicSettings() {
    return api.get<any>('/api/v1/settings/public')
  },
}
