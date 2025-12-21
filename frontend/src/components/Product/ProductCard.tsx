import React from 'react';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onQuickView 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className="bg-white rounded-xl hover:shadow-2xl transition-all duration-300 group border border-gray-100 overflow-hidden flex flex-col h-full"
      onClick={() => onQuickView && onQuickView(product)}
      style={{ cursor: onQuickView ? 'pointer' : 'default' }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 h-48">
        <img 
          src={product.images && product.images.length > 0 ? product.images[0].url : (product.url || '/img/product-default.png')} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              NEW
            </span>
          )}
          {product.isSale && discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>
        {/* Quick Actions */}
        {/* Đã bỏ Eye button */}
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <div className="text-base uppercase tracking-wide mb-4 text-gray-700 text-left">
          {product.category?.name?.replace('-', ' ')}
        </div>
        {/* Product Name */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-left line-clamp-2 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        {/* Description */}
        {product.description && (
          <div className="text-lg text-gray-500 mb-4 text-left line-clamp-2">{product.description}</div>
        )}
        {/* Brand */}
        <div className="text-sm text-gray-600 mb-3" style={{ display: 'none' }}>
          {product.brand}
        </div>
        {/* Spacer để đẩy price và button xuống cuối */}
        <div className="flex-1" />
        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-3xl font-bold text-red-600 text-left">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-3">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {/* Add to Cart Button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
          className="w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-auto bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 