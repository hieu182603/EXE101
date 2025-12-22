
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '@components/store/ProductCard';
import Button from '@components/ui/Button';
import { productService } from '@services/productService';
import type { Product } from '@types/product';

interface ProductDisplay {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  tag?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60 + 45 * 60); // Mock countdown
  const [activeTab, setActiveTab] = useState<'new' | 'best'>('new');
  
  // Product states
  const [flashSaleProducts, setFlashSaleProducts] = useState<ProductDisplay[]>([]);
  const [newProducts, setNewProducts] = useState<ProductDisplay[]>([]);
  const [laptopProducts, setLaptopProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform Product to ProductDisplay format
  const transformProduct = (product: Product): ProductDisplay => {
    const price = product.price.toLocaleString('vi-VN') + '₫';
    let oldPrice: string | undefined;
    let tag: string | undefined;
    
    // Check if product has discount (you may need to add originalPrice field to Product type)
    // For now, we'll use a simple heuristic or leave it empty
    
    return {
      id: product.id,
      name: product.name,
      price,
      oldPrice,
      tag: product.stock === 0 ? 'Hết hàng' : tag
    };
  };

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Load flash sale (top selling) products
        const topSelling = await productService.getTopSellingProducts(5);
        setFlashSaleProducts(topSelling.map(transformProduct));
        
        // Load new products
        const newProductsData = await productService.getNewProducts(5);
        // Combine laptops, pcs, accessories
        const allNew = [
          ...(newProductsData.laptops || []),
          ...(newProductsData.pcs || []),
          ...(newProductsData.accessories || [])
        ].slice(0, 5);
        setNewProducts(allNew.map(transformProduct));
        
        // Load laptop products
        const laptops = await productService.getProductsByType('laptop', 5);
        setLaptopProducts(laptops.map(transformProduct));
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return (
      <div className="flex items-center gap-2 text-red-500 font-mono text-xl font-bold">
         <span className="bg-[#1a0505] border border-red-900/50 px-2 py-1 rounded">{h.toString().padStart(2, '0')}</span>
         <span>:</span>
         <span className="bg-[#1a0505] border border-red-900/50 px-2 py-1 rounded">{m.toString().padStart(2, '0')}</span>
         <span>:</span>
         <span className="bg-[#1a0505] border border-red-900/50 px-2 py-1 rounded">{s.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  const categories = [
    { name: 'Laptop Gaming', icon: 'laptop_chromebook' },
    { name: 'Macbook', icon: 'laptop_mac' },
    { name: 'PC Đồ họa', icon: 'desktop_windows' },
    { name: 'Màn hình', icon: 'monitor' },
    { name: 'Bàn phím', icon: 'keyboard' },
    { name: 'Chuột', icon: 'mouse' },
    { name: 'Tai nghe', icon: 'headphones' },
    { name: 'Linh kiện', icon: 'memory' },
  ];

  return (
    <div className="flex flex-col bg-background-dark min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="pt-6 pb-12 px-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[480px]">
            {/* Main Banner Slider */}
            <div 
              onClick={() => navigate('/catalog')}
              className="lg:col-span-8 relative rounded-2xl overflow-hidden group border border-border-dark cursor-pointer h-[400px] lg:h-full shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1600" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90" 
                alt="Main Banner" 
              />
              {/* Gradient: Black to Transparent */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 sm:p-12">
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg w-fit mb-3 shadow-lg shadow-red-600/30">
                  Flagship Series
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  NEXT LEVEL <br/> GAMING PERFORMANCE
                </h2>
                <p className="text-slate-300 text-lg mb-6 max-w-lg hidden sm:block">
                  Trải nghiệm sức mạnh đỉnh cao với dòng RTX 40 Series mới nhất. Ưu đãi đặt trước tặng ngay bộ quà 5 triệu.
                </p>
                <Button 
                  size="lg" 
                  className="w-fit bg-white !text-black border-none hover:bg-red-600 hover:!text-white transition-all shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/catalog');
                  }}
                >
                  Khám phá ngay
                </Button>
              </div>
            </div>

            {/* Side Banners */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full">
              <div 
                onClick={() => navigate('/catalog')}
                className="flex-1 relative rounded-2xl overflow-hidden group border border-border-dark cursor-pointer min-h-[200px]"
              >
                 <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 transition-all" alt="Sub Banner 1" />
                 <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/80 p-6 flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white uppercase italic">Esport Gear</h3>
                    <p className="text-sm text-red-500 font-bold">Chuột & Phím cơ giảm tới 40%</p>
                 </div>
              </div>
              <div 
                onClick={() => navigate('/quote')}
                className="flex-1 relative rounded-2xl overflow-hidden group border border-border-dark cursor-pointer min-h-[200px]"
              >
                 <img src="https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 transition-all" alt="Sub Banner 2" />
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80 p-6 flex flex-col justify-center text-right items-end">
                    <h3 className="text-2xl font-black text-white uppercase italic">Build PC</h3>
                    <p className="text-sm text-red-500 font-bold">Miễn phí lắp đặt & Vệ sinh</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. USP Bar */}
      <section className="pb-12 px-4 mt-7">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'local_shipping', title: 'Miễn phí vận chuyển', sub: 'Cho đơn từ 2.000.000đ' },
              { icon: 'verified_user', title: 'Bảo hành chính hãng', sub: '100% Full VAT' },
              { icon: 'assignment_return', title: 'Đổi trả 15 ngày', sub: 'Lỗi là đổi mới' },
              { icon: 'support_agent', title: 'Hỗ trợ 24/7', sub: 'Kỹ thuật viên chuyên nghiệp' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-dark border border-border-dark p-4 rounded-xl hover:border-red-500/50 hover:bg-surface-accent transition-all group">
                <span className="material-symbols-outlined text-3xl text-white group-hover:text-red-500 transition-colors">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flash Sale Section - Red Dark Aesthetic */}
      <section className="pb-12 px-4">
        <div className="mx-auto max-w-[1440px]">
          {/* Main Container - Dark Red Gradient */}
          <div className="bg-[#2a0a0a] border border-red-900/40 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 relative z-10">
               <div className="flex flex-wrap items-center gap-6">
                 <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3 drop-shadow-md">
                    <span className="material-symbols-outlined text-red-500 text-4xl animate-pulse">local_fire_department</span>
                    FLASH SALE
                 </h2>
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pt-1">Kết thúc sau</span>
                    {formatTime(timeLeft)}
                 </div>
               </div>
               {/* UPDATED: Link points to filtered catalog */}
               <Link to="/catalog?filter=flash-sale" className="text-sm font-bold text-white hover:text-red-500 flex items-center gap-1 transition-colors group">
                  Xem tất cả <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>

            {/* Products Row - using the new Card Style */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-64 bg-surface-dark border border-border-dark rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : flashSaleProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
                {flashSaleProducts.map((p, i) => (
                  <div key={p.id} className="h-full">
                    <ProductCard 
                      id={p.id}
                      name={p.name}
                      price={p.price}
                      oldPrice={p.oldPrice}
                      tag={p.tag}
                      imageIndex={i + 50}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                <p>Chưa có sản phẩm flash sale</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section className="py-12 px-4 bg-[#0a0a0a] border-y border-white/5 mb-12 relative overflow-hidden">
        <div className="mx-auto max-w-[1440px] relative z-10">
           <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
             <span className="material-symbols-outlined text-red-500">category</span> Danh mục nổi bật
           </h3>
           <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {categories.map((cat, i) => (
                <Link to="/catalog" key={i} className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className="size-20 rounded-2xl bg-[#151515] border border-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all shadow-lg">
                    <span className="material-symbols-outlined text-3xl text-zinc-500 group-hover:text-white transition-colors">{cat.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-white text-center transition-colors uppercase">{cat.name}</span>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* 6. New Arrivals */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center justify-between mb-6 border-b border-border-dark pb-4">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">new_releases</span>
               Sản phẩm mới về
             </h3>
             <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('new')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all ${
                    activeTab === 'new' 
                    ? 'bg-red-600 text-white shadow-red-600/30' 
                    : 'bg-surface-dark border border-border-dark text-slate-400 hover:text-white hover:border-white'
                  }`}
                >
                  Mới nhất
                </button>
                <button 
                  onClick={() => setActiveTab('best')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all ${
                    activeTab === 'best' 
                    ? 'bg-red-600 text-white shadow-red-600/30' 
                    : 'bg-surface-dark border border-border-dark text-slate-400 hover:text-white hover:border-white'
                  }`}
                >
                  Bán chạy
                </button>
             </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 bg-surface-dark border border-border-dark rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 sm:gap-6">
              {newProducts.map((p, i) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  tag={p.tag}
                  imageIndex={i + 10}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">new_releases</span>
              <p>Chưa có sản phẩm mới</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Banner Strip - UPDATED */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-[1440px]">
           <div 
            onClick={() => navigate('/catalog')}
            className="relative h-64 rounded-[32px] overflow-hidden bg-black border border-white/10 group cursor-pointer shadow-2xl flex flex-col items-center justify-center text-center"
           >
              
              {/* Promo Label */}
              <div className="absolute top-6 left-8 flex items-center gap-2 opacity-70">
                 <img src="https://cdn-icons-png.flaticon.com/512/263/263142.png" className="w-5 h-5 invert" alt="Promo" />
                 <span className="text-white font-bold text-xs tracking-widest uppercase">Promo</span>
              </div>

              {/* Content */}
              <div className="relative z-10 px-4">
                 <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tighter">Setup góc máy mơ ước</h3>
                 <p className="text-slate-400 font-medium mb-8 text-sm sm:text-base">Giảm thêm 5% khi mua Combo (Bàn + Ghế + Gear)</p>
                 <button className="px-12 py-3.5 rounded-2xl border border-white text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                   Xem Combo
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* 7. Category Specific Section (e.g., Laptops) */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center justify-between mb-6 border-b border-border-dark pb-4">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
               <span className="material-symbols-outlined text-red-400">laptop_chromebook</span>
               Laptop Gaming & Đồ họa
             </h3>
             <Link to="/catalog" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest">Xem tất cả</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 bg-surface-dark border border-border-dark rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : laptopProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 sm:gap-6">
              {laptopProducts.map((p, i) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  oldPrice={p.oldPrice}
                  tag={p.tag}
                  imageIndex={i + 25}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">laptop_chromebook</span>
              <p>Chưa có sản phẩm laptop</p>
            </div>
          )}
          
          <div className="mt-12 text-center">
             <Link to="/catalog">
               <Button variant="outline" size="lg" className="w-full sm:w-auto px-16 border-border-dark text-slate-400 hover:text-white hover:border-white hover:bg-white/5">
                 Xem thêm 152 sản phẩm khác
               </Button>
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
