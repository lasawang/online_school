import api from './api'

export interface LiveRoom {
  id: number
  title: string
  description: string
  teacher_id: number
  cover_image: string
  status: 'not_started' | 'living' | 'finished'
  start_time: string
  end_time?: string
  viewer_count: number
  max_viewer_count: number
  push_url?: string
  pull_url_rtmp?: string
  pull_url_flv?: string
  pull_url_hls?: string
}

export interface LiveListParams {
  page?: number
  page_size?: number
  status?: string
}

export const liveApi = {
  // 获取直播列表
  getLives(params?: LiveListParams) {
    return api.get('/api/v1/lives', { params })
  },

  // 获取直播详情
  getLiveDetail(id: number) {
    return api.get(`/api/v1/lives/${id}`)
  },

  // 创建直播
  createLive(data: Partial<LiveRoom>) {
    return api.post('/api/v1/lives', data)
  },

  // 更新直播
  updateLive(id: number, data: Partial<LiveRoom>) {
    return api.put(`/api/v1/lives/${id}`, data)
  },

  // 删除直播
  deleteLive(id: number) {
    return api.delete(`/api/v1/lives/${id}`)
  },
}
