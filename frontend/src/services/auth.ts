import api from './api'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  full_name?: string
  phone?: string
}

export const authApi = {
  // 登录
  login(data: LoginData) {
    return api.post('/api/v1/auth/login', data)
  },

  // 注册
  register(data: RegisterData) {
    return api.post('/api/v1/auth/register', data)
  },

  // 获取当前用户信息
  getCurrentUser() {
    return api.get('/api/v1/auth/me')
  },

  // 修改密码
  changePassword(data: { old_password: string; new_password: string }) {
    return api.post('/api/v1/auth/change-password', data)
  },
  },

  // 更新用户信息
  updateProfile(data: Partial<RegisterData>) {
    return api.put('/api/v1/auth/profile', data)
  },
}

