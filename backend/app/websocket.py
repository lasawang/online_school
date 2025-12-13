"""
WebSocket处理器 - 直播弹幕功能
"""
import socketio
from typing import Dict, Set
from app.core.config import settings

# 创建Socket.IO服务器
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # 生产环境应该配置具体的域名
    logger=True,
    engineio_logger=True
)

# 存储房间内的用户
room_users: Dict[str, Set[str]] = {}


@sio.event
async def connect(sid, environ):
    """客户端连接"""
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """客户端断开连接"""
    print(f"Client disconnected: {sid}")
    # 从所有房间中移除该用户
    for room_id in list(room_users.keys()):
        if sid in room_users[room_id]:
            room_users[room_id].remove(sid)
            if not room_users[room_id]:
                del room_users[room_id]
            # 通知房间其他用户
            await sio.emit('user_left', {
                'room_id': room_id,
                'user_count': len(room_users.get(room_id, set()))
            }, room=room_id)


@sio.event
async def join_room(sid, data):
    """加入直播间"""
    room_id = str(data.get('room_id'))
    user_info = data.get('user_info', {})

    # 加入房间
    await sio.enter_room(sid, room_id)

    # 记录用户
    if room_id not in room_users:
        room_users[room_id] = set()
    room_users[room_id].add(sid)

    # 通知所有人有新用户加入
    await sio.emit('user_joined', {
        'room_id': room_id,
        'user_info': user_info,
        'user_count': len(room_users[room_id])
    }, room=room_id)

    print(f"User {sid} joined room {room_id}, total users: {len(room_users[room_id])}")


@sio.event
async def leave_room(sid, data):
    """离开直播间"""
    room_id = str(data.get('room_id'))

    # 离开房间
    await sio.leave_room(sid, room_id)

    # 移除用户记录
    if room_id in room_users and sid in room_users[room_id]:
        room_users[room_id].remove(sid)
        if not room_users[room_id]:
            del room_users[room_id]

    # 通知其他人
    await sio.emit('user_left', {
        'room_id': room_id,
        'user_count': len(room_users.get(room_id, set()))
    }, room=room_id)

    print(f"User {sid} left room {room_id}")


@sio.event
async def send_message(sid, data):
    """发送弹幕消息"""
    room_id = str(data.get('room_id'))
    message = data.get('message', '')
    user_info = data.get('user_info', {})

    # 广播消息到房间所有用户
    await sio.emit('new_message', {
        'room_id': room_id,
        'message': message,
        'user_info': user_info,
        'timestamp': data.get('timestamp')
    }, room=room_id)

    print(f"Message in room {room_id}: {message}")


@sio.event
async def send_gift(sid, data):
    """发送礼物"""
    room_id = str(data.get('room_id'))
    gift_type = data.get('gift_type', '')
    user_info = data.get('user_info', {})

    # 广播礼物到房间所有用户
    await sio.emit('new_gift', {
        'room_id': room_id,
        'gift_type': gift_type,
        'user_info': user_info,
        'timestamp': data.get('timestamp')
    }, room=room_id)

    print(f"Gift in room {room_id}: {gift_type}")
