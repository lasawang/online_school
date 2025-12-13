import api from './api'

export interface Banner {
  id: number
  title: string
  image_url: string
  link_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export const bannerApi = {
  // 获取轮播图列表
  getBanners() {
    return api.get('/api/v1/banners')
  },
}
