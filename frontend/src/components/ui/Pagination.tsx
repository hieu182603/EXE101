
import React from 'react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-dark bg-[#112022] px-6 py-4 rounded-b-2xl">
      <div className="text-sm text-gray-500 font-medium">
        Trang <span className="text-white font-bold">{currentPage}</span> / {totalPages}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-dark bg-surface-dark text-gray-400 hover:border-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-dark"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        
        {/* Simple logic: Show all pages if <= 5, otherwise simplified */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
           // Logic to show limited page numbers can be expanded here. 
           // For now, keeping it simple as usually admin views show range around current.
           if (totalPages > 7 && Math.abs(currentPage - page) > 2 && page !== 1 && page !== totalPages) {
              if (Math.abs(currentPage - page) === 3) return <span key={page} className="flex h-9 w-9 items-center justify-center text-gray-600">...</span>;
              return null;
           }

           return (
             <button 
               key={page}
               onClick={() => onPageChange(page)}
               className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold transition-all ${
                 currentPage === page
                 ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                 : 'border border-border-dark bg-surface-dark text-gray-400 hover:border-primary hover:text-white'
               }`}
             >
               {page}
             </button>
           );
        })}

        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-dark bg-surface-dark text-gray-400 hover:border-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-dark"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
