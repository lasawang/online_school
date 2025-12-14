import { useState, useEffect } from 'react'
import { 
  Layout, Menu, Card, Row, Col, Statistic, Table, Button, message, 
  Modal, Form, Input, Select, Tag, Popconfirm, Switch, Tabs, DatePicker,
  Space, Divider, Upload, Avatar, Badge, Progress, Tooltip
} from 'antd'
import {
  DashboardOutlined, BookOutlined, UserOutlined, VideoCameraOutlined,
  SettingOutlined, TeamOutlined, FileTextOutlined, BarChartOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, UploadOutlined,
  SearchOutlined, ReloadOutlined, ExportOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import CourseChapterManager from '../../components/CourseChapterManager'
import { courseApi } from '../../services/course'
import { settingsApi } from '../../services/settings'
import api from '../../services/api'
import './index.css'

const { Content, Sider } = Layout
const { Option } = Select
const { TextArea } = Input

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  // 状态管理
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  
  // 模态框状态
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [liveModalVisible, setLiveModalVisible] = useState(false)
  const [courseModalVisible, setCourseModalVisible] = useState(false)
  const [userModalVisible, setUserModalVisible] = useState(false)
  
  // 数据状态
  const [categories, setCategories] = useState<any[]>([])
  const [lives, setLives] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [systemSettings, setSystemSettings] = useState<any>({})
  
  // 编辑状态
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null)
  
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

  // 数据加载
  useEffect(() => {
    switch(selectedKey) {
      case 'dashboard':
        fetchDashboardStats()
        break
      case 'courses':
        fetchCourses()
        fetchCategories()
        break
      case 'users':
        if (user?.role === 'ADMIN') fetchUsers()
        break
      case 'lives':
        fetchLives()
        fetchCourses()
        break
      case 'categories':
        fetchCategories()
        break
      case 'stats':
        fetchDetailedStats()
        break
      case 'settings':
        if (user?.role === 'ADMIN') fetchSettings()
        break
    }
  }, [selectedKey])
