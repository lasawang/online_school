import { Card, Tag } from 'antd'
import { ClockCircleOutlined, UserOutlined, StarFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'

interface CourseCardProps {
  id: number
  title: string
  cover_image: string
  duration?: string
  students?: number
  rating?: number
  tags?: string[]
  onClick?: () => void
}

function CourseCard({
  id,
  title,
  cover_image,
  duration = '15 min',
  students = 0,
  rating = 0,
  tags = [],
  onClick
}: CourseCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/courses/${id}`)
    }
  }

  // 格式化学员数量
  const formatStudents = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <Card
      hoverable
      className="course-card"
      cover={
        <div className="course-cover">
          <img 
            alt={title} 
            src={cover_image} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/default/400/300'
            }}
          />
          <div className="course-overlay">
            <div className="duration-tag">
              <ClockCircleOutlined /> {duration}
            </div>
          </div>
        </div>
      }
      onClick={handleClick}
    >
      <div className="course-info">
        <h3 className="course-title">{title}</h3>
        
        <div className="course-tags">
          {tags.slice(0, 3).map((tag, index) => (
            <Tag key={index} color="blue">{tag}</Tag>
          ))}
        </div>

        <div className="course-meta">
          <span className="meta-item">
            <UserOutlined /> {formatStudents(students)} 学员
          </span>
          <span className="meta-item rating">
            <StarFilled /> {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard


