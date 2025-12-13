import { useState, useEffect } from 'react'
import { Layout, Row, Col, Card, Progress, Empty, Spin, Button, Statistic } from 'antd'
import {
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  BookOutlined,
  StarOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import { learningApi } from '../../services/learning'
import './Achievements.css'

const { Content } = Layout

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  total: number
}

function Achievements() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    learning_courses: 0,
    completed_sections: 0,
    total_learning_hours: 0,
    collections_count: 0,
    streak: 7, // 连续学习天数暂时使用固定值
  })

  // 基于真实数据计算成就
  const achievements: Achievement[] = [
    {
      id: 1,
      name: '初学者',
      description: '完成第一门课程',
      icon: '🎓',
      unlocked: stats.learning_courses >= 1,
      progress: Math.min(stats.learning_courses, 1),
      total: 1,
    },
    {
      id: 2,
      name: '学习达人',
      description: '累计学习10小时',
      icon: '⏰',
      unlocked: stats.total_learning_hours >= 10,
      progress: Math.min(stats.total_learning_hours, 10),
      total: 10,
    },
    {
      id: 3,
      name: '坚持不懈',
      description: '连续学习7天',
      icon: '🔥',
      unlocked: stats.streak >= 7,
      progress: stats.streak,
      total: 7,
    },
    {
      id: 4,
      name: '知识收藏家',
      description: '收藏10门课程',
      icon: '❤️',
      unlocked: stats.collections_count >= 10,
      progress: stats.collections_count,
      total: 10,
    },
    {
      id: 5,
      name: '勤奋之星',
      description: '完成50个小节',
      icon: '💬',
      unlocked: stats.completed_sections >= 50,
      progress: stats.completed_sections,
      total: 50,
    },
    {
      id: 6,
      name: '课程专家',
      description: '学习5门课程',
      icon: '👑',
      unlocked: stats.learning_courses >= 5,
      progress: stats.learning_courses,
      total: 5,
    },
    {
      id: 7,
      name: '百日精进',
      description: '累计学习100小时',
      icon: '🏆',
      unlocked: stats.total_learning_hours >= 100,
      progress: Math.min(stats.total_learning_hours, 100),
      total: 100,
    },
    {
      id: 8,
      name: '收藏大师',
      description: '收藏20门课程',
      icon: '⭐',
      unlocked: stats.collections_count >= 20,
      progress: stats.collections_count,
      total: 20,
    },
  ]

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      try {
        const response: any = await learningApi.getStats()
        setStats({
          ...response,
          streak: 7, // 连续学习天数暂时使用固定值
        })
      } catch (error) {
        console.error('获取学习统计失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <Layout className="main-layout">
        <Sidebar />
        <Layout style={{ marginLeft: 250 }}>
          <Header />
          <Content className="achievements-content">
            <div className="empty-achievements">
              <Empty description="请先登录查看成就" />
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
        <Content className="achievements-content">
          <div className="achievements-header">
            <h1><TrophyOutlined /> 我的成就</h1>
            <p>记录你的学习里程碑</p>
          </div>

          {/* 统计卡片 */}
          <Row gutter={[24, 24]} className="stats-row">
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="学习课程"
                  value={stats.learning_courses}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1935CA' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="完成小节"
                  value={stats.completed_sections}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#6FD181' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="学习时长"
                  value={stats.total_learning_hours}
                  suffix="小时"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#FFB800' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="收藏课程"
                  value={stats.collections_count}
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#FF7262' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 成就列表 */}
          <h2 className="section-title">
            <CrownOutlined /> 成就徽章
            <span className="unlocked-count">
              已解锁 {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </span>
          </h2>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {achievements.map((achievement) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={achievement.id}>
                  <Card 
                    className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                    <Progress
                      percent={Math.min((achievement.progress / achievement.total) * 100, 100)}
                      size="small"
                      status={achievement.unlocked ? 'success' : 'active'}
                      format={() => `${achievement.progress}/${achievement.total}`}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default Achievements
