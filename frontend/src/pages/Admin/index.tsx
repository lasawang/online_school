import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Row, Col, Statistic, Table, Button, message, Modal, Form, Input, Select, Tag, Popconfirm, Switch, Divider, Tabs } from 'antd'
import CourseChapterManager from '../../components/CourseChapterManager'
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import { courseApi } from '../../services/course'
import { settingsApi } from '../../services/settings'
import api from '../../services/api'
import './index.css'

const { Content, Sider } = Layout

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [liveModalVisible, setLiveModalVisible] = useState(false)
  const [courseModalVisible, setCourseModalVisible] = useState(false)
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [courseModalTab, setCourseModalTab] = useState('basic')
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [lives, setLives] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [editingItem, setEditingItem] = useState<any>(null)
  const [form] = Form.useForm()
  const [liveForm] = Form.useForm()
  const [courseForm] = Form.useForm()
  const [userForm] = Form.useForm()
  const [settingsForm] = Form.useForm()
  const [statsData, setStatsData] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'IT学习平台',
    siteDescription: '专业的IT在线学习平台',
    enableRegistration: true,
    enableComments: true,
    enableNotifications: true,
    maintenanceMode: false,
  })

  // 检查权限
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'TEACHER')) {
    message.warning('您没有权限访问管理后台')
    navigate('/')
    return null
  }

  // 获取数据
  useEffect(() => {
    if (selectedKey === 'dashboard') {
      fetchDashboardStats()
    } else if (selectedKey === 'categories') {
      fetchCategories()
    } else if (selectedKey === 'lives') {
      fetchLives()
    } else if (selectedKey === 'courses') {
      fetchCourses()
    } else if (selectedKey === 'users' && user?.role === 'ADMIN') {
      fetchUsers()
    } else if (selectedKey === 'stats') {
      fetchStats()
    } else if (selectedKey === 'settings' && user?.role === 'ADMIN') {
      fetchSettings()
    }
  }, [selectedKey])

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, coursesRes, livesRes]: any = await Promise.all([
        api.get('/api/v1/auth/users', { params: { page: 1, page_size: 1 } }),
        courseApi.getCourses({ page: 1, page_size: 1 }),
        api.get('/api/v1/lives', { params: { page: 1, page_size: 1 } })
      ])

      setDashboardStats({
        totalUsers: usersRes.total || 0,
        totalCourses: coursesRes.total || 0,
        totalLives: livesRes.total || 0,
        todayViews: 3580 // 这个需要后端添加统计API
      })
    } catch (error) {
      console.error('获取控制台统计失败:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response: any = await courseApi.getCourses({ page: 1, page_size: 100, status: undefined })
      setCourses(response.items || [])
    } catch (error) {
      console.error('获取课程失败:', error)
    }
  }

  const fetchStats = async () => {
    try {
      // 获取学习统计
      const learningStats: any = await api.get('/api/v1/learning/stats')

      // 获取课程统计
      const coursesResponse: any = await courseApi.getCourses({ page: 1, page_size: 100 })

      // 模拟一些额外的统计数据
      setStatsData({
        learningStats,
        totalCourses: coursesResponse.total || 0,
        totalUsers: 1256, // 从用户API获取
        totalLives: lives.length,
        weeklyNewUsers: 128,
        weeklyActiveCourses: 35,
        popularCourses: coursesResponse.items?.slice(0, 5) || [],
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response: any = await settingsApi.getSettings()
      setSystemSettings(response)
      settingsForm.setFieldsValue(response)
    } catch (error) {
      console.error('获取系统设置失败:', error)
      message.error('获取系统设置失败')
    }
  }

  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields()
      setLoading(true)

      await settingsApi.updateSettings(values)
      setSystemSettings({ ...systemSettings, ...values })
      message.success('设置保存成功')
    } catch (error: any) {
      message.error(error.response?.data?.detail || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response: any = await api.get('/api/v1/categories')
      setCategories(response || [])
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchLives = async () => {
    try {
      const response: any = await api.get('/api/v1/lives', { params: { page: 1, page_size: 100 } })
      setLives(response.items || [])
    } catch (error) {
      console.error('获取直播失败:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response: any = await api.get('/api/v1/auth/users', { params: { page: 1, page_size: 100 } })
      setUsers(response.items || [])
    } catch (error) {
      console.error('获取用户失败:', error)
    }
  }

  // 分类管理操作
  const handleAddCategory = () => {
    setEditingItem(null)
    form.resetFields()
    setCategoryModalVisible(true)
  }

  const handleEditCategory = (item: any) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setCategoryModalVisible(true)
  }

  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (editingItem) {
        await api.put(`/api/v1/categories/${editingItem.id}`, values)
        message.success('分类更新成功')
      } else {
        await api.post('/api/v1/categories', values)
        message.success('分类创建成功')
      }

      setCategoryModalVisible(false)
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.delete(`/api/v1/categories/${id}`)
      message.success('删除成功')
      fetchCategories()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  // 直播管理操作
  const handleAddLive = () => {
    setEditingItem(null)
    liveForm.resetFields()
    setLiveModalVisible(true)
  }

  const handleEditLive = (item: any) => {
    setEditingItem(item)
    liveForm.setFieldsValue(item)
    setLiveModalVisible(true)
  }

  const handleSaveLive = async () => {
    try {
      const values = await liveForm.validateFields()
      setLoading(true)

      if (editingItem) {
        await api.put(`/api/v1/lives/${editingItem.id}`, values)
        message.success('直播更新成功')
      } else {
        await api.post('/api/v1/lives', values)
        message.success('直播创建成功')
      }

      setLiveModalVisible(false)
      fetchLives()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLive = async (id: number) => {
    try {
      await api.delete(`/api/v1/lives/${id}`)
      message.success('删除成功')
      fetchLives()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  // 课程管理操作
  const handleAddCourse = async () => {
    setEditingItem(null)
    courseForm.resetFields()
    // 确保加载了分类数据
    if (categories.length === 0) {
      await fetchCategories()
    }
    setCourseModalVisible(true)
  }

  const handleEditCourse = (item: any) => {
    setEditingItem(item)
    setCurrentCourseId(item.id)
    courseForm.setFieldsValue(item)
    setCourseModalTab('basic')
    setCourseModalVisible(true)
  }

  const handleSaveCourse = async () => {
    try {
      const values = await courseForm.validateFields()
      setLoading(true)

      if (editingItem) {
        await courseApi.updateCourse(editingItem.id, values)
        message.success('课程更新成功')
        setCurrentCourseId(editingItem.id)
      } else {
        const response: any = await courseApi.createCourse(values)
        message.success('课程创建成功，现在可以添加章节了')
        setCurrentCourseId(response.id)
        setEditingItem(response)
        // 切换到章节管理tab
        setCourseModalTab('chapters')
      }

      fetchCourses()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (id: number) => {
    try {
      await courseApi.deleteCourse(id)
      message.success('删除成功')
      fetchCourses()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  // 用户管理操作
  const handleEditUser = (item: any) => {
    setEditingItem(item)
    userForm.setFieldsValue({ role: item.role, is_active: item.is_active })
    setUserModalVisible(true)
  }

  const handleSaveUser = async () => {
    try {
      const values = await userForm.validateFields()
      setLoading(true)

      // 更新角色
      if (values.role !== editingItem.role) {
        await api.put(`/api/v1/auth/users/${editingItem.id}/role`, { role: values.role })
      }

      // 更新状态
      if (values.is_active !== editingItem.is_active) {
        await api.put(`/api/v1/auth/users/${editingItem.id}/status`, { is_active: values.is_active })
      }

      message.success('用户信息更新成功')
      setUserModalVisible(false)
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '控制台' },
    { key: 'courses', icon: <BookOutlined />, label: '课程管理' },
    { key: 'users', icon: <TeamOutlined />, label: '用户管理', disabled: user?.role !== 'ADMIN' },
    { key: 'lives', icon: <VideoCameraOutlined />, label: '直播管理' },
    { key: 'categories', icon: <FileTextOutlined />, label: '分类管理' },
    { key: 'stats', icon: <BarChartOutlined />, label: '数据统计' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置', disabled: user?.role !== 'ADMIN' },
  ]

  const courseColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '课程名称', dataIndex: 'title', key: 'title' },
    { title: '分类', dataIndex: 'category_name', key: 'category_name' },
    { title: '讲师', dataIndex: 'teacher_name', key: 'teacher_name' },
    { title: '学员数', dataIndex: 'student_count', key: 'student_count' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (price: number) => `¥${price}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'PUBLISHED' ? 'green' : status === 'DRAFT' ? 'orange' : 'red'}>
          {status === 'PUBLISHED' ? '已发布' : status === 'DRAFT' ? '草稿' : '下架'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: any) => (
        <>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditCourse(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteCourse(record.id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      )
    }
  ]

  return (
    <Layout className="admin-layout">
      <Sider width={220} className="admin-sider">
        <div className="admin-logo">
          <span>📚</span>
          <span>管理后台</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Header />
        <Content className="admin-content">
          {selectedKey === 'dashboard' && (
            <>
              <h2>控制台</h2>
              <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="总用户数"
                      value={dashboardStats?.totalUsers || 0}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#1935CA' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="课程数量"
                      value={dashboardStats?.totalCourses || 0}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#6FD181' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="直播场次"
                      value={dashboardStats?.totalLives || 0}
                      prefix={<VideoCameraOutlined />}
                      valueStyle={{ color: '#FF7262' }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="今日访问"
                      value={dashboardStats?.todayViews || 0}
                      prefix={<BarChartOutlined />}
                      valueStyle={{ color: '#FFB800' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="最近课程" extra={<Button type="link" onClick={() => setSelectedKey('courses')}>查看全部</Button>}>
                <Table
                  dataSource={courses.slice(0, 5)}
                  columns={courseColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </>
          )}

          {selectedKey === 'courses' && (
            <>
              <h2>课程管理</h2>
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCourse}>
                    新建课程
                  </Button>
                </div>
                <Table
                  dataSource={courses}
                  columns={courseColumns}
                  rowKey="id"
                />
              </Card>
            </>
          )}

          {selectedKey === 'users' && user?.role === 'ADMIN' && (
            <>
              <h2>用户管理</h2>
              <Card>
                <Table
                  dataSource={users}
                  rowKey="id"
                  columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
                    { title: '用户名', dataIndex: 'username', key: 'username' },
                    { title: '邮箱', dataIndex: 'email', key: 'email' },
                    { title: '姓名', dataIndex: 'full_name', key: 'full_name' },
                    {
                      title: '角色',
                      dataIndex: 'role',
                      key: 'role',
                      render: (role: string) => (
                        <Tag color={role === 'ADMIN' ? 'red' : role === 'TEACHER' ? 'blue' : 'default'}>
                          {role === 'ADMIN' ? '管理员' : role === 'TEACHER' ? '讲师' : '学员'}
                        </Tag>
                      )
                    },
                    {
                      title: '状态',
                      dataIndex: 'is_active',
                      key: 'is_active',
                      render: (is_active: boolean) => (
                        <Tag color={is_active ? 'green' : 'red'}>
                          {is_active ? '正常' : '禁用'}
                        </Tag>
                      )
                    },
                    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString() },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_: any, record: any) => (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
                          编辑
                        </Button>
                      )
                    }
                  ]}
                />
              </Card>
            </>
          )}

          {selectedKey === 'categories' && (
            <>
              <h2>分类管理</h2>
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                    新建分类
                  </Button>
                </div>
                <Table
                  dataSource={categories}
                  rowKey="id"
                  columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
                    { title: '分类名称', dataIndex: 'name', key: 'name' },
                    { title: '描述', dataIndex: 'description', key: 'description' },
                    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
                    {
                      title: '操作',
                      key: 'action',
                      width: 150,
                      render: (_, record: any) => (
                        <>
                          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
                            编辑
                          </Button>
                          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteCategory(record.id)}>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>
                        </>
                      )
                    }
                  ]}
                />
              </Card>
            </>
          )}

          {selectedKey === 'lives' && (
            <>
              <h2>直播管理</h2>
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLive}>
                    创建直播
                  </Button>
                </div>
                <Table
                  dataSource={lives}
                  rowKey="id"
                  columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
                    { title: '直播标题', dataIndex: 'title', key: 'title' },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={status === 'LIVING' ? 'red' : status === 'NOT_STARTED' ? 'blue' : 'default'}>
                          {status === 'LIVING' ? '直播中' : status === 'NOT_STARTED' ? '未开始' : '已结束'}
                        </Tag>
                      )
                    },
                    { title: '开始时间', dataIndex: 'start_time', key: 'start_time', render: (date: string) => new Date(date).toLocaleString() },
                    {
                      title: '操作',
                      key: 'action',
                      width: 150,
                      render: (_, record: any) => (
                        <>
                          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditLive(record)}>
                            编辑
                          </Button>
                          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteLive(record.id)}>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>
                        </>
                      )
                    }
                  ]}
                />
              </Card>
            </>
          )}

          {selectedKey === 'stats' && (
            <>
              <h2>数据统计</h2>

              {/* 核心指标 */}
              <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="总用户数"
                      value={statsData?.totalUsers || 0}
                      prefix={<TeamOutlined />}
                      suffix={
                        <span style={{ fontSize: 14, color: '#52c41a' }}>
                          <RiseOutlined /> +{statsData?.weeklyNewUsers || 0}
                        </span>
                      }
                      valueStyle={{ color: '#1935CA' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>本周新增</div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="课程总数"
                      value={statsData?.totalCourses || 0}
                      prefix={<BookOutlined />}
                      suffix={
                        <span style={{ fontSize: 14, color: '#52c41a' }}>
                          <RiseOutlined /> +{statsData?.weeklyActiveCourses || 0}
                        </span>
                      }
                      valueStyle={{ color: '#6FD181' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>本周活跃</div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="学习时长"
                      value={statsData?.learningStats?.total_learning_hours || 0}
                      suffix="小时"
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#FFB800' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>累计学习</div>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card>
                    <Statistic
                      title="完成小节"
                      value={statsData?.learningStats?.completed_sections || 0}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#FF7262' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>总完成数</div>
                  </Card>
                </Col>
              </Row>

              {/* 趋势图表区 */}
              <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
                <Col xs={24} lg={12}>
                  <Card title={<><LineChartOutlined /> 用户增长趋势</>}>
                    <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>
                      <BarChartOutlined style={{ fontSize: 48, color: '#1935CA', marginBottom: 16 }} />
                      <p style={{ color: '#999' }}>用户增长趋势图</p>
                      <p style={{ fontSize: 12, color: '#ccc' }}>（图表数据可视化组件）</p>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title={<><PieChartOutlined /> 课程分类分布</>}>
                    <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>
                      <PieChartOutlined style={{ fontSize: 48, color: '#6FD181', marginBottom: 16 }} />
                      <p style={{ color: '#999' }}>课程分类占比</p>
                      <p style={{ fontSize: 12, color: '#ccc' }}>（饼图可视化组件）</p>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* 热门课程排行 */}
              <Card title="热门课程排行" extra={<Button type="link">查看全部</Button>}>
                <Table
                  dataSource={statsData?.popularCourses || []}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '排名', key: 'rank', width: 60, render: (_, __, index) => index + 1 },
                    { title: '课程名称', dataIndex: 'title', key: 'title' },
                    {
                      title: '学员数',
                      dataIndex: 'student_count',
                      key: 'student_count',
                      sorter: (a, b) => Number((a as any)?.student_count ?? 0) - Number((b as any)?.student_count ?? 0),
                      render: (value: number | string) => Number(value ?? 0),
                    },
                    {
                      title: '评分',
                      dataIndex: 'rating',
                      key: 'rating',
                      render: (rating: number | string) => `${Number(rating ?? 0).toFixed(1)} ⭐`,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
                          {status === 'PUBLISHED' ? '已发布' : '草稿'}
                        </Tag>
                      )
                    },
                  ]}
                />
              </Card>
            </>
          )}

          {selectedKey === 'settings' && user?.role === 'ADMIN' && (
            <>
              <h2>系统设置</h2>

              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card title="基本设置" style={{ marginBottom: 24 }}>
                    <Form
                      form={settingsForm}
                      layout="vertical"
                      initialValues={systemSettings}
                      onFinish={handleSaveSettings}
                    >
                      <Form.Item name="siteName" label="网站名称" rules={[{ required: true, message: '请输入网站名称' }]}>
                        <Input placeholder="请输入网站名称" />
                      </Form.Item>

                      <Form.Item name="siteDescription" label="网站描述">
                        <Input.TextArea rows={3} placeholder="请输入网站描述" />
                      </Form.Item>

                      <Divider />

                      <Form.Item label="功能开关">
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item name="enableRegistration" valuePropName="checked" style={{ marginBottom: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>允许用户注册</span>
                                <Switch />
                              </div>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="enableComments" valuePropName="checked" style={{ marginBottom: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>允许评论</span>
                                <Switch />
                              </div>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="enableNotifications" valuePropName="checked" style={{ marginBottom: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>启用通知</span>
                                <Switch />
                              </div>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="maintenanceMode" valuePropName="checked" style={{ marginBottom: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>维护模式</span>
                                <Switch />
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form.Item>

                      <Divider />

                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          保存设置
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => settingsForm.resetFields()}>
                          重置
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card title="系统信息">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <div style={{ padding: '12px 0' }}>
                          <div style={{ color: '#999', fontSize: 12 }}>系统版本</div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>v1.0.0</div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ padding: '12px 0' }}>
                          <div style={{ color: '#999', fontSize: 12 }}>数据库</div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>MySQL 8.0</div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ padding: '12px 0' }}>
                          <div style={{ color: '#999', fontSize: 12 }}>后端框架</div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>FastAPI</div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ padding: '12px 0' }}>
                          <div style={{ color: '#999', fontSize: 12 }}>前端框架</div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>React 18</div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card title="快捷操作" style={{ marginBottom: 24 }}>
                    <Button block style={{ marginBottom: 12 }}>
                      <DatabaseOutlined /> 清理缓存
                    </Button>
                    <Button block style={{ marginBottom: 12 }}>
                      <ExportOutlined /> 导出数据
                    </Button>
                    <Button block style={{ marginBottom: 12 }}>
                      <ImportOutlined /> 导入数据
                    </Button>
                    <Button block danger>
                      <DeleteOutlined /> 清空日志
                    </Button>
                  </Card>

                  <Card title="系统状态">
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>CPU使用率</span>
                        <span style={{ color: '#52c41a' }}>25%</span>
                      </div>
                      <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '25%', height: '100%', background: '#52c41a' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>内存使用</span>
                        <span style={{ color: '#1890ff' }}>60%</span>
                      </div>
                      <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '60%', height: '100%', background: '#1890ff' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>磁盘空间</span>
                        <span style={{ color: '#faad14' }}>75%</span>
                      </div>
                      <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '75%', height: '100%', background: '#faad14' }} />
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Content>

        {/* 分类管理Modal */}
        <Modal
          title={editingItem ? '编辑分类' : '新建分类'}
          open={categoryModalVisible}
          onOk={handleSaveCategory}
          onCancel={() => setCategoryModalVisible(false)}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
              <Input placeholder="请输入分类名称" />
            </Form.Item>
            <Form.Item name="description" label="分类描述">
              <Input.TextArea rows={3} placeholder="请输入分类描述" />
            </Form.Item>
            <Form.Item name="sort_order" label="排序" initialValue={0}>
              <Input type="number" placeholder="数字越小越靠前" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 直播管理Modal */}
        <Modal
          title={editingItem ? '编辑直播' : '创建直播'}
          open={liveModalVisible}
          onOk={handleSaveLive}
          onCancel={() => setLiveModalVisible(false)}
          confirmLoading={loading}
          width={600}
        >
          <Form form={liveForm} layout="vertical">
            <Form.Item name="title" label="直播标题" rules={[{ required: true, message: '请输入直播标题' }]}>
              <Input placeholder="请输入直播标题" />
            </Form.Item>
            <Form.Item name="description" label="直播描述">
              <Input.TextArea rows={3} placeholder="请输入直播描述" />
            </Form.Item>
            <Form.Item name="cover_image" label="封面图片">
              <Input placeholder="请输入封面图片URL" />
            </Form.Item>
            <Form.Item name="start_time" label="开始时间" rules={[{ required: true, message: '请选择开始时间' }]}>
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="NOT_STARTED">
              <Select>
                <Select.Option value="NOT_STARTED">未开始</Select.Option>
                <Select.Option value="LIVING">直播中</Select.Option>
                <Select.Option value="FINISHED">已结束</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* 课程管理Modal */}
        <Modal
          title={editingItem ? '编辑课程' : '新建课程'}
          open={courseModalVisible}
          onOk={courseModalTab === 'basic' ? handleSaveCourse : undefined}
          onCancel={() => {
            setCourseModalVisible(false)
            setCurrentCourseId(null)
            setCourseModalTab('basic')
          }}
          confirmLoading={loading}
          footer={courseModalTab === 'chapters' ? null : undefined}
          width={courseModalTab === 'chapters' ? 900 : 700}
        >
          <Tabs activeKey={courseModalTab} onChange={setCourseModalTab}>
            <Tabs.TabPane tab="基本信息" key="basic">
              <Form form={courseForm} layout="vertical">
                <Form.Item name="title" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
                  <Input placeholder="请输入课程名称" />
                </Form.Item>
                <Form.Item name="description" label="课程描述" rules={[{ required: true, message: '请输入课程描述' }]}>
                  <Input.TextArea rows={4} placeholder="请输入课程描述" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="category_id" label="课程分类" rules={[{ required: true, message: '请选择课程分类' }]}>
                      <Select placeholder="请选择分类">
                        {categories.map(cat => (
                          <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="level" label="课程难度" initialValue="BEGINNER">
                      <Select>
                        <Select.Option value="BEGINNER">入门</Select.Option>
                        <Select.Option value="INTERMEDIATE">进阶</Select.Option>
                        <Select.Option value="ADVANCED">高级</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="price" label="现价" rules={[{ required: true, message: '请输入价格' }]}>
                      <Input type="number" prefix="¥" placeholder="0.00" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="original_price" label="原价">
                      <Input type="number" prefix="¥" placeholder="0.00" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="cover_image" label="封面图片">
                  <Input placeholder="请输入封面图片URL" />
                </Form.Item>
                <Form.Item name="status" label="发布状态" initialValue="DRAFT">
                  <Select>
                    <Select.Option value="DRAFT">草稿</Select.Option>
                    <Select.Option value="PUBLISHED">已发布</Select.Option>
                    <Select.Option value="OFFLINE">已下架</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab="章节管理" key="chapters" disabled={!currentCourseId}>
              <CourseChapterManager courseId={currentCourseId} />
            </Tabs.TabPane>
          </Tabs>
        </Modal>

        {/* 用户管理Modal */}
        <Modal
          title="编辑用户"
          open={userModalVisible}
          onOk={handleSaveUser}
          onCancel={() => setUserModalVisible(false)}
          confirmLoading={loading}
        >
          <Form form={userForm} layout="vertical">
            <Form.Item label="用户信息">
              <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                <p><strong>用户名：</strong>{editingItem?.username}</p>
                <p><strong>邮箱：</strong>{editingItem?.email}</p>
                <p style={{ marginBottom: 0 }}><strong>姓名：</strong>{editingItem?.full_name || '-'}</p>
              </div>
            </Form.Item>
            <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select>
                <Select.Option value="STUDENT">学员</Select.Option>
                <Select.Option value="TEACHER">讲师</Select.Option>
                <Select.Option value="ADMIN">管理员</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="is_active" label="账户状态" valuePropName="checked">
              <Switch checkedChildren="正常" unCheckedChildren="禁用" />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  )
}

export default AdminDashboard
