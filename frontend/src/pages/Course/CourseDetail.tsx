import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Row, Col, Card, Button, Tabs, Tag, Avatar, List, Progress, Collapse, message, Spin, Input, Rate } from 'antd'
import {
  PlayCircleOutlined,
  LikeOutlined,
  StarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

const { TextArea } = Input
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import VideoPlayer from '../../components/VideoPlayer'
import { courseApi } from '../../services/course'
import { commentApi } from '../../services/comment'
import { learningApi } from '../../services/learning'
import { getVideoUrl } from '../../utils/url'
import './CourseDetail.css'

const { Content } = Layout
const { Panel } = Collapse

function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState('intro')
  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isCollected, setIsCollected] = useState(false)
  const [learningRecords, setLearningRecords] = useState<any[]>([])
  const [currentSection, setCurrentSection] = useState<any>(null)
  const [commentContent, setCommentContent] = useState('')
  const [commentRating, setCommentRating] = useState(5)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCourseDetail()
      fetchComments()
      if (isAuthenticated) {
        checkEnrollment()
        checkCollection()
        fetchLearningRecords()
      }
    }
  }, [id, isAuthenticated])

  const fetchCourseDetail = async () => {
    setLoading(true)
    try {
      const response: any = await courseApi.getCourseDetail(parseInt(id!))
      setCourseData(response)
      // 设置第一个小节为当前播放
      if (response.chapters && response.chapters.length > 0) {
        const firstChapter = response.chapters[0]
        if (firstChapter.sections && firstChapter.sections.length > 0) {
          setCurrentSection(firstChapter.sections[0])
        }
      }
    } catch (error) {
      console.error('获取课程详情失败:', error)
      message.error('获取课程详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response: any = await commentApi.getComments({
        course_id: parseInt(id!),
        page: 1,
        page_size: 20,
      })
      setComments(response || [])
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  const checkEnrollment = async () => {
    try {
      const response: any = await courseApi.checkEnrollment(parseInt(id!))
      setIsEnrolled(response.is_enrolled)
    } catch (error) {
      console.error('检查报名状态失败:', error)
    }
  }

  const checkCollection = async () => {
    try {
      const response: any = await learningApi.checkCollection(parseInt(id!))
      setIsCollected(response.is_collected)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  const fetchLearningRecords = async () => {
    try {
      const response: any = await learningApi.getCourseRecords(parseInt(id!))
      setLearningRecords(response || [])
    } catch (error) {
      console.error('获取学习记录失败:', error)
    }
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      return
    }
    try {
      await courseApi.enrollCourse(parseInt(id!))
      message.success('报名成功')
      setIsEnrolled(true)
    } catch (error: any) {
      message.error(error.response?.data?.detail || '报名失败')
    }
  }

  const handleToggleCollection = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      return
    }
    try {
      if (isCollected) {
        await learningApi.uncollectCourse(parseInt(id!))
        message.success('取消收藏成功')
        setIsCollected(false)
      } else {
        await learningApi.collectCourse(parseInt(id!))
        message.success('收藏成功')
        setIsCollected(true)
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    }
  }

  const handleProgress = async (currentTime: number, duration: number) => {
    if (!isAuthenticated || !currentSection) return

    const progress = (currentTime / duration) * 100
    try {
      await learningApi.saveRecord({
        course_id: parseInt(id!),
        section_id: currentSection.id,
        progress: Math.round(progress),
        last_position: Math.round(currentTime),
      })
    } catch (error) {
      console.error('保存学习记录失败:', error)
    }
  }

  const handleSectionClick = (section: any) => {
    // 检查是否是第一个小节（允许预览）
    const isFirstSection = courseData?.chapters?.[0]?.sections?.[0]?.id === section.id

    if (!isEnrolled && !isFirstSection) {
      message.warning('请先报名课程后观看完整内容，当前仅可预览第一节')
      return
    }

    // 跳转到全屏播放页面
    window.location.href = `/courses/${id}/play/${section.id}`
  }

  // 获取下一个小节
  const getNextSection = () => {
    if (!courseData?.chapters || !currentSection) return null

    let found = false
    for (const chapter of courseData.chapters) {
      if (!chapter.sections) continue

      for (let i = 0; i < chapter.sections.length; i++) {
        if (found) {
          return chapter.sections[i]
        }
        if (chapter.sections[i].id === currentSection.id) {
          found = true
          // 检查当前章节是否还有下一节
          if (i + 1 < chapter.sections.length) {
            return chapter.sections[i + 1]
          }
        }
      }
    }
    return null
  }

  // 处理视频播放完成
  const handleVideoEnded = () => {
    const nextSection = getNextSection()
    if (nextSection) {
      message.success(`当前小节已完成，即将播放下一节: ${nextSection.title}`)
      setTimeout(() => {
        setCurrentSection(nextSection)
      }, 2000)
    } else {
      message.success('恭喜！您已完成本课程所有章节')
    }
  }

  // 获取当前小节的播放位置
  const getInitialTime = () => {
    if (!currentSection) return 0
    const record = learningRecords.find(r => r.section_id === currentSection.id)
    // 如果已完成，从头开始；否则从上次位置继续
    return record?.is_completed ? 0 : (record?.last_position || 0)
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      return
    }
    if (!commentContent.trim()) {
      message.warning('请输入评论内容')
      return
    }

    setSubmittingComment(true)
    try {
      await commentApi.createComment({
        course_id: parseInt(id!),
        content: commentContent.trim(),
        rating: commentRating,
      })
      message.success('评论发表成功')
      setCommentContent('')
      setCommentRating(5)
      // 刷新评论列表
      await fetchComments()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '评论发表失败')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <Layout className="main-layout">
        <Sidebar />
        <Layout style={{ marginLeft: 250 }}>
          <Header />
          <Content style={{ padding: 40, textAlign: 'center' }}>
            <Spin size="large" />
          </Content>
        </Layout>
      </Layout>
    )
  }

  if (!courseData) {
    return (
      <Layout className="main-layout">
        <Sidebar />
        <Layout style={{ marginLeft: 250 }}>
          <Header />
          <Content style={{ padding: 40, textAlign: 'center' }}>
            <h2>课程不存在</h2>
          </Content>
        </Layout>
      </Layout>
    )
  }

  const completedCount = learningRecords.filter((r) => r.is_completed).length
  const totalSections = courseData.chapters?.reduce(
    (sum: number, ch: any) => sum + (ch.sections?.length || 0),
    0
  ) || 0
  const progressPercent = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0

  const tabItems = [
    {
      key: 'intro',
      label: '课程介绍',
      children: (
        <div className="course-intro">
          <h3>课程描述</h3>
          <p>{courseData.description || '暂无描述'}</p>

          <h3>课程信息</h3>
          <div className="course-meta-grid">
            <div className="meta-item">
              <span className="meta-label">难度:</span>
              <span className="meta-value">{courseData.level}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">价格:</span>
              <span className="meta-value">¥{courseData.price}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">学习人数:</span>
              <span className="meta-value">{courseData.student_count}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">评分:</span>
              <span className="meta-value">{courseData.rating}/5</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'comments',
      label: `评论 (${comments.length})`,
      children: (
        <div>
          {/* 评论输入框 */}
          {isAuthenticated && (
            <Card style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ marginRight: 12 }}>评分:</span>
                <Rate value={commentRating} onChange={setCommentRating} />
              </div>
              <TextArea
                rows={4}
                placeholder="写下你的评论..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <Button
                type="primary"
                onClick={handleSubmitComment}
                loading={submittingComment}
              >
                发表评论
              </Button>
            </Card>
          )}
          {!isAuthenticated && (
            <Card style={{ marginBottom: 24, textAlign: 'center' }}>
              <p>请先登录后发表评论</p>
            </Card>
          )}

          {/* 评论列表 */}
          <List
            dataSource={comments}
            renderItem={(item: any) => (
              <List.Item className="comment-item">
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} size={48} />}
                  title={
                    <div className="comment-header">
                      <span className="comment-user">用户{item.user_id}</span>
                      <span className="comment-time">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  }
                  description={
                    <div>
                      {item.rating && (
                        <div className="comment-rating">
                          {[...Array(item.rating)].map((_, i) => (
                            <StarOutlined key={i} style={{ color: '#FFB800' }} />
                          ))}
                        </div>
                      )}
                      <p className="comment-content">{item.content}</p>
                      <Button type="text" icon={<LikeOutlined />}>
                        {item.like_count}
                      </Button>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ]

  const videoUrl = getVideoUrl(currentSection?.video_url) || 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'

  const handleStartLearning = () => {
    // 获取第一个章节的第一个小节
    const firstSection = courseData?.chapters?.[0]?.sections?.[0]
    if (firstSection) {
      window.location.href = `/courses/${id}/play/${firstSection.id}`
    } else {
      message.warning('课程暂无章节')
    }
  }

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header />
        <Content className="course-detail-content">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={18} xl={16}>
              {/* 课程封面图 */}
              <div className="course-cover-section">
                <img
                  src={courseData.cover_image || 'https://picsum.photos/seed/course/1200/600'}
                  alt={courseData.title}
                  style={{ width: '100%', borderRadius: 12 }}
                />
              </div>

              {/* Course Title & Stats */}
              <Card className="course-header-card">
                <h1 className="course-title">{courseData.title}</h1>

                <div className="course-stats-row">
                  <div className="stat-item">
                    <UserOutlined /> {courseData.student_count} 学习
                  </div>
                  <div className="stat-item rating">
                    <StarOutlined /> {courseData.rating}
                  </div>
                  <div className="stat-item">
                    <LikeOutlined /> {courseData.view_count} 浏览
                  </div>
                </div>

                <div className="teacher-info">
                  <Avatar icon={<UserOutlined />} size={56} />
                  <div>
                    <h4>{courseData.teacher_name || '讲师'}</h4>
                    <p>{courseData.category_name || '课程'} · 难度: {courseData.level}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Button
                      type={isCollected ? 'default' : 'default'}
                      size="large"
                      icon={<StarOutlined style={{ color: isCollected ? '#FFB800' : undefined }} />}
                      onClick={handleToggleCollection}
                    >
                      {isCollected ? '已收藏' : '收藏'}
                    </Button>
                    {!isEnrolled && (
                      <Button type="primary" size="large" onClick={handleEnroll}>
                        报名课程
                      </Button>
                    )}
                    {isEnrolled && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<PlayCircleOutlined />}
                        onClick={handleStartLearning}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                      >
                        开始学习
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* 学习进度卡片 */}
              {isEnrolled && (
                <Card className="progress-card" style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 16 }}>学习进度</h3>
                  <Progress
                    percent={progressPercent}
                    strokeColor="#1935CA"
                    status="active"
                  />
                  <p style={{ marginTop: 8, color: '#696F79' }}>
                    已完成 {completedCount}/{totalSections} 节课
                  </p>
                </Card>
              )}

              {/* Tabs */}
              <Card className="course-tabs-card">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={tabItems}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}

export default CourseDetail
