import { useState, useEffect } from 'react'
import { Layout, Input, Badge, Avatar, Dropdown, Button, List, Empty, message } from 'antd'
import { SearchOutlined, BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { notificationApi, Notification } from '../../services/notification'
import { getImageUrl } from '../../utils/url'
import './Header.css'

const { Header: AntHeader } = Layout

interface HeaderProps {
  title?: string
}

function Header({ title = 'Dashboard' }: HeaderProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // 获取通知列表
  const fetchNotifications = async () => {
    if (!isAuthenticated) return

    try {
      const response: any = await notificationApi.getNotifications({ page: 1, page_size: 10 })
      setNotifications(response.items || [])
    } catch (error) {
      console.error('获取通知失败:', error)
    }
  }

  // 获取未读数量
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return

    try {
      const response: any = await notificationApi.getUnreadCount()
      setUnreadCount(response.count || 0)
    } catch (error) {
      console.error('获取未读数量失败:', error)
    }
  }

  // 初始加载和定期刷新
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      fetchUnreadCount()

      // 每30秒刷新一次
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // 标记单个通知为已读
  const handleMarkRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId)
      // 更新本地状态
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 标记全部为已读
  const handleMarkAllRead = async () => {
    setLoading(true)
    try {
      await notificationApi.markAllRead()
      message.success('所有通知已标记为已读')
      // 刷新列表
      await fetchNotifications()
      setUnreadCount(0)
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
    return date.toLocaleDateString()
  }

  const notificationContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
        <span>通知</span>
        <Button type="link" size="small" onClick={handleMarkAllRead} loading={loading}>
          全部已读
        </Button>
      </div>
      {notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: item.is_read ? '#fff' : '#f6f8fa',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => {
                if (!item.is_read) {
                  handleMarkRead(item.id)
                }
                if (item.link_url) {
                  navigate(item.link_url)
                }
                setNotificationOpen(false)
              }}
            >
              <List.Item.Meta
                avatar={item.is_read ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#1890ff' }} />}
                title={<span style={{ fontSize: 14, fontWeight: item.is_read ? 400 : 600 }}>{item.title}</span>}
                description={
                  <div>
                    {item.content && (
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{item.content}</div>
                    )}
                    <div style={{ fontSize: 11, color: '#999' }}>{formatTime(item.created_at)}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无通知" style={{ padding: '40px 0' }} />
      )}
    </div>
  )

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="custom-header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-emoji">📚</span>
          <span className="logo-text">IT学习平台</span>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <Input
            placeholder="搜索课程..."
            prefix={<SearchOutlined />}
            className="search-input"
            size="large"
            onPressEnter={(e) => {
              const value = (e.target as HTMLInputElement).value
              if (value) {
                navigate(`/courses?keyword=${encodeURIComponent(value)}`)
              }
            }}
          />
        </div>

        {/* Right Section */}
        <div className="header-right">
          {isAuthenticated ? (
            <>
              {/* Notification */}
              <Dropdown
                dropdownRender={() => notificationContent}
                trigger={['click']}
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                placement="bottomRight"
                overlayStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Badge count={unreadCount} offset={[-5, 5]} style={{ cursor: 'pointer' }}>
                  <BellOutlined className="header-icon" style={{ fontSize: 20 }} />
                </Badge>
              </Dropdown>

              {/* User Info */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Avatar
                    src={getImageUrl(user?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                    size={40}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="username">{user?.full_name || user?.username || '用户'}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="auth-buttons">
              <Button type="text" onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </div>
          )}
        </div>
      </div>
    </AntHeader>
  )
}

export default Header


