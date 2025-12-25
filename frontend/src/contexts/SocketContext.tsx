import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface NotificationData {
  type: 'order' | 'payment' | 'shipping' | 'feedback' | 'rfq';
  title: string;
  message: string;
  data?: any;
  timestamp?: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationData[];
  joinUserRoom: (userId: string) => void;
  joinAdminRoom: () => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    // Listen for notifications
    socketInstance.on('order-update', (data: NotificationData) => {
      console.log('📦 Order update received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('payment-update', (data: NotificationData) => {
      console.log('💳 Payment update received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('shipping-update', (data: NotificationData) => {
      console.log('🚚 Shipping update received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('new-feedback', (data: NotificationData) => {
      console.log('💬 New feedback received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('new-rfq', (data: NotificationData) => {
      console.log('📋 New RFQ received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('new-order-activity', (data: NotificationData) => {
      console.log('📊 New order activity received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('new-payment-activity', (data: NotificationData) => {
      console.log('💰 New payment activity received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    socketInstance.on('new-shipping-activity', (data: NotificationData) => {
      console.log('🚛 New shipping activity received:', data);
      setNotifications(prev => [data, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinUserRoom = (userId: string) => {
    if (socket && isConnected) {
      socket.emit('join-user', userId);
    }
  };

  const joinAdminRoom = () => {
    if (socket && isConnected) {
      socket.emit('join-admin');
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    joinUserRoom,
    joinAdminRoom,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
