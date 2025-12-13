import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { getApiBaseUrl } from '../utils/url'

interface UseSocketProps {
  roomId: string
  user: any
}

export const useSocket = ({ roomId, user }: UseSocketProps) => {
  const [connected, setConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // 创建socket连接
    const socket = io(getApiBaseUrl(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // 连接成功
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setConnected(true)

      // 加入房间
      socket.emit('join_room', {
        room_id: roomId,
        user_info: {
          id: user?.id,
          username: user?.username || '游客',
          avatar: user?.avatar,
        },
      })
    })

    // 连接断开
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    // 有人加入
    socket.on('user_joined', (data: any) => {
      console.log('User joined:', data)
      setUserCount(data.user_count)
    })

    // 有人离开
    socket.on('user_left', (data: any) => {
      console.log('User left:', data)
      setUserCount(data.user_count)
    })

    // 清理函数
    return () => {
      if (socket.connected) {
        socket.emit('leave_room', { room_id: roomId })
        socket.disconnect()
      }
    }
  }, [roomId, user])

  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', {
        room_id: roomId,
        message,
        user_info: {
          id: user?.id,
          username: user?.username || '游客',
          avatar: user?.avatar,
        },
        timestamp: new Date().toISOString(),
      })
    }
  }

  const onNewMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback)
    }
  }

  const offNewMessage = () => {
    if (socketRef.current) {
      socketRef.current.off('new_message')
    }
  }

  return {
    connected,
    userCount,
    sendMessage,
    onNewMessage,
    offNewMessage,
  }
}
