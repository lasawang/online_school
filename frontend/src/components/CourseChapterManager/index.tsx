import { useState, useEffect } from 'react'
import { Card, Button, List, Input, Form, Modal, Upload, message, Collapse, Popconfirm, InputNumber, Progress } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, VideoCameraOutlined } from '@ant-design/icons'
import api from '../../services/api'
import type { UploadFile, UploadChangeParam } from 'antd/es/upload'

const { Panel } = Collapse
const { TextArea } = Input

interface Chapter {
  id: number
  title: string
  description?: string
  sort_order: number
  sections: Section[]
}

interface Section {
  id: number
  title: string
  description?: string
  video_url?: string
  duration?: number
  sort_order: number
}

interface CourseChapterManagerProps {
  courseId: number | null
}

function CourseChapterManager({ courseId }: CourseChapterManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)
  const [chapterModalVisible, setChapterModalVisible] = useState(false)
  const [sectionModalVisible, setSectionModalVisible] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [editingSection, setEditingSection] = useState<{ section: Section | null, chapterId: number | null }>({ section: null, chapterId: null })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [chapterForm] = Form.useForm()
  const [sectionForm] = Form.useForm()

  useEffect(() => {
    if (courseId) {
      fetchChapters()
    }
  }, [courseId])

  const fetchChapters = async () => {
    if (!courseId) return
    try {
      const response: any = await api.get(`/api/v1/chapters/course/${courseId}`)
      setChapters(response || [])
    } catch (error) {
      console.error('获取章节失败:', error)
    }
  }

  // 章节操作
  const handleAddChapter = () => {
    setEditingChapter(null)
    chapterForm.resetFields()
    setChapterModalVisible(true)
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
    chapterForm.setFieldsValue(chapter)
    setChapterModalVisible(true)
  }

  const handleSaveChapter = async () => {
    try {
      const values = await chapterForm.validateFields()
      setLoading(true)

      if (editingChapter) {
        await api.put(`/api/v1/chapters/${editingChapter.id}`, values)
        message.success('章节更新成功')
      } else {
        await api.post('/api/v1/chapters', {
          ...values,
          course_id: courseId,
          sort_order: chapters.length
        })
        message.success('章节创建成功')
      }

      setChapterModalVisible(false)
      fetchChapters()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChapter = async (chapterId: number) => {
    try {
      await api.delete(`/api/v1/chapters/${chapterId}`)
      message.success('章节删除成功')
      fetchChapters()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  // 小节操作
  const handleAddSection = (chapterId: number) => {
    setEditingSection({ section: null, chapterId })
    sectionForm.resetFields()
    setSectionModalVisible(true)
  }

  const handleEditSection = (section: Section, chapterId: number) => {
    setEditingSection({ section, chapterId })
    sectionForm.setFieldsValue(section)
    setSectionModalVisible(true)
  }

  const handleSaveSection = async () => {
    try {
      const values = await sectionForm.validateFields()
      setLoading(true)

      if (editingSection.section) {
        await api.put(`/api/v1/chapters/sections/${editingSection.section.id}`, values)
        message.success('小节更新成功')
      } else {
        const chapter = chapters.find(c => c.id === editingSection.chapterId)
        await api.post('/api/v1/chapters/sections', {
          ...values,
          chapter_id: editingSection.chapterId,
          sort_order: chapter?.sections?.length || 0
        })
        message.success('小节创建成功')
      }

      setSectionModalVisible(false)
      fetchChapters()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    try {
      await api.delete(`/api/v1/chapters/sections/${sectionId}`)
      message.success('小节删除成功')
      fetchChapters()
    } catch (error: any) {
      message.error(error.response?.data?.detail || '删除失败')
    }
  }

  // 视频上传
  const handleVideoUpload = async (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setUploadProgress(info.file.percent || 0)
    }
    if (info.file.status === 'done') {
      const videoUrl = info.file.response?.url
      if (videoUrl) {
        sectionForm.setFieldsValue({ video_url: videoUrl })
        message.success('视频上传成功')
        setUploadProgress(0)
      }
    } else if (info.file.status === 'error') {
      message.error('视频上传失败')
      setUploadProgress(0)
    }
  }

  if (!courseId) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>请先保存课程基本信息</div>
  }

  return (
    <Card
      title="课程章节管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChapter}>
          添加章节
        </Button>
      }
    >
      {chapters.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          暂无章节，点击"添加章节"开始创建课程内容
        </div>
      ) : (
        <Collapse defaultActiveKey={[chapters[0]?.id]}>
          {chapters.map((chapter, chapterIndex) => (
            <Panel
              key={chapter.id}
              header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <strong>第{chapterIndex + 1}章：</strong> {chapter.title}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="link"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddSection(chapter.id)}
                    >
                      添加小节
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditChapter(chapter)}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确认删除该章节及所有小节？"
                      onConfirm={() => handleDeleteChapter(chapter.id)}
                    >
                      <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              }
            >
              <List
                dataSource={chapter.sections || []}
                renderItem={(section, sectionIndex) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSection(section, chapter.id)}
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        title="确认删除该小节？"
                        onConfirm={() => handleDeleteSection(section.id)}
                      >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<VideoCameraOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                      title={`${chapterIndex + 1}.${sectionIndex + 1} ${section.title}`}
                      description={
                        <div>
                          {section.description && <p>{section.description}</p>}
                          {section.video_url ? (
                            <span style={{ color: '#52c41a' }}>✓ 已上传视频</span>
                          ) : (
                            <span style={{ color: '#ff4d4f' }}>✗ 未上传视频</span>
                          )}
                          {section.duration && ` · ${section.duration}分钟`}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      )}

      {/* 章节Modal */}
      <Modal
        title={editingChapter ? '编辑章节' : '新建章节'}
        open={chapterModalVisible}
        onOk={handleSaveChapter}
        onCancel={() => setChapterModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={chapterForm} layout="vertical">
          <Form.Item name="title" label="章节标题" rules={[{ required: true, message: '请输入章节标题' }]}>
            <Input placeholder="请输入章节标题" />
          </Form.Item>
          <Form.Item name="description" label="章节描述">
            <TextArea rows={3} placeholder="请输入章节描述" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={chapters.length}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 小节Modal */}
      <Modal
        title={editingSection.section ? '编辑小节' : '新建小节'}
        open={sectionModalVisible}
        onOk={handleSaveSection}
        onCancel={() => setSectionModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={sectionForm} layout="vertical">
          <Form.Item name="title" label="小节标题" rules={[{ required: true, message: '请输入小节标题' }]}>
            <Input placeholder="请输入小节标题" />
          </Form.Item>
          <Form.Item name="description" label="小节描述">
            <TextArea rows={2} placeholder="请输入小节描述" />
          </Form.Item>
          <Form.Item name="video_url" label="视频文件">
            <Input placeholder="视频URL将在上传后自动填充" disabled />
          </Form.Item>
          <Form.Item label="上传视频">
            <Upload
              name="file"
              action="/api/v1/upload/video"
              headers={{
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }}
              accept="video/*"
              maxCount={1}
              onChange={handleVideoUpload}
            >
              <Button icon={<UploadOutlined />}>选择视频文件</Button>
            </Upload>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress percent={Math.round(uploadProgress)} style={{ marginTop: 8 }} />
            )}
          </Form.Item>
          <Form.Item name="duration" label="时长（分钟）">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="视频时长" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default CourseChapterManager
