import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import ProductCard from '@components/store/ProductCard';
import { useTranslation } from '../../hooks/useTranslation';

const WishlistPage: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([
    { id: '1', name: 'Laptop Gaming ASUS ROG Strix G15', price: '23.800.000₫', oldPrice: '28.000.000₫', tag: '-15%', inStock: true },
    { id: '3', name: 'MacBook Pro 14 M3 Pro', price: '48.990.000₫', oldPrice: '52.000.000₫', inStock: true },
    { id: '6', name: 'ASUS TUF Gaming RTX 4070 Ti', price: '24.500.000₫', tag: 'Hot', inStock: false },
  ]);

  const removeItem = (id: string) => {
    if (confirm(t('wishlist.actions.confirmRemove'))) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const clearAll = () => {
    if (confirm(t('wishlist.actions.confirmClearAll'))) {
      setItems([]);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-[1440px]">
        <div className="size-32 bg-surface-dark border border-border-dark rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[64px] text-slate-700 fill">favorite</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{t('wishlist.empty.title')}</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">{t('wishlist.empty.description')}</p>
        <Link to="/catalog">
          <Button icon="arrow_back" size="lg">{t('wishlist.empty.explore')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1440px]">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 fill text-4xl">favorite</span>
            {t('wishlist.title')}
          </h1>
          <p className="text-slate-400 mt-2">{t('wishlist.subtitle', { count: items.length })}</p>
        </div>
        <Button variant="outline" size="sm" icon="delete" onClick={clearAll} className="text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500">
          {t('wishlist.actions.clearAll')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => removeItem(item.id)}
              className="absolute top-[-10px] right-[-10px] z-20 size-8 bg-background-dark border border-border-dark rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
              title={t('wishlist.actions.remove')}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <ProductCard
              id={item.id}
              name={item.name}
              price={item.price}
              oldPrice={item.oldPrice}
              tag={item.tag}
              imageIndex={index + 30}
            />

            {!item.inStock && (
              <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center rounded-2xl pointer-events-none">
                <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest border border-red-400 shadow-xl transform -rotate-12">{t('wishlist.outOfStock')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;






