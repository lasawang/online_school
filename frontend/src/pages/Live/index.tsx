import { useState, useEffect } from 'react'
import { Layout, Row, Col, Card, Tag, Avatar, Button, Empty, Spin, message } from 'antd'
import {
  VideoCameraOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import { liveApi } from '../../services/live'
import './index.css'

const { Content } = Layout

interface LiveRoomItem {
  id: number
  title: string
  description: string
  teacher_name: string
  teacher_avatar: string
  cover_image: string
  status: 'not_started' | 'living' | 'finished'
  start_time: string
  viewer_count: number
}

function LiveList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [liveRooms, setLiveRooms] = useState<LiveRoomItem[]>([])

  // 从API获取直播列表
  useEffect(() => {
    const fetchLives = async () => {
      setLoading(true)
      try {
        const response: any = await liveApi.getLives({ page: 1, page_size: 20 })
        if (response.items && response.items.length > 0) {
          const rooms = response.items.map((room: any) => ({
            id: room.id,
            title: room.title,
            description: room.description || '',
            teacher_name: room.teacher?.full_name || room.teacher?.username || '讲师',
            teacher_avatar: room.teacher?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=teacher${room.teacher_id}`,
            cover_image: room.cover_image || `https://picsum.photos/seed/live${room.id}/400/225`,
            status: room.status,
            start_time: room.start_time ? new Date(room.start_time).toLocaleString('zh-CN') : '待定',
            viewer_count: room.viewer_count || 0,
          }))
          setLiveRooms(rooms)
        } else {
          setLiveRooms([])
        }
      } catch (error) {
        console.error('获取直播列表失败:', error)
        message.error('获取直播列表失败，请检查后端服务')
        setLiveRooms([])
      } finally {
        setLoading(false)
      }
    }
    fetchLives()
  }, [])

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'living':
        return (
          <Tag color="red" icon={<PlayCircleOutlined />}>
            直播中
          </Tag>
        )
      case 'not_started':
        return (
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            即将开始
          </Tag>
        )
      case 'finished':
        return <Tag color="default">已结束</Tag>
      default:
        return null
    }
  }

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header />
        <Content className="live-content">
          <div className="live-header">
            <h1>
              <VideoCameraOutlined /> 直播课程
            </h1>
            <p>实时互动，名师在线答疑</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : liveRooms.length > 0 ? (
            <Row gutter={[24, 24]}>
              {liveRooms.map((room) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
                  <Card
                    hoverable
                    className={`live-card ${room.status}`}
                    cover={
                      <div className="live-cover">
                        <img alt={room.title} src={room.cover_image} />
                        <div className="live-status">{getStatusTag(room.status)}</div>
                        {room.status === 'living' && (
                          <div className="viewer-count">
                            <UserOutlined /> {room.viewer_count} 人观看
                          </div>
                        )}
                      </div>
                    }
                    onClick={() => navigate(`/live/${room.id}`)}
                  >
                    <Card.Meta
                      title={room.title}
                      description={
                        <div className="live-info">
                          <div className="teacher">
                            <Avatar src={room.teacher_avatar} size={24} />
                            <span>{room.teacher_name}</span>
                          </div>
                          <div className="time">
                            <ClockCircleOutlined /> {room.start_time}
                          </div>
                        </div>
                      }
                    />
                    <Button
                      type={room.status === 'living' ? 'primary' : 'default'}
                      block
                      className="enter-btn"
                    >
                      {room.status === 'living'
                        ? '进入直播'
                        : room.status === 'not_started'
                          ? '预约提醒'
                          : '查看回放'}
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无直播课程" />
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default LiveList
