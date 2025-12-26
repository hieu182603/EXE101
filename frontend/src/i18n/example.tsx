// Example component showing how to use i18next
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const I18nExample: React.FC = () => {
  const { t, changeLanguage, getCurrentLanguage, isLanguage } = useTranslation();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.home')}</h1>

      {/* Language Switcher */}
      <div className="flex items-center gap-4">
        <span>{t('nav.language')}:</span>
        <LanguageSwitcher showText={true} />
        <span className="text-sm text-gray-500">
          Current: {getCurrentLanguage().toUpperCase()}
        </span>
      </div>

      {/* Manual language switch buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => changeLanguage('vi')}
          className={`px-4 py-2 rounded ${isLanguage('vi') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tiếng Việt
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-4 py-2 rounded ${isLanguage('en') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
      </div>

      {/* Examples of different translation patterns */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Common translations:</h3>
          <p>{t('common.save')} | {t('common.cancel')} | {t('common.loading')}</p>
        </div>

        <div>
          <h3 className="font-semibold">Navigation:</h3>
          <p>{t('nav.home')} | {t('nav.products')} | {t('nav.cart')}</p>
        </div>

        <div>
          <h3 className="font-semibold">Authentication:</h3>
          <p>{t('auth.login.title')} | {t('auth.register.title')}</p>
        </div>

        <div>
          <h3 className="font-semibold">With interpolation:</h3>
          <p>{t('validation.minLength', { count: 8 })}</p>
        </div>

        <div>
          <h3 className="font-semibold">Error messages:</h3>
          <p className="text-red-500">{t('errors.network')} | {t('errors.server')}</p>
        </div>

        <div>
          <h3 className="font-semibold">Success messages:</h3>
          <p className="text-green-500">{t('success.saved')} | {t('success.updated')}</p>
        </div>
      </div>
    </div>
  );
};

export default I18nExample;






