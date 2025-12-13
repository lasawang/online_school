import { useState, useEffect } from 'react'
import { Layout, Row, Col, Empty, Spin, Button, message } from 'antd'
import { HeartFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import CourseCard from '../../components/CourseCard'
import { learningApi } from '../../services/learning'
import './Favorites.css'

const { Content } = Layout

interface CourseItem {
  id: number
  title: string
  cover_image: string
  duration: string
  students: number
  rating: number
  tags: string[]
}

function Favorites() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<CourseItem[]>([])

  // 从API获取收藏列表
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      try {
        const response: any = await learningApi.getMyCollections()
        if (response.items && response.items.length > 0) {
          const courses = response.items.map((course: any) => ({
            id: course.id,
            title: course.title,
            cover_image: course.cover_image || `https://picsum.photos/seed/course${course.id}/400/300`,
            duration: '15 min',
            students: course.student_count || 0,
            rating: parseFloat(course.rating) || 4.5,
            tags: course.tags ? course.tags.split(',').map((t: string) => t.trim()) : ['课程'],
          }))
          setFavorites(courses)
        } else {
          setFavorites([])
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
        message.error('获取收藏列表失败')
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <Layout className="main-layout">
        <Sidebar />
        <Layout style={{ marginLeft: 250 }}>
          <Header />
          <Content className="favorites-content">
            <div className="empty-favorites">
              <Empty description="请先登录查看收藏" />
              <Button type="primary" onClick={() => navigate('/login')}>
                去登录
              </Button>
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header />
        <Content className="favorites-content">
          <div className="favorites-header">
            <h1>
              <HeartFilled /> 我的收藏
            </h1>
            <p>收藏的课程，随时学习</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : favorites.length > 0 ? (
            <Row gutter={[24, 24]}>
              {favorites.map((course) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
                  <CourseCard {...course} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-favorites">
              <Empty description="暂无收藏的课程" />
              <Button type="primary" onClick={() => navigate('/courses')}>
                去发现课程
              </Button>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default Favorites
