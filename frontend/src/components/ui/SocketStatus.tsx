import React from 'react';
import { useSocket } from '../../Hook/useNotifications';

const SocketStatus: React.FC = () => {
  const socket = useSocket();
  const isConnected = socket?.connected || false;

  return (
    <div className="fixed">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          Socket: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {socket && (
        <div className="mt-2 text-xs text-gray-600">
          ID: {socket.id?.substring(0, 8) || 'N/A'}
        </div>
      )}
    </div>
  );
};

export default SocketStatus;
