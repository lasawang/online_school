import api from './api'

export const uploadApi = {
  // 上传图片
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 上传视频
  uploadVideo(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 批量上传图片
  uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return api.post('/api/v1/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
