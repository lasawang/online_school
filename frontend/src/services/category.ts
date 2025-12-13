import api from './api'

export interface Category {
  id: number
  name: string
  parent_id: number | null
  description: string
  sort_order: number
  is_active: boolean
  children?: Category[]
}

export const categoryApi = {
  // 获取分类列表
  getCategories() {
    return api.get('/api/v1/categories')
  },

  // 获取分类详情
  getCategoryDetail(id: number) {
    return api.get(`/api/v1/categories/${id}`)
  },
}
