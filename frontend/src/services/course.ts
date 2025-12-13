import api from './api'

export interface Course {
  id: number
  title: string
  description: string
  cover_image: string
  category_id: number
  teacher_id: number
  price: number
  original_price: number
  status: string
  level: string
  student_count: number
  rating: number
  rating_count: number
  view_count: number
  created_at: string
}

export interface CourseListParams {
  page?: number
  page_size?: number
  category_id?: number
  status?: string
  keyword?: string
}

export const courseApi = {
  // 获取课程列表
  getCourses(params: CourseListParams) {
    return api.get('/api/v1/courses', { params })
  },

  // 获取课程详情
  getCourseDetail(id: number) {
    return api.get(`/api/v1/courses/${id}`)
  },

  // 创建课程
  createCourse(data: any) {
    return api.post('/api/v1/courses', data)
  },

  // 更新课程
  updateCourse(id: number, data: any) {
    return api.put(`/api/v1/courses/${id}`, data)
  },

  // 删除课程
  deleteCourse(id: number) {
    return api.delete(`/api/v1/courses/${id}`)
  },

  // 报名课程
  enrollCourse(id: number) {
    return api.post(`/api/v1/courses/${id}/enroll`)
  },

  // 检查是否已报名
  checkEnrollment(id: number) {
    return api.get(`/api/v1/courses/${id}/is_enrolled`)
  },
}


