import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CourseList from './pages/Course/CourseList'
import CourseDetail from './pages/Course/CourseDetail'
import VideoPlay from './pages/Course/VideoPlay'
import Login from './pages/User/Login'
import Register from './pages/User/Register'
import LiveList from './pages/Live'
import LiveRoom from './pages/Live/LiveRoom'
import Favorites from './pages/User/Favorites'
import Achievements from './pages/User/Achievements'
import Notifications from './pages/User/Notifications'
import Profile from './pages/User/Profile'
import AdminDashboard from './pages/Admin'

function App() {
  return (
    <Routes>
      {/* 首页 */}
      <Route path="/" element={<Home />} />
      
      {/* 课程相关 */}
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/courses/:courseId/play/:sectionId" element={<VideoPlay />} />
      
      {/* 直播相关 */}
      <Route path="/live" element={<LiveList />} />
      <Route path="/live/:id" element={<LiveRoom />} />
      
      {/* 用户相关 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/notifications" element={<Notifications />} />
      
      {/* 管理后台 */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      
      {/* 兼容旧路由 */}
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      
      {/* 404 重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
