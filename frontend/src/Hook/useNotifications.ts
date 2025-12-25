import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export interface NotificationData {
  type: 'order' | 'payment' | 'shipping' | 'feedback' | 'rfq';
  title: string;
  message: string;
  data?: any;
  timestamp?: Date;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom hook for Socket.IO connection with authentication
 * Based on SmartAttendance implementation
 */
export function useSocket() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!token) {
      // Cleanup existing socket if token is removed
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
      return;
    }

    // Tránh tạo socket duplicate trong React Strict Mode
    if (socketRef.current?.connected) {
      return;
    }

    isConnectingRef.current = true;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    // Connection event handlers
    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Connected successfully');
      }
    });

    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Disconnected:', reason);
      }
    });

    socket.on('connect_error', (error) => {
      // Log error để debug nhưng không throw
      if (import.meta.env.DEV) {
        console.warn('[Socket] Connection error:', error.message);
        console.warn('[Socket] Attempting to connect to:', SOCKET_URL);
        console.warn('[Socket] Make sure backend server is running on port 3000');
      }
    });

    socket.on('reconnect_attempt', () => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Attempting to reconnect...');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      }
    });

    socket.on('reconnect_failed', () => {
      if (import.meta.env.DEV) {
        console.error('[Socket] Reconnection failed. Please check if backend server is running.');
      }
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        // Chỉ disconnect nếu socket đã connected
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        } else {
          // Nếu chưa connected, đóng ngay để tránh warning
          socketRef.current.close();
        }
        socketRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [token]);

  return socketRef.current;
}

export const useNotifications = (accountId?: string, isAdmin: boolean = false) => {
  const socket = useSocket();
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  // Listen for socket connection status
  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set initial connection status
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Listen for notifications when socket is available
  useEffect(() => {
    if (!socket) return;

    // Listen for different notification types
    const handleOrderUpdate = (data: NotificationData) => {
      if (import.meta.env.DEV) {
        console.log('[Notification] Order update received:', data);
      }
      setNotifications(prev => [data, ...prev]);
    };

    const handlePaymentUpdate = (data: NotificationData) => {
      if (import.meta.env.DEV) {
        console.log('[Notification] Payment update received:', data);
      }
      setNotifications(prev => [data, ...prev]);
    };

    const handleShippingUpdate = (data: NotificationData) => {
      if (import.meta.env.DEV) {
        console.log('[Notification] Shipping update received:', data);
      }
      setNotifications(prev => [data, ...prev]);
    };

    const handleNewFeedback = (data: NotificationData) => {
      if (import.meta.env.DEV) {
        console.log('[Notification] New feedback received:', data);
      }
      setNotifications(prev => [data, ...prev]);
    };

    const handleNewRFQ = (data: NotificationData) => {
      if (import.meta.env.DEV) {
        console.log('[Notification] New RFQ received:', data);
      }
      setNotifications(prev => [data, ...prev]);
    };

    const handleNotification = (data: NotificationData) => {
      if (import.meta.env.DEV) {
        console.log('[Notification] Generic notification received:', data);
      }
      setNotifications(prev => [data, ...prev]);
    };

    // Register event listeners
    socket.on('order-update', handleOrderUpdate);
    socket.on('payment-update', handlePaymentUpdate);
    socket.on('shipping-update', handleShippingUpdate);
    socket.on('new-feedback', handleNewFeedback);
    socket.on('new-rfq', handleNewRFQ);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('order-update', handleOrderUpdate);
      socket.off('payment-update', handlePaymentUpdate);
      socket.off('shipping-update', handleShippingUpdate);
      socket.off('new-feedback', handleNewFeedback);
      socket.off('new-rfq', handleNewRFQ);
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  // Filter notifications based on user type
  const userNotifications = notifications.filter(notification => {
    if (isAdmin) {
      // Admin receives all types of notifications
      return true;
    }

    // Regular users receive only their relevant notifications
    return ['order', 'payment', 'shipping'].includes(notification.type);
  });

  // Get unread count
  const unreadCount = userNotifications.length;

  // Mark notifications as read (clear them)
  const markAsRead = () => {
    setNotifications([]);
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get notifications by type
  const getNotificationsByType = (type: NotificationData['type']) => {
    return userNotifications.filter(notification => notification.type === type);
  };

  return {
    notifications: userNotifications,
    unreadCount,
    isConnected,
    markAsRead,
    getNotificationsByType,
    clearNotifications,
  };
};

export default useNotifications;
