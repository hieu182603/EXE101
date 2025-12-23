import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  tag?: string;
  rating?: number;
  imageIndex?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  oldPrice,
  tag,
  rating,
  imageIndex = 0,
}) => {
  // Generate placeholder image URL based on index
  const imageUrl = `https://picsum.photos/seed/${imageIndex}/400/400`;

  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="relative bg-surface-dark border border-border-dark rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-[#0a0a0a]">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Tag Badge */}
          {tag && (
            <div className="absolute top-3 left-3">
              <span
                className={`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg ${
                  tag === 'Hot' || tag === 'New'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : tag === 'Hết hàng'
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    : 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/50'
                }`}
              >
                {tag}
              </span>
            </div>
          )}

          {/* Rating (if provided) */}
          {rating !== undefined && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
              <span className="text-xs font-bold text-white">{rating}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-white line-clamp-2 mb-3 group-hover:text-red-400 transition-colors min-h-[2.5rem]">
            {name}
          </h3>

          {/* Price Section */}
          <div className="mt-auto">
            {oldPrice ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black text-red-500">{price}</span>
                <span className="text-sm text-slate-500 line-through">{oldPrice}</span>
              </div>
            ) : (
              <span className="text-lg font-black text-white">{price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
