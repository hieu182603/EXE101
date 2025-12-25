import React from 'react';

const ZALO_OA_ID = '0919985956'; // <-- replace with real OA id if available

const ZaloChat: React.FC = () => {
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <a
        href={`https://zalo.me/${ZALO_OA_ID}`}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-3 bg-[rgb(216,35,35)] hover:bg-[#e84646] text-white px-4 py-3 rounded-full shadow-xl border border-green-700 transition-colors"
        title="Chat với Zalo OA"
      >
        <img src="/img/Icon_of_Zalo.svg.webp" alt="Zalo" className="w-8 h-8 rounded-full object-cover" />
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold leading-tight">Chat với chúng tôi</div>
          <div className="text-[10px] opacity-90">Zalo OA</div>
        </div>
      </a>
    </div>
  );
};

export default ZaloChat;


