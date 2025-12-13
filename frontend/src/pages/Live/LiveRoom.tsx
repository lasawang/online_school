import { useState, useEffect, useRef } from 'react'
import { Layout, Row, Col, Card, Input, Button, List, Avatar, Tag, message } from 'antd'
import {
  SendOutlined,
  LikeOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import { useSocket } from '../../hooks/useSocket'
import { getImageUrl } from '../../utils/url'
import './LiveRoom.css'

const { Content } = Layout

interface ChatMessage {
  id: number
  user: string
  avatar: string
  content: string
  time: string
  type: 'text' | 'system'
}

function LiveRoom() {
  const { id: roomId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // WebSocket连接
  const { connected, userCount, sendMessage: socketSendMessage, onNewMessage, offNewMessage } = useSocket({
    roomId: roomId || '1',
    user,
  })

  // Mock直播间数据
  const roomData = {
    id: 1,
    title: 'Python实战直播课 - 爬虫开发',
    teacher: '张老师',
    status: 'living',
    viewer_count: userCount || 156,
    pull_url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  }

  // 初始消息
  useEffect(() => {
    setMessages([
      { id: 1, user: '系统', avatar: '', content: '欢迎来到直播间！', time: '14:00', type: 'system' },
    ])
  }, [])

  // 监听新消息
  useEffect(() => {
    onNewMessage((data: any) => {
      const newMessage: ChatMessage = {
        id: Date.now(),
        user: data.user_info?.username || '游客',
        avatar: getImageUrl(data.user_info?.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user_info?.username}`,
        content: data.message,
        time: new Date(data.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      }
      setMessages((prev) => [...prev, newMessage])
    })

    return () => {
      offNewMessage()
    }
  }, [onNewMessage, offNewMessage])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      message.warning('请先登录后再发言')
      return
    }
    if (!inputMessage.trim()) {
      return
    }

    if (!connected) {
      message.error('未连接到服务器')
      return
    }

    // 使用WebSocket发送消息
    socketSendMessage(inputMessage.trim())
    setInputMessage('')
  }

  return (
    <Layout className="main-layout">
      <Layout>
        <Header />
        <Content className="live-room-content">
          <div className="live-room-header">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/live')}
            >
              返回列表
            </Button>
            <h2>{roomData.title}</h2>
            <div className="room-info">
              <Tag color="red">直播中</Tag>
              <span><UserOutlined /> {roomData.viewer_count} 人观看</span>
              {connected && <Tag color="green">已连接</Tag>}
              {!connected && <Tag color="orange">连接中...</Tag>}
            </div>
          </div>

          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <div className="video-container">
                <video
                  controls
                  autoPlay
                  src={roomData.pull_url}
                  poster="https://picsum.photos/seed/live1/800/450"
                  style={{ width: '100%', borderRadius: 12 }}
                />
              </div>
              
              <Card className="teacher-card">
                <div className="teacher-info">
                  <Avatar 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1" 
                    size={56} 
                  />
                  <div>
                    <h3>{roomData.teacher}</h3>
                    <p>高级讲师 · Python专家</p>
                  </div>
                  <Button type="primary" icon={<LikeOutlined />}>
                    关注
                  </Button>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="chat-card" title="直播互动">
                <div className="chat-messages">
                  <List
                    dataSource={messages}
                    renderItem={(item) => (
                      <List.Item className={`chat-item ${item.type}`}>
                        {item.type === 'system' ? (
                          <div className="system-message">{item.content}</div>
                        ) : (
                          <div className="user-message">
                            <Avatar src={item.avatar} size={32} />
                            <div className="message-content">
                              <span className="username">{item.user}</span>
                              <span className="text">{item.content}</span>
                            </div>
                          </div>
                        )}
                      </List.Item>
                    )}
                  />
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input">
                  <Input
                    placeholder={isAuthenticated ? "说点什么..." : "请登录后发言"}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onPressEnter={handleSendMessage}
                    disabled={!isAuthenticated}
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!isAuthenticated}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}

export default LiveRoom
