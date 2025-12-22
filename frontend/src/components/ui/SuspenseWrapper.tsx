import { Suspense } from 'react';
import type { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component for Suspense boundaries with loading fallback
 * 
 * Usage:
 * ```tsx
 * <SuspenseWrapper>
 *   <LazyComponent />
 * </SuspenseWrapper>
 * ```
 */
const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner size="lg" className="min-h-screen" />
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;

