import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string | number;
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
  rating = 5,
  imageIndex = 0,
}) => {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdded) return;

    setIsAdded(true);
    // TODO: integrate real cart logic here
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  return (
    <div
      onClick={handleViewDetails}
      className="group relative flex flex-col bg-[#111] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:-translate-y-1 cursor-pointer h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full bg-[#0a0a0a] overflow-hidden">
        {/* Discount / Tag */}
        {tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1a]/90 backdrop-blur-sm border border-red-500/50 text-red-500 text-[11px] font-black tracking-wider shadow-lg">
              {tag}
            </span>
          </div>
        )}

        <img
          src={`https://picsum.photos/400/300?random=${imageIndex}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          alt={name}
        />

        {/* Hover Actions (Eye / Heart) */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="size-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-colors shadow-lg">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button className="size-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-colors shadow-lg">
            <span className="material-symbols-outlined text-[18px]">favorite</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`material-symbols-outlined text-[14px] ${
                i < rating ? 'text-yellow-400 fill' : 'text-zinc-700'
              }`}
            >
              star
            </span>
          ))}
        </div>

        {/* Product Name */}
        <h3 className="text-white font-bold text-sm leading-snug mb-4 line-clamp-2 min-h-[2.5em] group-hover:text-red-500 transition-colors">
          {name}
        </h3>

        {/* Price & Action */}
        <div className="mt-auto space-y-3">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-xs text-zinc-500 line-through font-medium">
                {oldPrice}
              </span>
            )}
            <span className="text-xl font-black text-red-500 tracking-tight">
              {price}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
              isAdded
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] fill">
              {isAdded ? 'check' : 'add_shopping_cart'}
            </span>
            {isAdded ? 'Đã thêm' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
