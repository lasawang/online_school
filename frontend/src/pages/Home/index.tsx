import { useState, useEffect } from 'react'
import { Layout, Row, Col, Card, Statistic, Progress, Avatar, List, Spin } from 'antd'
import {
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import CourseCard from '../../components/CourseCard'
import { courseApi } from '../../services/course'
import { learningApi } from '../../services/learning'
import './index.css'

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

interface LearningStats {
  learning_courses: number
  completed_sections: number
  total_learning_time: number
  total_learning_hours: number
  collections_count: number
}

function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const displayName = user?.full_name || user?.username || '学员'

  const [loading, setLoading] = useState(false)
  const [featuredCourses, setFeaturedCourses] = useState<CourseItem[]>([])
  const [learningStats, setLearningStats] = useState<LearningStats>({
    learning_courses: 0,
    completed_sections: 0,
    total_learning_time: 0,
    total_learning_hours: 0,
    collections_count: 0,
  })

  // 获取精选课程
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const response: any = await courseApi.getCourses({ page: 1, page_size: 3 })
        if (response.items) {
          const courses = response.items.map((course: any) => ({
            id: course.id,
            title: course.title,
            cover_image: course.cover_image || `https://picsum.photos/seed/course${course.id}/400/300`,
            duration: '15 min',
            students: course.student_count || 0,
            rating: parseFloat(course.rating) || 4.5,
            tags: course.tags ? course.tags.split(',').map((t: string) => t.trim()) : ['课程'],
          }))
          setFeaturedCourses(courses)
        }
      } catch (error) {
        console.error('获取课程失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // 获取学习统计（仅登录用户）
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return
      try {
        const response: any = await learningApi.getStats()
        setLearningStats(response)
      } catch (error) {
        console.error('获取学习统计失败:', error)
      }
    }
    fetchStats()
  }, [isAuthenticated])

  const stats = [
    {
      title: '学习课程',
      value: learningStats.learning_courses,
      icon: <CheckCircleOutlined />,
      color: '#6FD181',
    },
    {
      title: '学习时长',
      value: learningStats.total_learning_hours,
      suffix: '小时',
      icon: <ClockCircleOutlined />,
      color: '#1935CA',
    },
    {
      title: '完成小节',
      value: learningStats.completed_sections,
      icon: <TrophyOutlined />,
      color: '#FFB800',
    },
  ]

  const reminders = [
    { id: 1, title: 'Python基础课程', dueDate: '继续学习', isDue: false },
    { id: 2, title: 'React实战项目', dueDate: '新章节更新', isDue: true },
    { id: 3, title: '数据库优化', dueDate: '即将开课', isDue: false },
  ]

  const onlineUsers = [
    { name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' },
    { name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' },
    { name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3' },
    { name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4' },
    { name: '更多', avatar: '', count: '20+' },
  ]

  const progressPercent = isAuthenticated
    ? Math.min(Math.round((learningStats.completed_sections / 10) * 100), 100)
    : 0

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header title="Dashboard" />
        <Content className="dashboard-content">
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>欢迎回来，{displayName}</h1>
              <p>继续你的学习之旅 🚀</p>
              <div className="user-level">
                <span className="level-badge">
                  {isAuthenticated ? '学习达人' : '开始学习吧'}
                </span>
              </div>
            </div>
            <div className="progress-circle">
              <Progress
                type="circle"
                percent={progressPercent}
                strokeColor="#1935CA"
                format={(percent) => `${percent}%`}
              />
            </div>
          </div>

          {/* Statistics */}
          <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card className="stat-card">
                  <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                    <span style={{ color: stat.color, fontSize: 24 }}>{stat.icon}</span>
                  </div>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color, fontWeight: 700 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            {/* Featured Courses */}
            <Col xs={24} lg={16}>
              <div className="section-header">
                <h2>
                  <FireOutlined /> 精选课程
                </h2>
                <a onClick={() => navigate('/courses')}>查看全部</a>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {featuredCourses.map((course) => (
                    <Col xs={24} md={12} lg={8} key={course.id}>
                      <CourseCard {...course} />
                    </Col>
                  ))}
                </Row>
              )}

              {/* Online Users */}
              <div className="online-users-section">
                <h3>在线用户</h3>
                <div className="online-users">
                  {onlineUsers.map((onlineUser, index) => (
                    <div key={index} className="user-avatar-wrapper">
                      {onlineUser.count ? (
                        <div className="more-users">{onlineUser.count}</div>
                      ) : (
                        <Avatar src={onlineUser.avatar} size={48}>
                          {onlineUser.name.charAt(0)}
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Reminders */}
            <Col xs={24} lg={8}>
              <div className="reminders-card">
                <h2>学习提醒</h2>
                <List
                  dataSource={reminders}
                  renderItem={(item) => (
                    <List.Item className="reminder-item">
                      <div className="reminder-content">
                        <div className="reminder-icon">
                          <CheckCircleOutlined />
                        </div>
                        <div className="reminder-text">
                          <h4>{item.title}</h4>
                          <p className={item.isDue ? 'due-today' : ''}>
                            {item.isDue && '• '}
                            {item.dueDate}
                          </p>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>

              {/* Achievements */}
              <div className="achievements-card">
                <h3>最新成就</h3>
                <div className="badges">
                  <div className="badge" title="回归者">
                    🏆
                  </div>
                  <div className="badge" title="幸运儿">
                    🍀
                  </div>
                  <div className="badge" title="获胜者">
                    👑
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Home
