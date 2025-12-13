import api from './api'

export interface Section {
  id: number
  chapter_id: number
  title: string
  video_url?: string
  duration?: number
  sort_order: number
}

export interface Chapter {
  id: number
  course_id: number
  title: string
  description?: string
  sort_order: number
  sections: Section[]
}

export const chapterApi = {
  // 创建章节
  createChapter(data: any) {
    return api.post('/api/v1/chapters', data)
  },

  // 更新章节
  updateChapter(id: number, data: any) {
    return api.put(`/api/v1/chapters/${id}`, data)
  },

  // 删除章节
  deleteChapter(id: number) {
    return api.delete(`/api/v1/chapters/${id}`)
  },

  // 创建小节
  createSection(data: any) {
    return api.post('/api/v1/chapters/sections', data)
  },

  // 更新小节
  updateSection(id: number, data: any) {
    return api.put(`/api/v1/chapters/sections/${id}`, data)
  },

  // 删除小节
  deleteSection(id: number) {
    return api.delete(`/api/v1/chapters/sections/${id}`)
  },
}
