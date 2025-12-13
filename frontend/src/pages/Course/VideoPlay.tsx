import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Row, Col, Card, List, Button, message, Spin, Progress, Tag, Avatar } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import Header from '../../components/Layout/Header'
import { courseApi } from '../../services/course'
import { learningApi } from '../../services/learning'
import { getVideoUrl } from '../../utils/url'
import './VideoPlay.css'

const { Content } = Layout

function VideoPlay() {
  const { courseId, sectionId } = useParams<{ courseId: string; sectionId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressIntervalRef = useRef<any>(null)

  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState<any>(null)
  const [learningRecords, setLearningRecords] = useState<any[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (courseId && sectionId) {
      fetchCourseData()
      if (isAuthenticated) {
        checkEnrollment()
        fetchLearningRecords()
      }
    }
  }, [courseId, sectionId, isAuthenticated])

  // 监听视频播放进度
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isAuthenticated || !currentSection) return

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      const duration = video.duration

      if (duration && currentTime > 0) {
        // 每5秒保存一次进度
        if (!progressIntervalRef.current) {
          progressIntervalRef.current = setTimeout(() => {
            saveProgress(currentTime, duration)
            progressIntervalRef.current = null
          }, 5000)
        }
      }
    }

    const handleEnded = () => {
      // 视频播放结束
      if (video.duration) {
        saveProgress(video.duration, video.duration)
      }
      handleVideoEnded()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      if (progressIntervalRef.current) {
        clearTimeout(progressIntervalRef.current)
      }
    }
  }, [currentSection, isAuthenticated])

  const fetchCourseData = async () => {
    setLoading(true)
    try {
      const response: any = await courseApi.getCourseDetail(parseInt(courseId!))
      setCourseData(response)

      // 查找当前小节
      let foundSection = null
      for (const chapter of response.chapters || []) {
        for (const section of chapter.sections || []) {
          if (section.id === parseInt(sectionId!)) {
            foundSection = section
            break
          }
        }
        if (foundSection) break
      }

      if (foundSection) {
        setCurrentSection(foundSection)
      } else {
        message.error('小节不存在')
        navigate(`/courses/${courseId}`)
      }
    } catch (error) {
      console.error('获取课程数据失败:', error)
      message.error('获取课程数据失败')
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const response: any = await courseApi.checkEnrollment(parseInt(courseId!))
      setIsEnrolled(response.is_enrolled)
    } catch (error) {
      console.error('检查报名状态失败:', error)
    }
  }

  const fetchLearningRecords = async () => {
    try {
      const response: any = await learningApi.getCourseRecords(parseInt(courseId!))
      setLearningRecords(response || [])
    } catch (error) {
      console.error('获取学习记录失败:', error)
    }
  }

  const saveProgress = async (currentTime: number, duration: number) => {
    if (!isAuthenticated || !currentSection) return

    const progress = (currentTime / duration) * 100
    try {
      await learningApi.saveRecord({
        course_id: parseInt(courseId!),
        section_id: currentSection.id,
        progress: Math.round(progress),
        last_position: Math.round(currentTime),
      })
      // 重新获取学习记录以更新UI
      fetchLearningRecords()
    } catch (error) {
      console.error('保存学习记录失败:', error)
    }
  }

  const handleSectionClick = (section: any) => {
    // 检查是否是第一个小节
    const isFirstSection = courseData?.chapters?.[0]?.sections?.[0]?.id === section.id

    if (!isEnrolled && !isFirstSection) {
      message.warning('请先报名课程后观看完整内容')
      return
    }

    // 跳转到新的播放页面
    navigate(`/courses/${courseId}/play/${section.id}`)
  }

  const handleVideoEnded = () => {
    const nextSection = getNextSection()
    if (nextSection) {
      message.success(`当前小节已完成，即将播放下一节: ${nextSection.title}`)
      setTimeout(() => {
        navigate(`/courses/${courseId}/play/${nextSection.id}`)
      }, 2000)
    } else {
      message.success('恭喜！您已完成本课程所有章节')
    }
  }

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
          if (i + 1 < chapter.sections.length) {
            return chapter.sections[i + 1]
          }
        }
      }
    }
    return null
  }

  const getInitialTime = () => {
    if (!currentSection) return 0
    const record = learningRecords.find(r => r.section_id === currentSection.id)
    return record?.is_completed ? 0 : (record?.last_position || 0)
  }

  const completedCount = learningRecords.filter((r) => r.is_completed).length
  const totalSections = courseData?.chapters?.reduce(
    (sum: number, ch: any) => sum + (ch.sections?.length || 0),
    0
  ) || 0
  const progressPercent = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0

  if (loading) {
    return (
      <Layout className="main-layout">
        <Layout>
          <Header />
          <Content style={{ padding: 40, textAlign: 'center' }}>
            <Spin size="large" />
          </Content>
        </Layout>
      </Layout>
    )
  }

  if (!courseData || !currentSection) {
    return (
      <Layout className="main-layout">
        <Layout>
          <Header />
          <Content style={{ padding: 40, textAlign: 'center' }}>
            <h2>视频不存在</h2>
            <Button onClick={() => navigate(`/courses/${courseId}`)}>返回课程</Button>
          </Content>
        </Layout>
      </Layout>
    )
  }

  const videoUrl = getVideoUrl(currentSection?.video_url) || 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'

  return (
    <Layout className="main-layout">
      <Layout>
        <Header />
        <Content className="video-play-content">
          <div className="video-play-header">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              返回课程
            </Button>
            <h2>{courseData.title}</h2>
            <div className="video-info">
              <Tag color="blue">{currentSection.title}</Tag>
              <span>学习进度: {progressPercent}%</span>
            </div>
          </div>

          <Row gutter={24}>
            {/* 左侧：视频播放器 */}
            <Col xs={24} lg={16}>
              <div className="video-container">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  src={videoUrl}
                  poster={courseData.cover_image}
                  style={{ width: '100%', borderRadius: 12 }}
                  onLoadedMetadata={() => {
                    // 设置初始播放位置
                    const initialTime = getInitialTime()
                    if (videoRef.current && initialTime > 0) {
                      videoRef.current.currentTime = initialTime
                    }
                  }}
                />
              </div>

              {/* 讲师信息卡片 */}
              <Card className="teacher-card">
                <div className="teacher-info">
                  <Avatar icon={<UserOutlined />} size={56} />
                  <div>
                    <h3>{courseData.teacher_name || '讲师'}</h3>
                    <p>{courseData.category_name || '课程'} · 难度: {courseData.level}</p>
                  </div>
                  <div className="course-stats">
                    <div className="stat-item">
                      <StarOutlined style={{ color: '#FFB800' }} />
                      <span>{courseData.rating}/5</span>
                    </div>
                    <div className="stat-item">
                      <UserOutlined />
                      <span>{courseData.student_count} 人学习</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* 右侧：课程章节列表 */}
            <Col xs={24} lg={8}>
              <Card className="chapters-list-card" title="课程章节">
                <div className="progress-info">
                  <Progress
                    percent={progressPercent}
                    strokeColor="#1890ff"
                    size="small"
                  />
                  <p>已完成 {completedCount}/{totalSections} 节课</p>
                </div>

                <div className="chapters-list">
                  {courseData.chapters?.map((chapter: any, chapterIndex: number) => (
                    <div key={chapter.id} className="chapter-group">
                      <div className="chapter-title">
                        第{chapterIndex + 1}章：{chapter.title}
                      </div>
                      <List
                        dataSource={chapter.sections || []}
                        renderItem={(section: any, sectionIndex: number) => {
                          const record = learningRecords.find((r) => r.section_id === section.id)
                          const isCompleted = record?.is_completed || false
                          const isActive = currentSection?.id === section.id

                          return (
                            <List.Item
                              className={`section-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                              onClick={() => handleSectionClick(section)}
                            >
                              <div className="section-content">
                                {isCompleted ? (
                                  <CheckCircleOutlined className="section-icon completed-icon" />
                                ) : (
                                  <PlayCircleOutlined className="section-icon" />
                                )}
                                <div className="section-info">
                                  <span className="section-name">
                                    {chapterIndex + 1}.{sectionIndex + 1} {section.title}
                                  </span>
                                  {section.duration && (
                                    <span className="section-duration">
                                      {section.duration}分钟
                                    </span>
                                  )}
                                </div>
                              </div>
                            </List.Item>
                          )
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}

export default VideoPlay
