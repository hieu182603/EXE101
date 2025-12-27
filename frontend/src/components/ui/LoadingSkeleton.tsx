import React from 'react';

interface LoadingSkeletonProps {
    type?: 'card' | 'chart' | 'table' | 'text' | 'avatar' | 'stat-grid';
    count?: number;
    className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    type = 'card',
    count = 1,
    className = ''
}) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm animate-pulse ${className}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="size-10 rounded-xl bg-slate-700/50"></div>
                            <div className="h-6 w-20 bg-slate-700/50 rounded-full"></div>
                        </div>
                        <div className="h-3 w-24 bg-slate-700/50 rounded mb-2"></div>
                        <div className="h-8 w-32 bg-slate-700/50 rounded"></div>
                    </div>
                );

            case 'chart':
                return (
                    <div className={`bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm animate-pulse ${className}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <div className="h-6 w-40 bg-slate-700/50 rounded mb-2"></div>
                                <div className="h-4 w-64 bg-slate-700/50 rounded"></div>
                            </div>
                            <div className="h-8 w-32 bg-slate-700/50 rounded-lg"></div>
                        </div>
                        <div className="h-[320px] w-full bg-slate-700/20 rounded-lg relative overflow-hidden">
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-sm animate-pulse ${className}`}>
                        <div className="h-6 w-40 bg-slate-700/50 rounded mb-6"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-12 w-12 bg-slate-700/50 rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-4 w-20 bg-slate-700/50 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className={`space-y-2 animate-pulse ${className}`}>
                        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
                    </div>
                );

            case 'avatar':
                return (
                    <div className={`size-10 rounded-full bg-slate-700/50 animate-pulse ${className}`}></div>
                );

            case 'stat-grid':
                return (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-surface-dark border border-border-dark p-5 rounded-2xl shadow-sm animate-pulse">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="size-10 rounded-xl bg-slate-700/50"></div>
                                    <div className="h-6 w-20 bg-slate-700/50 rounded-full"></div>
                                </div>
                                <div className="h-3 w-24 bg-slate-700/50 rounded mb-2"></div>
                                <div className="h-8 w-32 bg-slate-700/50 rounded"></div>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
            ))}
        </>
    );
};

export default LoadingSkeleton;

// Add shimmer animation to global CSS if not exists
// @keyframes shimmer {
//   100% {
//     transform: translateX(100%);
//   }
// }
