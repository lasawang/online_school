import { useState, useEffect } from 'react'
import { 
  Layout, Menu, Card, Row, Col, Statistic, Table, Button, message, 
  Modal, Form, Input, Select, Tag, Popconfirm, Switch, DatePicker,
  Space, Avatar, Badge, Tooltip, Checkbox
} from 'antd'
import {
  DashboardOutlined, BookOutlined, UserOutlined, VideoCameraOutlined,
  SettingOutlined, FileTextOutlined, BarChartOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  TeamOutlined, RiseOutlined, FallOutlined
} from '@ant-design/icons'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import CourseChapterManager from '../../components/CourseChapterManager'
import { courseApi } from '../../services/course'
import { settingsApi } from '../../services/settings'
import api from '../../services/api'
import dayjs from 'dayjs'
import './index.css'

const { Content, Sider } = Layout
const { Option } = Select
const { TextArea } = Input

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function AdminComplete() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  
  // 模态框
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [liveModalVisible, setLiveModalVisible] = useState(false)
  const [courseModalVisible, setCourseModalVisible] = useState(false)
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [chapterModalVisible, setChapterModalVisible] = useState(false)
  
  // 数据
  const [categories, setCategories] = useState<any[]>([])
  const [lives, setLives] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [systemSettings, setSystemSettings] = useState<any>({})
  
  // 编辑项
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null)
  
  // 批量选择
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([])
  
  // 表单
  const [form] = Form.useForm()
  const [liveForm] = Form.useForm()
  const [courseForm] = Form.useForm()
  const [userForm] = Form.useForm()
  const [settingsForm] = Form.useForm()

  // 权限检查
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'TEACHER')) {
    message.warning('您没有权限访问管理后台')
    navigate('/')
    return null
  }

  useEffect(() => {
    switch(selectedKey) {
      case 'dashboard': fetchDashboardStats(); break
      case 'courses': fetchCourses(); fetchCategories(); break
      case 'users': if (user?.role === 'ADMIN') fetchUsers(); break
      case 'lives': fetchLives(); fetchCourses(); break
      case 'categories': fetchCategories(); break
      case 'stats': fetchDetailedStats(); break
      case 'settings': if (user?.role === 'ADMIN') fetchSettings(); break
    }
  }, [selectedKey])

  // ==================== 数据获取 ====================
  
  const fetchDashboardStats = async () => {
    try {
      const stats: any = await api.get('/api/v1/admin/stats')
      
      // 模拟图表数据
      const userGrowthData = [
        { month: '1月', users: 120 },
        { month: '2月', users: 180 },
        { month: '3月', users: 220 },
        { month: '4月', users: 280 },
        { month: '5月', users: 350 },
        { month: '6月', users: stats.total_users || 400 }
      ]
      
      const courseDistribution = [
        { name: '已发布', value: stats.published_courses || 0 },
        { name: '草稿', value: (stats.total_courses - stats.published_courses) || 0 }
      ]
      
      setDashboardStats({
        ...stats,
        userGrowthData,
        courseDistribution
      })
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      // 管理后台需要获取所有状态的课程（包括草稿），使用show_all=true参数
      const response: any = await api.get('/api/v1/courses', { 
        params: { page: 1, page_size: 100, show_all: true } 
      })
      setCourses(response.items || [])
    } catch (error) {
      console.error('获取课程失败:', error)
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

  const fetchDetailedStats = async () => {
    try {
      const stats: any = await api.get('/api/v1/admin/stats')
      const coursesResponse: any = await courseApi.getCourses({ page: 1, page_size: 100 })
      
      // 模拟课程热度数据
      const popularCourses = coursesResponse.items?.slice(0, 5).map((c: any) => ({
        name: c.title.substring(0, 10) + '...',
        students: c.student_count || 0
      })) || []
      
      setDashboardStats({
        ...stats,
        popularCourses
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
      console.error('获取设置失败:', error)
    }
  }

  // ==================== 分类管理 ====================
  
  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      if (editingItem) {
        await api.put(`/api/v1/categories/${editingItem.id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/api/v1/categories', values)
        message.success('创建成功')
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

  // ==================== 课程管理 ====================
  
  const handleSaveCourse = async () => {
    try {
      const values = await courseForm.validateFields()
      setLoading(true)
      if (editingItem) {
        await courseApi.updateCourse(editingItem.id, values)
        message.success('更新成功')
      } else {
        await courseApi.createCourse(values)
        message.success('创建成功')
      }
      setCourseModalVisible(false)
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

  const handleManageChapters = (courseId: number) => {
    setCurrentCourseId(courseId)
    setChapterModalVisible(true)
  }

  // ==================== 用户管理 ====================
  
  const handleUpdateUserRole = async (userId: number, role: string) => {
    try {
      await api.put(`/api/v1/auth/users/${userId}/role`, { role })
      message.success('角色更新成功')
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '更新失败')
    }
  }

  const handleUpdateUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await api.put(`/api/v1/auth/users/${userId}/status`, { is_active: isActive })
      message.success('状态更新成功')
      fetchUsers()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '更新失败')
    }
  }

  // ==================== 直播管理 ====================
  
  const handleSaveLive = async () => {
    try {
      const values = await liveForm.validateFields()
      setLoading(true)
      
      // 格式化时间
      if (values.scheduled_time) {
        values.scheduled_time = dayjs(values.scheduled_time).format('YYYY-MM-DDTHH:mm:ss')
      }
      
      if (editingItem) {
        await api.put(`/api/v1/lives/${editingItem.id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/api/v1/lives', values)
        message.success('创建成功')
      }
      setLiveModalVisible(false)
      fetchLives()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLiveStatus = async (liveId: number, status: string) => {
    try {
      await api.put(`/api/v1/lives/${liveId}`, { status })
      message.success('状态更新成功')
      fetchLives()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '更新失败')
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

  // ==================== 批量操作 ====================
  
  const handleBatchDelete = async (type: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的项')
      return
    }
    
    try {
      setLoading(true)
      const deletePromises = selectedRowKeys.map(id => {
        switch(type) {
          case 'courses': return courseApi.deleteCourse(id)
          case 'categories': return api.delete(`/api/v1/categories/${id}`)
          case 'lives': return api.delete(`/api/v1/lives/${id}`)
          default: return Promise.resolve()
        }
      })
      
      await Promise.all(deletePromises)
      message.success(`成功删除 ${selectedRowKeys.length} 项`)
      setSelectedRowKeys([])
      
      // 刷新数据
      switch(type) {
        case 'courses': fetchCourses(); break
        case 'categories': fetchCategories(); break
        case 'lives': fetchLives(); break
      }
    } catch (error: any) {
      message.error('批量删除失败')
    } finally {
      setLoading(false)
    }
  }

  // ==================== 系统设置 ====================
  
  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields()
      setLoading(true)
      await settingsApi.updateSettings(values)
      message.success('设置保存成功')
      setSystemSettings(values)
    } catch (error: any) {
      message.error(error.response?.data?.detail || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  // ==================== 渲染函数 ====================

  const renderDashboard = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={dashboardStats?.total_users || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总课程数"
              value={dashboardStats?.total_courses || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已发布课程"
              value={dashboardStats?.published_courses || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总报名数"
              value={dashboardStats?.total_enrollments || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="用户增长趋势" extra={<ReloadOutlined onClick={fetchDashboardStats} />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardStats?.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="课程状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardStats?.courseDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(dashboardStats?.courseDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const renderCourses = () => {
    const columns = [
      {
        title: '课程名称',
        dataIndex: 'title',
        key: 'title',
        width: 200
      },
      {
        title: '分类',
        dataIndex: 'category_name',
        key: 'category_name'
      },
      {
        title: '讲师',
        dataIndex: 'teacher_name',
        key: 'teacher_name'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
            {status === 'PUBLISHED' ? '已发布' : '草稿'}
          </Tag>
        )
      },
      {
        title: '学员数',
        dataIndex: 'student_count',
        key: 'student_count'
      },
      {
        title: '评分',
        dataIndex: 'rating',
        key: 'rating',
        render: (rating: string) => `${rating} ⭐`
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleManageChapters(record.id)}
            >
              章节
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record)
                courseForm.setFieldsValue(record)
                setCourseModalVisible(true)
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDeleteCourse(record.id)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ]

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys: any[]) => setSelectedRowKeys(keys)
    }

    return (
      <Card
        title="课程管理"
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 项吗？`}
                onConfirm={() => handleBatchDelete('courses')}
              >
                <Button danger>批量删除</Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={async () => {
                setEditingItem(null)
                courseForm.resetFields()
                if (categories.length === 0) await fetchCategories()
                setCourseModalVisible(true)
              }}
            >
              添加课程
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
        />
      </Card>
    )
  }

  const renderUsers = () => {
    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email'
      },
      {
        title: '姓名',
        dataIndex: 'full_name',
        key: 'full_name'
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        render: (role: string, record: any) => (
          <Select
            value={role}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateUserRole(record.id, value)}
            disabled={record.id === user?.id}
          >
            <Option value="STUDENT">学生</Option>
            <Option value="TEACHER">教师</Option>
            <Option value="ADMIN">管理员</Option>
          </Select>
        )
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (isActive: boolean, record: any) => (
          <Switch
            checked={isActive}
            onChange={(checked) => handleUpdateUserStatus(record.id, checked)}
            disabled={record.id === user?.id}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        )
      },
      {
        title: '注册时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (time: string) => dayjs(time).format('YYYY-MM-DD')
      }
    ]

    return (
      <Card title="用户管理" extra={<span>共 {users.length} 个用户</span>}>
        <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
      </Card>
    )
  }

  const renderLives = () => {
    const columns = [
      {
        title: '直播标题',
        dataIndex: 'title',
        key: 'title',
        width: 200
      },
      {
        title: '关联课程',
        dataIndex: 'course_id',
        key: 'course_id',
        render: (courseId: number) => {
          const course = courses.find(c => c.id === courseId)
          return course?.title || '-'
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string, record: any) => (
          <Select
            value={status}
            style={{ width: 120 }}
            onChange={(value) => handleUpdateLiveStatus(record.id, value)}
          >
            <Option value="scheduled">
              <Badge status="default" text="已安排" />
            </Option>
            <Option value="living">
              <Badge status="processing" text="直播中" />
            </Option>
            <Option value="ended">
              <Badge status="success" text="已结束" />
            </Option>
          </Select>
        )
      },
      {
        title: '观看人数',
        dataIndex: 'viewer_count',
        key: 'viewer_count'
      },
      {
        title: '计划时间',
        dataIndex: 'scheduled_time',
        key: 'scheduled_time',
        render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record)
                liveForm.setFieldsValue({
                  ...record,
                  scheduled_time: record.scheduled_time ? dayjs(record.scheduled_time) : null
                })
                setLiveModalVisible(true)
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDeleteLive(record.id)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ]

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys: any[]) => setSelectedRowKeys(keys)
    }

    return (
      <Card
        title="直播管理"
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 项吗？`}
                onConfirm={() => handleBatchDelete('lives')}
              >
                <Button danger>批量删除</Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={async () => {
                setEditingItem(null)
                liveForm.resetFields()
                if (courses.length === 0) await fetchCourses()
                setLiveModalVisible(true)
              }}
            >
              创建直播
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={lives}
          rowKey="id"
          loading={loading}
        />
      </Card>
    )
  }

  const renderCategories = () => {
    const columns = [
      {
        title: '分类名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: '课程数',
        key: 'course_count',
        render: (_: any, record: any) => {
          const count = courses.filter(c => c.category_id === record.id).length
          return count
        }
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD') : '-'
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record)
                form.setFieldsValue(record)
                setCategoryModalVisible(true)
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDeleteCategory(record.id)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ]

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys: any[]) => setSelectedRowKeys(keys)
    }

    return (
      <Card
        title="分类管理"
        extra={
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 项吗？`}
                onConfirm={() => handleBatchDelete('categories')}
              >
                <Button danger>批量删除</Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null)
                form.resetFields()
                setCategoryModalVisible(true)
              }}
            >
              添加分类
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
        />
      </Card>
    )
  }

  const renderStats = () => {
    if (!dashboardStats?.popularCourses) {
      fetchDetailedStats()
      return <Card loading />
    }

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="热门课程排行">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardStats.popularCourses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="学生用户" value={dashboardStats.total_students} suffix="人" />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="教师用户" value={dashboardStats.total_teachers} suffix="人" />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="课程报名" value={dashboardStats.total_enrollments} suffix="次" />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderSettings = () => (
    <Card title="系统设置">
      <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
        <Form.Item name="siteName" label="网站名称" rules={[{ required: true }]}>
          <Input placeholder="IT学习平台" />
        </Form.Item>
        <Form.Item name="siteDescription" label="网站描述">
          <TextArea rows={3} placeholder="专业的IT在线学习平台" />
        </Form.Item>
        <Form.Item name="enableRegistration" label="开放注册" valuePropName="checked">
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
        <Form.Item name="enableComments" label="允许评论" valuePropName="checked">
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
        <Form.Item name="enableNotifications" label="系统通知" valuePropName="checked">
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
        <Form.Item name="maintenanceMode" label="维护模式" valuePropName="checked">
          <Switch checkedChildren="维护中" unCheckedChildren="正常" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '控制台' },
    { key: 'courses', icon: <BookOutlined />, label: '课程管理' },
    ...(user?.role === 'ADMIN' ? [{ key: 'users', icon: <UserOutlined />, label: '用户管理' }] : []),
    { key: 'lives', icon: <VideoCameraOutlined />, label: '直播管理' },
    { key: 'categories', icon: <FileTextOutlined />, label: '分类管理' },
    { key: 'stats', icon: <BarChartOutlined />, label: '数据统计' },
    ...(user?.role === 'ADMIN' ? [{ key: 'settings', icon: <SettingOutlined />, label: '系统设置' }] : [])
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => {
              setSelectedKey(key)
              setSelectedRowKeys([])
            }}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {selectedKey === 'dashboard' && renderDashboard()}
            {selectedKey === 'courses' && renderCourses()}
            {selectedKey === 'users' && renderUsers()}
            {selectedKey === 'lives' && renderLives()}
            {selectedKey === 'categories' && renderCategories()}
            {selectedKey === 'stats' && renderStats()}
            {selectedKey === 'settings' && renderSettings()}
          </Content>
        </Layout>
      </Layout>

      {/* 分类模态框 */}
      <Modal
        title={editingItem ? '编辑分类' : '添加分类'}
        open={categoryModalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setCategoryModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 课程模态框 */}
      <Modal
        title={editingItem ? '编辑课程' : '创建课程'}
        open={courseModalVisible}
        onOk={handleSaveCourse}
        onCancel={() => setCourseModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={courseForm} layout="vertical">
          <Form.Item name="title" label="课程名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category_id" label="分类" rules={[{ required: true }]}>
            <Select placeholder="选择分类">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="课程描述">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <Input type="number" prefix="¥" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="DRAFT">草稿</Option>
              <Option value="PUBLISHED">已发布</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 直播模态框 */}
      <Modal
        title={editingItem ? '编辑直播' : '创建直播'}
        open={liveModalVisible}
        onOk={handleSaveLive}
        onCancel={() => setLiveModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={liveForm} layout="vertical">
          <Form.Item name="title" label="直播标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="course_id" label="关联课程">
            <Select placeholder="选择课程" allowClear>
              {courses.map(course => (
                <Option key={course.id} value={course.id}>{course.title}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="直播描述">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="scheduled_time" label="计划时间" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 章节管理模态框 */}
      <Modal
        title="章节管理"
        open={chapterModalVisible}
        onCancel={() => {
          setChapterModalVisible(false)
          setCurrentCourseId(null)
        }}
        footer={null}
        width={800}
      >
        {currentCourseId && (
          <CourseChapterManager 
            courseId={currentCourseId}
            onClose={() => {
              setChapterModalVisible(false)
              setCurrentCourseId(null)
            }}
          />
        )}
      </Modal>
    </Layout>
  )
}

export default AdminComplete
