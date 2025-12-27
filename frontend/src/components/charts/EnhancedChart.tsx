import React, { type ReactElement } from 'react';


interface EnhancedChartProps {
    children: ReactElement;
    title?: string;
    subtitle?: string;
    actions?: ReactElement;
    height?: number | string;
    loading?: boolean;
    className?: string;
}

const EnhancedChart: React.FC<EnhancedChartProps> = ({
    children,
    title,
    subtitle,
    actions,
    height = 320,
    loading = false,
    className = ''
}) => {
    if (loading) {
        return (
            <div className={`bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm ${className}`}>
                <div className="animate-pulse">
                    {(title || subtitle) && (
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                {title && <div className="h-6 w-40 bg-slate-700/50 rounded mb-2"></div>}
                                {subtitle && <div className="h-4 w-64 bg-slate-700/50 rounded"></div>}
                            </div>
                            {actions && <div className="h-8 w-32 bg-slate-700/50 rounded-lg"></div>}
                        </div>
                    )}
                    <div
                        className="w-full bg-slate-700/20 rounded-lg relative overflow-hidden"
                        style={{ height: typeof height === 'number' ? `${height}px` : height }}
                    >
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm group hover:border-primary/20 transition-all ${className}`}>
            {/* Glassmorphism overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

            {(title || subtitle || actions) && (
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        {title && (
                            <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && <div className="relative z-10">{actions}</div>}
                </div>
            )}

            <div
                className="w-full relative z-10 chart-container"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
            >
                {children}
            </div>
        </div>
    );
};

export default EnhancedChart;
