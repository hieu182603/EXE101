
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/store/ProductCard';
import { productService } from '@services/productService';
import type { Product } from '@/types/product';

interface ProductData {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  tag?: string;
  rating: number;
  inStock: boolean;
}

const ITEMS_PER_PAGE = 12;

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load real products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products: Product[] = await productService.getAllProducts();

        // Normalize data for UI
        const mapped: ProductData[] = products.map((p, idx) => ({
          id: p.id,
          name: p.name,
          brand: (p as any).brand || p.category?.name || 'Khác',
          category: p.category?.name || 'Khác',
          price: p.price || 0,
          oldPrice: (p as any).oldPrice,
          tag: undefined,
          rating: 5,
          inStock: (p.stock ?? 0) > 0,
        }));

        setAllProducts(mapped);
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter States initialized from URL if present
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const [minRating, setMinRating] = useState<number | null>(null);
  const [availability, setAvailability] = useState<'all' | 'inStock' | 'outOfStock' | 'sale'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [sortBy, setSortBy] = useState('newest');
  
  // UI States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Special Flash Sale Mode State
  const [isFlashSaleMode, setIsFlashSaleMode] = useState(false);

  // Sync state with URL params on mount/update
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const brandParam = searchParams.get('brand');
    const filterParam = searchParams.get('filter');
    
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }

    if (brandParam) {
      setSelectedBrands([brandParam]);
    } else {
      setSelectedBrands([]);
    }

    if (filterParam === 'flash-sale') {
      setIsFlashSaleMode(true);
    } else {
      setIsFlashSaleMode(false);
    }
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, minRating, availability, priceRange, sortBy, isFlashSaleMode]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          allProducts
            .map((p) => p.category)
            .filter((c): c is string => Boolean(c))
        )
      ),
    [allProducts]
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          allProducts
            .map((p) => p.brand)
            .filter((b): b is string => Boolean(b))
        )
      ),
    [allProducts]
  );

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply Flash Sale Filter if active
    if (isFlashSaleMode) {
      // Filter for items that have an oldPrice (indicating a sale) and oldPrice > price
      result = result.filter(p => p.oldPrice && p.oldPrice > p.price);
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    if (minRating !== null) {
      result = result.filter(p => p.rating >= minRating);
    }

    if (availability === 'inStock') {
      result = result.filter(p => p.inStock);
    } else if (availability === 'outOfStock') {
      result = result.filter(p => !p.inStock);
    } else if (availability === 'sale') {
      result = result.filter(p => p.oldPrice && p.oldPrice > p.price);
    }

    const minP = Math.min(priceRange[0], priceRange[1]);
    const maxP = Math.max(priceRange[0], priceRange[1]);

    result = result.filter(p => p.price >= minP && p.price <= maxP);

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allProducts, selectedCategories, selectedBrands, minRating, availability, priceRange, sortBy, isFlashSaleMode]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  // Build compact pagination list with ellipsis
  const paginationItems = useMemo(() => {
    const pages: Array<number | 'ellipsis'> = [];
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const add = (p: number | 'ellipsis') => pages.push(p);
    const showRange = (start: number, end: number) => {
      for (let i = start; i <= end; i++) add(i);
    };

    const first = 1;
    const last = totalPages;
    const windowStart = Math.max(currentPage - 1, 2);
    const windowEnd = Math.min(currentPage + 1, totalPages - 1);

    add(first);
    if (windowStart > first + 1) add('ellipsis');
    showRange(windowStart, windowEnd);
    if (windowEnd < last - 1) add('ellipsis');
    add(last);

    return pages;
  }, [currentPage, totalPages]);

  const toggleFilter = (item: string, list: string[], setList: (val: string[]) => void, paramKey: string) => {
    let newList;
    if (list.includes(item)) {
      newList = list.filter(i => i !== item);
    } else {
      newList = [...list, item];
    }
    setList(newList);
    
    if (searchParams.get(paramKey)) {
        searchParams.delete(paramKey);
        setSearchParams(searchParams);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinRating(null);
    setAvailability('all');
    setPriceRange([0, 100000000]);
    setIsFlashSaleMode(false);
    setSearchParams({}); // Clear URL params
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, isMin: boolean) => {
    const val = parseInt(e.target.value);
    const minGap = 5000000;
    
    if (isMin) {
      const newMin = Math.min(val, priceRange[1] - minGap);
      setPriceRange([newMin, priceRange[1]]);
    } else {
      const newMax = Math.max(val, priceRange[0] + minGap);
      setPriceRange([priceRange[0], newMax]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isMin: boolean) => {
    let val = e.target.value === '' ? 0 : parseInt(e.target.value);
    if (isNaN(val)) val = 0;
    val = Math.max(0, Math.min(100000000, val));

    setPriceRange(prev => isMin ? [val, prev[1]] : [prev[0], val]);
  };

  const activeFilterCount = selectedCategories.length + selectedBrands.length + (minRating ? 1 : 0) + (availability !== 'all' ? 1 : 0) + (isFlashSaleMode ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1440px] px-4 lg:px-10 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-white font-medium">
            {isFlashSaleMode ? 'Flash Sale' : 'Tất cả sản phẩm'}
          </span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          {isFlashSaleMode ? (
            <span className="flex items-center gap-3 text-red-500 italic">
              <span className="material-symbols-outlined text-4xl animate-pulse">local_fire_department</span>
              FLASH SALE
            </span>
          ) : 'Tất Cả Sản Phẩm'}
        </h1>
        <p className="text-slate-400 mt-2">Khám phá {filteredProducts.length} sản phẩm {isFlashSaleMode ? 'đang giảm giá sốc' : 'công nghệ đỉnh cao'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar Filters */}
        <aside className={`w-full lg:w-[300px] space-y-6 flex-shrink-0 transition-all duration-300 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-dark mb-4">
              <h3 className="font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
                Bộ lọc
              </h3>
              <button 
                onClick={clearAllFilters}
                className="text-[10px] font-black text-primary uppercase hover:underline"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-4">
              {/* Flash Sale Filter Indicator */}
              {isFlashSaleMode && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/50 flex items-center justify-between">
                  <span className="text-sm font-bold text-red-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    Đang xem Flash Sale
                  </span>
                  <button onClick={clearAllFilters} className="text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              )}

              {/* Category Filter */}
              <details open className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors list-none">
                  <span className="text-sm font-bold text-white">Danh mục</span>
                  <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-border-dark/50">
                  {categories.map((cat, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group/item">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories, 'category')}
                        className="w-4 h-4 rounded bg-background-dark border-border-dark text-primary focus:ring-primary focus:ring-offset-background-dark" 
                      />
                      <span className="text-sm text-slate-400 group-hover/item:text-white transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Brand Filter */}
              <details open className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors list-none">
                  <span className="text-sm font-bold text-white">Thương hiệu</span>
                  <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-border-dark/50">
                  {brands.map((brand, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group/item">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands, 'brand')}
                        className="w-4 h-4 rounded bg-background-dark border-border-dark text-primary focus:ring-primary focus:ring-offset-background-dark" 
                      />
                      <span className="text-sm text-slate-400 group-hover/item:text-white transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </details>
              
               {/* Status Filter */}
              <details open className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors list-none">
                  <span className="text-sm font-bold text-white">Trạng thái</span>
                  <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-border-dark/50">
                  <label className="flex items-center gap-3 cursor-pointer group/item">
                    <input 
                      type="radio" 
                      name="availability"
                      checked={availability === 'all'}
                      onChange={() => setAvailability('all')}
                      className="w-4 h-4 rounded-full bg-background-dark border-border-dark text-primary focus:ring-primary focus:ring-offset-background-dark" 
                    />
                    <span className="text-sm text-slate-400 group-hover/item:text-white transition-colors">Tất cả</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group/item">
                    <input 
                      type="radio" 
                      name="availability"
                      checked={availability === 'inStock'}
                      onChange={() => setAvailability('inStock')}
                      className="w-4 h-4 rounded-full bg-background-dark border-border-dark text-primary focus:ring-primary focus:ring-offset-background-dark" 
                    />
                    <span className="text-sm text-slate-400 group-hover/item:text-white transition-colors">Sẵn hàng</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group/item">
                    <input 
                      type="radio" 
                      name="availability"
                      checked={availability === 'outOfStock'}
                      onChange={() => setAvailability('outOfStock')}
                      className="w-4 h-4 rounded-full bg-background-dark border-border-dark text-primary focus:ring-primary focus:ring-offset-background-dark" 
                    />
                    <span className="text-sm text-slate-400 group-hover/item:text-white transition-colors">Cháy hàng</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group/item">
                    <input 
                      type="radio" 
                      name="availability"
                      checked={availability === 'sale'}
                      onChange={() => setAvailability('sale')}
                      className="w-4 h-4 rounded-full bg-background-dark border-border-dark text-primary focus:ring-primary focus:ring-offset-background-dark" 
                    />
                    <span className="text-sm text-slate-400 group-hover/item:text-white transition-colors">Đang giảm giá</span>
                  </label>
                </div>
              </details>

              {/* Rating Filter */}
              <details open className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors list-none">
                  <span className="text-sm font-bold text-white">Đánh giá</span>
                  <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-5 pb-5 pt-1 flex flex-col gap-2 border-t border-border-dark/50">
                  {[5, 4, 3].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setMinRating(minRating === star ? null : star)}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${minRating === star ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-white/5'}`}
                    >
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`material-symbols-outlined text-sm ${i < star ? 'fill' : ''}`}>star</span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-400">Từ {star} sao</span>
                    </button>
                  ))}
                </div>
              </details>

              {/* Price Range */}
              <details open className="group bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors list-none">
                  <span className="text-sm font-bold text-white">Khoảng giá</span>
                  <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-5 pb-6 pt-2 border-t border-border-dark/50">
                   <div className="flex justify-between text-xs text-slate-500 font-bold mb-6">
                    <span>0đ</span>
                    <span>100trđ</span>
                  </div>
                  
                  <div className="relative h-2 mb-6 w-full">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-background-dark border border-border-dark rounded-full"></div>
                    <div 
                      className="absolute top-0 h-1.5 bg-primary rounded-full pointer-events-none"
                      style={{
                        left: `${(Math.min(priceRange[0], priceRange[1]) / 100000000) * 100}%`,
                        width: `${(Math.abs(priceRange[1] - priceRange[0]) / 100000000) * 100}%`
                      }}
                    ></div>
                    <input 
                      type="range"
                      min="0"
                      max="100000000"
                      step="1000000"
                      value={priceRange[0]}
                      onChange={(e) => handleSliderChange(e, true)}
                      className="absolute top-[-5px] left-0 w-full h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg z-20"
                    />
                    <input 
                      type="range"
                      min="0"
                      max="100000000"
                      step="1000000"
                      value={priceRange[1]}
                      onChange={(e) => handleSliderChange(e, false)}
                      className="absolute top-[-5px] left-0 w-full h-4 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg z-30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-background-dark border border-border-dark rounded-xl px-3 py-2">
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Từ</p>
                      <input type="number" value={priceRange[0]} onChange={(e) => handleInputChange(e, true)} className="w-full bg-transparent text-xs text-white font-bold outline-none placeholder-slate-600" min={0} max={100000000} />
                    </div>
                    <div className="flex-1 bg-background-dark border border-border-dark rounded-xl px-3 py-2 text-right">
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Đến</p>
                      <input type="number" value={priceRange[1]} onChange={(e) => handleInputChange(e, false)} className="w-full bg-transparent text-xs text-white font-bold outline-none text-right placeholder-slate-600" min={0} max={100000000} />
                    </div>
                  </div>
                </div>
              </details>

            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full">
           <div className="flex flex-col-reverse sm:flex-row justify-between lg:justify-end items-center mb-6 gap-4">
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-surface-dark border border-border-dark rounded-xl font-bold text-white text-xs hover:border-primary transition-all relative w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showMobileFilters ? 'filter_list_off' : 'filter_list'}
              </span>
              {showMobileFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
              {!showMobileFilters && activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-surface-dark border border-border-dark rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-white focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option value="newest">Mới nhất</option>
                    <option value="price-low">Giá: Thấp đến Cao</option>
                    <option value="price-high">Giá: Cao đến Thấp</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className="h-[360px] rounded-2xl border border-border-dark bg-surface-dark animate-pulse"
                />
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {currentProducts.map((p) => {
                return (
                  <ProductCard 
                    key={p.id} 
                    id={p.id} 
                    name={p.name} 
                    price={`${p.price.toLocaleString()}₫`} 
                    oldPrice={p.oldPrice ? `${p.oldPrice.toLocaleString()}₫` : undefined} 
                    tag={
                      p.oldPrice && p.oldPrice > p.price
                        ? `-${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%`
                        : p.tag
                    } 
                    rating={p.rating} 
                    imageIndex={parseInt(p.id) + 20}
                  />
                );
              })}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[64px] text-slate-700 mb-4">search_off</span>
              <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-slate-500">Hãy thử thay đổi bộ lọc để tìm kiếm kết quả phù hợp hơn.</p>
              <button onClick={clearAllFilters} className="mt-6 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary hover:text-black transition-all">Xóa tất cả bộ lọc</button>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-12 pt-8 border-t border-border-dark flex justify-end">
              <nav className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1} 
                  className="size-8 rounded-lg border border-border-dark text-slate-500 hover:text-white hover:border-primary transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border-dark text-xs"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                {paginationItems.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-slate-600 text-xs select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button 
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`size-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        currentPage === item
                        ? 'bg-primary text-black shadow-lg shadow-primary/30'
                        : 'border border-border-dark text-slate-500 hover:text-white hover:border-primary'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages} 
                  className="size-8 rounded-lg border border-border-dark text-slate-500 hover:text-white hover:border-primary transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border-dark text-xs"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
