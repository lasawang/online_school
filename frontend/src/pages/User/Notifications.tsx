import { useState, useEffect } from 'react'
import { Layout, Card, List, Button, Empty, Spin, Badge, message } from 'antd'
import {
  BellOutlined,
  NotificationOutlined,
  BookOutlined,
  VideoCameraOutlined,
  CommentOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import { notificationApi, Notification as ApiNotification } from '../../services/notification'
import './Notifications.css'

const { Content } = Layout

interface Notification {
  id: number
  type: 'SYSTEM' | 'COURSE' | 'LIVE' | 'COMMENT'
  title: string
  content: string
  time: string
  read: boolean
  link?: string
}

function Notifications() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // 格式化时间显示
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
    return date.toLocaleDateString()
  }

  // 获取通知列表
  const fetchNotifications = async () => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const response: any = await notificationApi.getNotifications({ page: 1, page_size: 50 })
      const formattedNotifications: Notification[] = response.items.map((item: ApiNotification) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content || '',
        time: formatTime(item.created_at),
        read: item.is_read,
        link: item.link_url,
      }))
      setNotifications(formattedNotifications)
    } catch (error) {
      console.error('获取通知列表失败:', error)
      message.error('获取通知列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isAuthenticated])

  const getIcon = (type: string) => {
    const upperType = type.toUpperCase()
    switch (upperType) {
      case 'SYSTEM':
        return <NotificationOutlined />
      case 'COURSE':
        return <BookOutlined />
      case 'LIVE':
        return <VideoCameraOutlined />
      case 'COMMENT':
        return <CommentOutlined />
      default:
        return <BellOutlined />
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      message.success('所有通知已标记为已读')
    } catch (error) {
      console.error('标记失败:', error)
      message.error('标记失败')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // 标记为已读
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id)
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        ))
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    }
    // 跳转
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isAuthenticated) {
    return (
      <Layout className="main-layout">
        <Sidebar />
        <Layout style={{ marginLeft: 250 }}>
          <Header />
          <Content className="notifications-content">
            <div className="empty-notifications">
              <Empty description="请先登录查看通知" />
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
        <Content className="notifications-content">
          <div className="notifications-header">
            <div>
              <h1>
                <BellOutlined /> 消息通知
                {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 10 }} />}
              </h1>
              <p>查看系统消息和互动通知</p>
            </div>
            {unreadCount > 0 && (
              <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
                全部已读
              </Button>
            )}
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : notifications.length > 0 ? (
            <Card className="notification-card">
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item 
                    className={`notification-item ${item.read ? '' : 'unread'}`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className={`notification-icon ${item.type}`}>
                          {getIcon(item.type)}
                        </div>
                      }
                      title={
                        <div className="notification-content">
                          <h4>{item.title}</h4>
                          <p>{item.content}</p>
                          <span className="time">{item.time}</span>
                        </div>
                      }
                    />
                    {!item.read && <div className="unread-dot" />}
                  </List.Item>
                )}
              />
            </Card>
          ) : (
            <div className="empty-notifications">
              <Empty description="暂无通知" />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default Notifications
