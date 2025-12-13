import api from './api'

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
  updated_at: string
}

export interface CommentCreateData {
  course_id: number
  content: string
  rating?: number
  parent_id?: number
}

export interface CommentListParams {
  course_id: number
  parent_id?: number
  page?: number
  page_size?: number
}

export const commentApi = {
  // 发表评论
  createComment(data: CommentCreateData) {
    return api.post('/api/v1/comments', data)
  },

  // 获取评论列表
  getComments(params: CommentListParams) {
    return api.get('/api/v1/comments', { params })
  },

  // 更新评论
  updateComment(id: number, data: { content: string }) {
    return api.put(`/api/v1/comments/${id}`, data)
  },

  // 删除评论
  deleteComment(id: number) {
    return api.delete(`/api/v1/comments/${id}`)
  },

  // 点赞评论
  likeComment(id: number) {
    return api.post(`/api/v1/comments/${id}/like`)
  },
}
