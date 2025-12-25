import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface LanguageSwitcherProps {
  className?: string;
  showText?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showText = false
}) => {
  const { changeLanguage, getCurrentLanguage } = useTranslation();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi';
    changeLanguage(newLang);
  };

  const getLanguageLabel = () => {
    return currentLang === 'vi' ? 'VN' : 'EN';
  };

  const getLanguageName = () => {
    return currentLang === 'vi' ? 'Tiếng Việt' : 'English';
  };

  return (
    <button
      onClick={handleLanguageChange}
      className={`size-10 rounded-full border border-border-dark bg-surface-dark text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all font-black text-[10px] ${className}`}
      title={currentLang === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <span>{getLanguageLabel()}</span>
      {showText && (
        <span className="hidden sm:inline ml-2 text-xs">
          {getLanguageName()}
        </span>
      )}
    </button>
  );
};

export default LanguageSwitcher;
