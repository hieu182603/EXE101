import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    variant?: 'primary' | 'blue' | 'purple' | 'orange' | 'green' | 'red';
    loading?: boolean;
    onClick?: () => void;
    sparklineData?: number[];
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    variant = 'primary',
    loading = false,
    onClick,
    sparklineData
}) => {
    const colorMap: Record<string, { bg: string; icon: string; hover: string; trend: string }> = {
        primary: {
            bg: 'bg-red-500/10',
            icon: 'text-red-500',
            hover: 'group-hover:bg-red-500',
            trend: 'bg-red-500/10'
        },
        blue: {
            bg: 'bg-blue-500/10',
            icon: 'text-blue-500',
            hover: 'group-hover:bg-blue-500',
            trend: 'bg-blue-500/10'
        },
        purple: {
            bg: 'bg-purple-500/10',
            icon: 'text-purple-500',
            hover: 'group-hover:bg-purple-500',
            trend: 'bg-purple-500/10'
        },
        orange: {
            bg: 'bg-orange-500/10',
            icon: 'text-orange-500',
            hover: 'group-hover:bg-orange-500',
            trend: 'bg-orange-500/10'
        },
        green: {
            bg: 'bg-emerald-500/10',
            icon: 'text-emerald-500',
            hover: 'group-hover:bg-emerald-500',
            trend: 'bg-emerald-500/10'
        },
        red: {
            bg: 'bg-red-500/10',
            icon: 'text-red-500',
            hover: 'group-hover:bg-red-500',
            trend: 'bg-red-500/10'
        }
    };

    const colors = colorMap[variant];

    if (loading) {
        return (
            <div className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-3">
                    <div className="size-10 rounded-xl bg-slate-700"></div>
                    <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
                </div>
                <div className="h-3 w-24 bg-slate-700 rounded mb-2"></div>
                <div className="h-8 w-32 bg-slate-700 rounded"></div>
            </div>
        );
    }

    return (
        <div
            className={`bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm hover:border-${variant}-500/30 transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer' : ''
                }`}
            onClick={onClick}
        >
            {/* Glassmorphism overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div
                        className={`size-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon} ${colors.hover} group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    {trend && (
                        <span
                            className={`flex items-center ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                                } text-xs font-bold ${trend.isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'} px-2 py-1 rounded-full transition-transform group-hover:scale-105`}
                        >
                            {trend.isPositive ? '+' : ''}
                            {trend.value}%{' '}
                            <span className="material-symbols-outlined text-[14px] ml-0.5">
                                {trend.isPositive ? 'trending_up' : 'trending_down'}
                            </span>
                        </span>
                    )}
                </div>

                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">
                    {title}
                </p>

                <h3 className="text-2xl font-black text-white group-hover:text-white transition-all">
                    {value}
                </h3>

                {/* Mini sparkline */}
                {sparklineData && sparklineData.length > 0 && (
                    <div className="mt-3 h-8 flex items-end gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                        {sparklineData.map((val, idx) => {
                            const maxVal = Math.max(...sparklineData);
                            const height = (val / maxVal) * 100;
                            return (
                                <div
                                    key={idx}
                                    className={`flex-1 ${colors.bg} rounded-t transition-all duration-300`}
                                    style={{
                                        height: `${height}%`,
                                        transitionDelay: `${idx * 20}ms`
                                    }}
                                ></div>
                            );
                        })}
                    </div>
                )}

                {trend?.label && (
                    <p className="text-[10px] text-slate-500 mt-2 group-hover:text-slate-400 transition-colors">
                        {trend.label}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
