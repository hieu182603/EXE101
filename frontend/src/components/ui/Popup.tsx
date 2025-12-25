import React, { useEffect, useState } from 'react';

interface PopupProps {
  storageKey?: string; // key to control once-session behavior
}

const Popup: React.FC<PopupProps> = ({ storageKey = 'site_popup_shown' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Show popup if not shown in this session
      const shown = sessionStorage.getItem(storageKey);
      if (!shown) {
        setVisible(true);
        sessionStorage.setItem(storageKey, '1');
      }
    } catch (err) {
      // fallback: show popup
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div className="relative max-w-3xl w-full bg-background-dark border border-border-dark rounded-2xl overflow-hidden shadow-2xl z-10">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 size-8 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white z-20"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
        <img
          src="/img/banner/banner1.png"
          alt="Popup Ad"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
};

export default Popup;


