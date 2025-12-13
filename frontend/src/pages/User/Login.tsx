import { useState } from 'react'
import { Layout, Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authApi } from '../../services/auth'
import { setCredentials } from '../../store/slices/authSlice'
import './Login.css'

const { Content } = Layout
const { Title, Text } = Typography

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const response: any = await authApi.login(values)
      dispatch(setCredentials({
        user: response.user,
        token: response.access_token
      }))
      message.success('登录成功！')
      navigate('/')
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || '登录失败，请检查用户名和密码'
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout className="login-layout">
      <Content className="login-content">
        <div className="login-left">
          <div className="login-illustration">
            <div className="illustration-circle"></div>
            <div className="illustration-text">
              <h2>欢迎来到</h2>
              <h1>IT学习平台</h1>
              <p>开启你的编程学习之旅</p>
            </div>
          </div>
        </div>
        <div className="login-right">
          <Card className="login-card">
            <div className="login-logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">IT学习平台</span>
            </div>
            <Title level={2} className="login-title">用户登录</Title>
            <Text className="login-subtitle">请输入您的账号信息</Text>
            
            <Form onFinish={onFinish} autoComplete="off" layout="vertical" className="login-form">
              <Form.Item
                name="username"
                label="用户名/邮箱"
                rules={[{ required: true, message: '请输入用户名或邮箱!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入用户名或邮箱" 
                  size="large" 
                />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请输入密码" 
                  size="large" 
                />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large"
                  loading={loading}
                  className="login-btn"
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>
              <div className="login-footer">
                还没有账号？ <a onClick={() => navigate('/register')}>立即注册</a>
              </div>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

export default Login
