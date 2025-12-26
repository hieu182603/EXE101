import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  trend: string;
  icon: string;
  variant?: 'primary' | 'blue' | 'purple' | 'orange';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, trend, icon, variant = 'primary' }) => {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    blue: 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    orange: 'text-orange-400 bg-orange-400/10'
  };

  return (
    <div className="rounded-2xl bg-surface-dark p-6 border border-border-dark hover:border-primary/50 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className={`p-2 rounded-xl ${colorMap[variant]}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="mt-2 flex items-center gap-1 text-sm text-primary">
        <span className="material-symbols-outlined text-sm">trending_up</span>
        <span className="font-medium">{trend}</span>
        <span className="ml-1 text-gray-500">so với tháng trước</span>
      </div>
    </div>
  );
};

export default DashboardCard;










