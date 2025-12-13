import { useState, useEffect } from 'react'
import { Layout, Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Tabs, Spin } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  LockOutlined,
  SaveOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setCredentials } from '../../store/slices/authSlice'
import { uploadApi } from '../../services/upload'
import { getImageUrl } from '../../utils/url'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import './Profile.css'

const { Content } = Layout

function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [pageLoading, setPageLoading] = useState(true)

  // 检查登录状态
  useEffect(() => {
    // 给Redux状态一点时间加载
    const timer = setTimeout(() => {
      setPageLoading(false)
      if (!isAuthenticated || !user) {
        message.warning('请先登录')
        navigate('/login')
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, navigate])

  if (pageLoading) {
    return (
      <Layout className="main-layout" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </Layout>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const handleUpdateProfile = async (values: any) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 更新Redux状态
      dispatch(setCredentials({
        user: { ...user, ...values },
        token: token!
      }))
      
      message.success('个人信息更新成功')
    } catch (error) {
      message.error('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (_values: any) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      message.error('密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    setUploading(true)
    try {
      const response: any = await uploadApi.uploadImage(file)

      // 更新用户头像
      dispatch(setCredentials({
        user: { ...user, avatar: response.url },
        token: token!
      }))

      message.success('头像上传成功')
      return false
    } catch (error) {
      message.error('头像上传失败')
      return false
    } finally {
      setUploading(false)
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: '基本信息',
      children: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            username: user.username,
            email: user.email,
            full_name: user.full_name || '',
            phone: '',
          }}
          onFinish={handleUpdateProfile}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="full_name" label="真实姓名">
                <Input prefix={<UserOutlined />} placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="手机号">
                <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header />
        <Content className="profile-content">
          <div className="profile-header">
            <h1><UserOutlined /> 个人中心</h1>
            <p>管理您的账户信息</p>
          </div>

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Card className="avatar-card">
                <div className="avatar-section">
                  <div className="avatar-wrapper">
                    <Avatar
                      size={120}
                      src={getImageUrl(user.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    >
                      {user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Upload
                      showUploadList={false}
                      beforeUpload={handleAvatarUpload}
                      accept="image/*"
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={uploading ? <LoadingOutlined /> : <CameraOutlined />}
                        className="upload-btn"
                        loading={uploading}
                      />
                    </Upload>
                  </div>
                  <h2>{user.full_name || user.username}</h2>
                  <p>{user.email}</p>
                  <div className="role-tag">
                    {user.role === 'ADMIN' ? '管理员' : user.role === 'TEACHER' ? '讲师' : '学员'}
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card className="info-card">
                <Tabs items={tabItems} />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Profile
