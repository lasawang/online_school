import { useState, useEffect } from 'react'
import { Layout, Row, Col, Tabs, Button, Tag, Input, Spin, Empty, message } from 'antd'
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Layout/Header'
import Sidebar from '../../components/Layout/Sidebar'
import CourseCard from '../../components/CourseCard'
import { courseApi } from '../../services/course'
import { categoryApi } from '../../services/category'
import './CourseList.css'

const { Content } = Layout

interface CourseItem {
  id: number
  title: string
  cover_image: string
  duration: string
  students: number
  rating: number
  tags: string[]
}

function CourseList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '')
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [categories, setCategories] = useState<{ key: string; label: string }[]>([
    { key: 'all', label: '全部课程' }
  ])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 12

  const topTags = ['Python', 'React', 'Node.js', 'MySQL', 'AI', 'Vue', 'Java', '安全']

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await categoryApi.getCategories()
        if (Array.isArray(response)) {
          const cats = [{ key: 'all', label: '全部课程' }]
          response.forEach((cat: any) => {
            cats.push({ key: String(cat.id), label: cat.name })
          })
          setCategories(cats)
        }
      } catch (error) {
        console.log('获取分类失败，使用默认分类')
      }
    }
    fetchCategories()
  }, [])

  // 获取课程列表
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const params: any = {
          page,
          page_size: pageSize,
        }
        if (searchKeyword) {
          params.keyword = searchKeyword
        }
        if (activeTab !== 'all') {
          params.category_id = parseInt(activeTab)
        }

        const response: any = await courseApi.getCourses(params)
        
        if (response.items) {
          const formattedCourses = response.items.map((course: any) => ({
            id: course.id,
            title: course.title,
            cover_image: course.cover_image || `https://picsum.photos/seed/course${course.id}/400/300`,
            duration: '15 min',
            students: course.student_count || 0,
            rating: parseFloat(course.rating) || 4.5,
            tags: course.tags ? course.tags.split(',').map((t: string) => t.trim()) : ['课程'],
          }))
          setCourses(formattedCourses)
          setTotal(response.total || 0)
        } else {
          setCourses([])
          setTotal(0)
        }
      } catch (error) {
        console.error('获取课程失败:', error)
        message.error('获取课程列表失败，请检查后端服务是否启动')
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [searchKeyword, activeTab, page])

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setPage(1)
    if (value) {
      navigate(`/courses?keyword=${encodeURIComponent(value)}`)
    } else {
      navigate('/courses')
    }
  }

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    setSearchKeyword(tag)
    setPage(1)
    navigate(`/courses?keyword=${encodeURIComponent(tag)}`)
  }

  // 处理分类切换
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    setPage(1)
  }

  // 加载更多
  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <Layout className="main-layout">
      <Sidebar />
      <Layout style={{ marginLeft: 250 }}>
        <Header title="课程中心" />
        <Content className="course-list-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-text">
              <h1>探索精选IT课程</h1>
              <p>掌握最新技术，提升职业竞争力</p>
            </div>
            <div className="search-box">
              <Input
                size="large"
                placeholder="搜索你感兴趣的课程..."
                prefix={<SearchOutlined />}
                className="hero-search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          {/* Popular Tags */}
          <div className="popular-tags">
            <span className="tags-label">热门标签：</span>
            {topTags.map((tag) => (
              <Tag
                key={tag}
                className={`popular-tag ${searchKeyword === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>

          {/* Category Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={categories}
            className="category-tabs"
          />

          {/* Course Grid */}
          {loading ? (
            <div className="loading-container">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
          ) : courses.length > 0 ? (
            <Row gutter={[24, 24]} className="course-grid">
              {courses.map((course) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
                  <CourseCard {...course} />
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-container">
              <Empty description="暂无课程" />
            </div>
          )}

          {/* Load More */}
          {courses.length > 0 && courses.length < total && (
            <div className="load-more">
              <Button size="large" type="primary" onClick={handleLoadMore} loading={loading}>
                加载更多课程
              </Button>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}

export default CourseList
