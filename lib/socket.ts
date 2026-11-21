"use client";

import { io, type Socket } from "socket.io-client";
import { refreshSession, SERVER_ORIGIN } from "./api";
import { watchSocketAuth } from "./socket-auth-recovery";

/** 1 kết nối `/notifications` DÙNG CHUNG cho mọi tính năng realtime (tin
 * nhắn, đang nhập, đã xem, đấu 1v1...) — mỗi tính năng tự đăng ký/gỡ
 * listener riêng trên CÙNG socket này (Socket.IO cho phép nhiều listener
 * trên cùng 1 event), tránh mở nhiều kết nối tới cùng 1 namespace. */
let socket: Socket | null = null;
let stopAuthRecovery: (() => void) | null = null;

export function getNotificationsSocket(connected: boolean): Socket | null {
  if (!connected) {
    stopAuthRecovery?.();
    stopAuthRecovery = null;
    socket?.disconnect();
    socket = null;
    return null;
  }
  if (!socket) {
    socket = io(`${SERVER_ORIGIN}/notifications`, { withCredentials: true });
    stopAuthRecovery = watchSocketAuth(socket, { refresh: refreshSession });
  }
  return socket;
}
