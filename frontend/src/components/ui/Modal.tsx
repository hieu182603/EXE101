
import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    'full': 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full ${sizeClasses[size] || sizeClasses.lg} bg-surface-dark border border-border-dark rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center justify-between border-b border-border-dark px-8 py-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <Button variant="ghost" icon="close" className="size-8 p-0" onClick={onClose} />
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border-dark px-8 py-5 bg-background-dark/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
