import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* <h2 className="text-2xl font-bold text-gray-800">
            System Management
          </h2> */}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">{user?.username || 'Admin User'}</p>
              <p className="text-xs text-gray-500">
                {typeof user?.role === 'string' 
                  ? user.role 
                  : (user?.role as { name: string })?.name || 'admin'
                }
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 