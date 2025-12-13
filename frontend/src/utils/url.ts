/**
 * URL 工具函数
 */

// 获取API基础URL
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.102:8080'
}

/**
 * 获取完整的图片URL
 * @param url 相对或绝对URL
 * @returns 完整的URL
 */
export const getImageUrl = (url?: string | null): string => {
  if (!url) return ''

  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 如果是相对路径，加上服务器地址
  if (url.startsWith('/')) {
    return `${getApiBaseUrl()}${url}`
  }

  return url
}

/**
 * 获取完整的视频URL
 * @param url 相对或绝对URL
 * @returns 完整的URL
 */
export const getVideoUrl = (url?: string | null): string => {
  return getImageUrl(url) // 逻辑相同
}
