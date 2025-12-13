import { useRef, useEffect, useState } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './index.css'
import { message } from 'antd'

interface VideoPlayerProps {
  src: string
  poster?: string
  onProgress?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  initialTime?: number
  autoplay?: boolean
}

function VideoPlayer({ src, poster, onProgress, onEnded, initialTime = 0, autoplay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [currentRate, setCurrentRate] = useState(1.0)
  const wasPlayingRef = useRef(false) // 记录切换前是否在播放

  useEffect(() => {
    if (!videoRef.current) return

    // 如果player已经存在且未被销毁，更新source而不是重新创建
    if (playerRef.current && !playerRef.current.isDisposed()) {
      const player = playerRef.current
      try {
        // 记录当前是否在播放
        wasPlayingRef.current = !player.paused()

        // 暂停当前播放
        if (wasPlayingRef.current) {
          player.pause()
        }

        // 更新视频源
        player.src({ src, type: 'video/mp4' })

        if (poster) {
          player.poster(poster)
        }

        // 设置初始时间，并在加载后根据之前的状态决定是否播放
        player.one('loadedmetadata', () => {
          if (!player.isDisposed()) {
            if (initialTime > 0) {
              player.currentTime(initialTime)
            }
            // 如果之前正在播放，则继续播放新视频
            if (wasPlayingRef.current) {
              player.play().catch((error: any) => {
                console.log('自动播放被阻止:', error)
              })
            }
          }
        })
      } catch (error) {
        console.error('更新视频源失败:', error)
        // 如果更新失败，清理当前player，下次会重新创建
        if (!player.isDisposed()) {
          player.dispose()
        }
        playerRef.current = null
      }
      return
    }

    // 初始化 video.js
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: autoplay,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],  // 倍速播放选项
      sources: [{
        src,
        type: 'video/mp4'
      }],
      poster,
      controlBar: {
        volumePanel: { inline: false },
        pictureInPictureToggle: true,  // 启用画中画
        playbackRateMenuButton: true,  // 显示倍速按钮
      },
      // 支持键盘快捷键
      userActions: {
        hotkeys: true
      }
    })

    playerRef.current = player

    // 设置初始播放时间
    if (initialTime > 0) {
      player.one('loadedmetadata', () => {
        player.currentTime(initialTime)
      })
    }

    // 监听播放进度（每3秒保存一次，减少API调用）
    let lastSaveTime = 0
    player.on('timeupdate', () => {
      const currentTime = player.currentTime()
      const duration = player.duration()

      // 每3秒保存一次进度
      if (onProgress && duration && currentTime - lastSaveTime >= 3) {
        onProgress(currentTime, duration)
        lastSaveTime = currentTime
      }
    })

    // 监听播放完成事件
    player.on('ended', () => {
      if (onProgress) {
        const duration = player.duration()
        onProgress(duration, duration)  // 保存完成状态（100%）
      }
      if (onEnded) {
        onEnded()
      }
    })

    // 监听倍速变化
    player.on('ratechange', () => {
      const rate = player.playbackRate()
      setCurrentRate(rate)
      if (rate !== 1) {
        message.info(`播放速度: ${rate}x`, 1)
      }
    })

    // 监听错误
    player.on('error', () => {
      const error = player.error()
      console.error('视频播放错误:', error)

      let errorMsg = '视频加载失败'
      if (error) {
        switch (error.code) {
          case 1:
            errorMsg = '视频加载被中止'
            break
          case 2:
            errorMsg = '网络错误，请检查网络连接'
            break
          case 3:
            errorMsg = '视频解码失败'
            break
          case 4:
            errorMsg = '视频格式不支持或视频源无效'
            break
          default:
            errorMsg = '未知错误'
        }
      }

      message.error(errorMsg)
    })

    // 添加键盘快捷键支持
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!player || player.isDisposed()) return

      // 左箭头：后退5秒
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const currentTime = player.currentTime()
        player.currentTime(Math.max(0, currentTime - 5))
        message.info('后退 5 秒', 1)
      }

      // 右箭头：快进5秒
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const currentTime = player.currentTime()
        const duration = player.duration()
        player.currentTime(Math.min(duration, currentTime + 5))
        message.info('快进 5 秒', 1)
      }

      // 空格：播放/暂停
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
        if (player.paused()) {
          player.play()
        } else {
          player.pause()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    // 清理键盘事件监听器
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [src])

  // 组件卸载时清理player
  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [])

  return (
    <div className="video-player-wrapper">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
      />
    </div>
  )
}

export default VideoPlayer


