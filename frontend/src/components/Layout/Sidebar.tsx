import { Layout, Menu, message } from 'antd'
import {
  DashboardOutlined,
  BookOutlined,
  VideoCameraOutlined,
  TrophyOutlined,
  BellOutlined,
  LogoutOutlined,
  HeartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { logout } from '../../store/slices/authSlice'
import './Sidebar.css'

const { Sider } = Layout

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER'

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: '课程中心',
    },
    {
      key: '/live',
      icon: <VideoCameraOutlined />,
      label: '直播课程',
    },
    {
      key: '/favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
    },
    {
      key: '/achievements',
      icon: <TrophyOutlined />,
      label: '我的成就',
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: '通知',
    },
    // 管理后台入口（仅管理员和讲师可见）
    ...(isAdmin ? [{
      key: '/admin',
      icon: <SettingOutlined />,
      label: '管理后台',
    }] : []),
  ]

  const handleLogout = () => {
    dispatch(logout())
    message.success('已退出登录')
    navigate('/login')
  }

  return (
    <Sider className="custom-sidebar" width={250} theme="light">
      <div className="sidebar-content">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          className="sidebar-menu"
        />

        {/* Support Card */}
        <div className="support-card">
          <div className="support-icon">
            <span className="support-emoji">📞</span>
          </div>
          <h4>全天候支持</h4>
          <p>随时联系我们</p>
          <button className="support-btn">开始</button>
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <div className="logout-section" onClick={handleLogout}>
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        )}
      </div>
    </Sider>
  )
}

export default Sidebar


