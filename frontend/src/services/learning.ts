import api from './api'

export interface LearningRecord {
  id: number
  user_id: number
  course_id: number
  section_id: number
  progress: number
  last_position: number
  is_completed: boolean
  learning_time: number
}

export const learningApi = {
  // 保存学习记录
  saveRecord(data: {
    course_id: number
    section_id: number
    progress: number
    last_position: number
    is_completed?: boolean
  }) {
    return api.post('/api/v1/learning/records', data)
  },

  // 获取课程学习记录
  getCourseRecords(courseId: number) {
    return api.get(`/api/v1/learning/records/course/${courseId}`)
  },

  // 获取我的课程
  getMyCourses() {
    return api.get('/api/v1/learning/my-courses')
  },

  // 收藏课程
  collectCourse(courseId: number) {
    return api.post(`/api/v1/learning/collections/${courseId}`)
  },

  // 取消收藏
  uncollectCourse(courseId: number) {
    return api.delete(`/api/v1/learning/collections/${courseId}`)
  },

  // 检查是否收藏
  checkCollection(courseId: number) {
    return api.get(`/api/v1/learning/collections/check/${courseId}`)
  },

  // 获取我的收藏
  getMyCollections() {
    return api.get('/api/v1/learning/collections')
  },

  // 获取学习统计
  getStats() {
    return api.get('/api/v1/learning/stats')
  },
}
