// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  avatar?: string
  full_name?: string
  phone?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// 课程相关类型
export interface Course {
  id: number
  title: string
  description?: string
  cover_image?: string
  category_id: number
  teacher_id: number
  price: number
  original_price?: number
  status: 'draft' | 'published' | 'offline'
  level: 'beginner' | 'intermediate' | 'advanced'
  tags?: string
  student_count: number
  rating: number
  rating_count: number
  view_count: number
  created_at: string
  updated_at: string
  chapters?: Chapter[]
}

// 章节类型
export interface Chapter {
  id: number
  course_id: number
  title: string
  description?: string
  sort_order: number
  sections?: Section[]
}

// 小节类型
export interface Section {
  id: number
  chapter_id: number
  title: string
  video_url?: string
  video_duration: number
  is_free: boolean
  sort_order: number
}

// 分类类型
export interface Category {
  id: number
  name: string
  parent_id?: number
  description?: string
  sort_order: number
  is_active: boolean
  children?: Category[]
}

// 直播间类型
export interface LiveRoom {
  id: number
  title: string
  description?: string
  teacher_id: number
  cover_image?: string
  status: 'not_started' | 'living' | 'finished'
  start_time?: string
  end_time?: string
  viewer_count: number
  max_viewer_count: number
  push_url?: string
  pull_url_rtmp?: string
  pull_url_flv?: string
  pull_url_hls?: string
}

// 评论类型
export interface Comment {
  id: number
  user_id: number
  course_id: number
  parent_id?: number
  content: string
  rating?: number
  like_count: number
  is_deleted: boolean
  created_at: string
  user?: User
}

// 学习记录类型
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

// 分页响应类型
export interface PageResponse<T> {
  total: number
  page: number
  page_size: number
  items: T[]
}

// API响应类型
export interface ApiResponse<T = any> {
  code?: number
  message?: string
  data?: T
}
