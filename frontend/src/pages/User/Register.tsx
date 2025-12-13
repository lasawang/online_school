import { useState } from 'react'
import { Layout, Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/auth'
import './Register.css'

const { Content } = Layout
const { Title, Text } = Typography

function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        phone: values.phone
      })
      message.success('注册成功！请登录')
      navigate('/login')
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || '注册失败，请稍后重试'
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout className="register-layout">
      <Content className="register-content">
        <div className="register-left">
          <div className="register-illustration">
            <div className="illustration-circle"></div>
            <div className="illustration-text">
              <h2>加入我们</h2>
              <h1>IT学习平台</h1>
              <p>与万千学员一起成长</p>
            </div>
          </div>
        </div>
        <div className="register-right">
          <Card className="register-card">
            <div className="register-logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">IT学习平台</span>
            </div>
            <Title level={2} className="register-title">用户注册</Title>
            <Text className="register-subtitle">创建您的学习账号</Text>
            
            <Form onFinish={onFinish} autoComplete="off" layout="vertical" className="register-form">
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名!' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
              </Form.Item>
              <Form.Item
                name="full_name"
                label="姓名"
              >
                <Input prefix={<UserOutlined />} placeholder="请输入真实姓名（选填）" size="large" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="手机号"
              >
                <Input prefix={<PhoneOutlined />} placeholder="请输入手机号（选填）" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码!' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
              </Form.Item>
              <Form.Item
                name="confirm"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致!'))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" size="large" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large"
                  loading={loading}
                  className="register-btn"
                >
                  {loading ? '注册中...' : '注册'}
                </Button>
              </Form.Item>
              <div className="register-footer">
                已有账号？ <a onClick={() => navigate('/login')}>立即登录</a>
              </div>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

export default Register
