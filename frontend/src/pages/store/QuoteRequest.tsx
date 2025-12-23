
import React, { useState, useMemo, useEffect } from 'react';
import Button from '@components/ui/Button';
import { Input, Textarea } from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import { productService } from '@services/productService';
import { rfqService } from '@services/rfqService';
import type { Product } from '@types/product';

// --- Types & Mock Data ---
type Category = 'CPU' | 'Mainboard' | 'RAM' | 'VGA' | 'SSD' | 'HDD' | 'PSU' | 'Case' | 'Cooling' | 'Monitor' | 'Gear';

interface ProductPart {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
}

interface QuoteItem extends ProductPart {
  qty: number;
}

const CATEGORIES: { id: Category; label: string; icon: string; categoryName: string }[] = [
  { id: 'CPU', label: 'Vi xử lý', icon: 'memory', categoryName: 'cpu' },
  { id: 'Mainboard', label: 'Bo mạch chủ', icon: 'developer_board', categoryName: 'motherboard' },
  { id: 'RAM', label: 'RAM', icon: 'memory_alt', categoryName: 'ram' },
  { id: 'VGA', label: 'Card đồ họa', icon: 'videogame_asset', categoryName: 'gpu' },
  { id: 'SSD', label: 'SSD/HDD', icon: 'storage', categoryName: 'drive' },
  { id: 'PSU', label: 'Nguồn', icon: 'power', categoryName: 'psu' },
  { id: 'Case', label: 'Vỏ máy', icon: 'computer', categoryName: 'case' },
  { id: 'Cooling', label: 'Tản nhiệt', icon: 'mode_fan', categoryName: 'cooler' },
  { id: 'Monitor', label: 'Màn hình', icon: 'monitor', categoryName: 'monitor' },
  { id: 'Gear', label: 'Phụ kiện', icon: 'keyboard', categoryName: 'accessories' },
];

const QuoteRequest: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('CPU');
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [products, setProducts] = useState<ProductPart[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  // Load products by category
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const categoryInfo = CATEGORIES.find(c => c.id === activeCategory);
        if (!categoryInfo) return;

        // Load products by category name
        const productsData = await productService.getProductsByCategoryName(categoryInfo.categoryName);
        
        // Transform Product[] to ProductPart[]
        const transformedProducts: ProductPart[] = productsData.map((p: Product) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: activeCategory,
          image: p.images?.[0]?.url || p.url || 'https://picsum.photos/200/200'
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Handlers
  const addToQuote = (product: ProductPart) => {
    setQuoteItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromQuote = (id: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const totalPrice = quoteItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để báo giá.");
      return;
    }
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Vui lòng nhập tên và số điện thoại.");
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = quoteItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      
      // Option 1: Use RFQ service to find compatible builds
      // This will find builds that match the selected components
      const buildFilter = {
        amount: totalAmount,
        // Map quote items to build filter
        cpuId: quoteItems.find(item => item.category === 'CPU')?.id,
        motherboardId: quoteItems.find(item => item.category === 'Mainboard')?.id,
        ramId: quoteItems.find(item => item.category === 'RAM')?.id,
        gpuId: quoteItems.find(item => item.category === 'VGA')?.id,
        psuId: quoteItems.find(item => item.category === 'PSU')?.id,
        driveId: quoteItems.find(item => item.category === 'SSD' || item.category === 'HDD')?.id,
        coolerId: quoteItems.find(item => item.category === 'Cooling')?.id,
        caseId: quoteItems.find(item => item.category === 'Case')?.id,
        order: 'asc' as const,
        skip: 0,
        take: 5
      };

      // Get compatible builds
      const buildsResult = await rfqService.getBuilds(buildFilter);
      
      // For now, just show success message
      // In the future, you might want to show the compatible builds or send email
      alert(`Đã gửi yêu cầu báo giá thành công!\n\nTổng giá trị: ${totalAmount.toLocaleString('vi-VN')}₫\nSố linh kiện: ${quoteItems.length}\n\nChúng tôi sẽ liên hệ ${customerInfo.name} (${customerInfo.phone}) sớm nhất.`);
      
      // Reset form
      setQuoteItems([]);
      setCustomerInfo({ name: '', email: '', phone: '', note: '' });
    } catch (error) {
      console.error('Error submitting quote request:', error);
      alert("Gửi yêu cầu báo giá thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      {/* Header Banner */}
      <div className="bg-surface-dark border-b border-border-dark py-10 px-4">
        <div className="container mx-auto max-w-[1440px]">
           <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Xây Dựng Cấu Hình & Báo Giá</h1>
           <p className="text-slate-400 max-w-2xl">
             Chọn linh kiện để xây dựng bộ PC mơ ước của bạn hoặc tạo danh sách thiết bị cần mua cho doanh nghiệp. 
             Chúng tôi sẽ kiểm tra tính tương thích và gửi báo giá tốt nhất.
           </p>
        </div>
      </div>

      <div className="container mx-auto max-w-[1440px] px-4 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* LEFT: Product Selector (Catalog) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. Category Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar snap-x">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm whitespace-nowrap transition-all snap-start ${
                    activeCategory === cat.id
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-surface-dark text-slate-400 border-border-dark hover:text-white hover:border-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 2. Search & List */}
            <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 min-h-[600px]">
              <div className="mb-6">
                <Input 
                  icon="search" 
                  placeholder={`Tìm kiếm ${CATEGORIES.find(c => c.id === activeCategory)?.label}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-surface-dark border border-border-dark rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                  <div key={product.id} className="group flex gap-4 p-4 rounded-2xl border border-border-dark bg-background-dark/50 hover:border-primary/50 hover:bg-background-dark transition-all">
                    <div className="size-20 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center shrink-0 overflow-hidden">
                       <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start">
                           <Badge variant="neutral">{product.category}</Badge>
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-2 mt-2 group-hover:text-primary transition-colors">{product.name}</h4>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-white">{product.price.toLocaleString()}đ</span>
                        <Button size="sm" variant="secondary" icon="add" onClick={() => addToQuote(product)} className="h-8">
                           Thêm
                        </Button>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="col-span-full py-20 text-center text-slate-500">
                  <span className="material-symbols-outlined text-5xl mb-2">manage_search</span>
                  <p>Không tìm thấy linh kiện nào.</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Quote Summary & Form */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Sticky Container */}
            <div className="sticky top-24 space-y-6">
              
              {/* Selected Items List */}
              <div className="bg-surface-dark border border-border-dark rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[500px]">
                <div className="p-5 border-b border-border-dark bg-surface-accent/20 flex justify-between items-center">
                   <h3 className="font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary">list_alt</span>
                     Cấu hình của bạn
                   </h3>
                   <Badge variant="primary" dot>{quoteItems.length} linh kiện</Badge>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {quoteItems.length > 0 ? (
                    <div className="space-y-2">
                      {quoteItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-background-dark/50 border border-border-dark group">
                           <div className="size-12 rounded-lg bg-surface-dark border border-border-dark shrink-0 overflow-hidden">
                              <img src={item.image} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{item.name}</p>
                                <button onClick={() => removeFromQuote(item.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <p className="text-xs font-bold text-primary">{item.price.toLocaleString()}đ</p>
                                <div className="flex items-center gap-2 bg-surface-dark rounded-lg px-1 border border-border-dark">
                                   <button onClick={() => updateQty(item.id, -1)} className="size-5 flex items-center justify-center text-slate-400 hover:text-white"><span className="material-symbols-outlined text-[14px]">remove</span></button>
                                   <span className="text-[10px] font-bold text-white w-4 text-center">{item.qty}</span>
                                   <button onClick={() => updateQty(item.id, 1)} className="size-5 flex items-center justify-center text-slate-400 hover:text-white"><span className="material-symbols-outlined text-[14px]">add</span></button>
                                </div>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-500 gap-2">
                       <span className="material-symbols-outlined text-4xl opacity-50">add_circle_outline</span>
                       <p className="text-xs">Chưa có linh kiện nào được chọn</p>
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-border-dark bg-surface-accent/10">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-slate-400">Tổng dự kiến</span>
                      <span className="text-xl font-black text-white">{totalPrice.toLocaleString()}đ</span>
                   </div>
                   <p className="text-[10px] text-slate-500 text-right italic">* Giá chưa bao gồm VAT và ưu đãi doanh nghiệp</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 shadow-2xl">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                   <span className="material-symbols-outlined text-primary text-lg">send</span> 
                   Gửi yêu cầu báo giá
                 </h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                      placeholder="Tên người liên hệ / Doanh nghiệp" 
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="bg-background-dark text-sm h-10"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Số điện thoại" 
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="bg-background-dark text-sm h-10"
                      />
                      <Input 
                        placeholder="Email (Tùy chọn)" 
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="bg-background-dark text-sm h-10"
                      />
                    </div>
                    <Textarea 
                      placeholder="Ghi chú thêm (VD: Cần xuất VAT, Giao gấp...)"
                      value={customerInfo.note}
                      onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                      className="bg-background-dark text-sm min-h-[80px]"
                    />
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-full bg-gradient-to-r from-primary to-red-700 hover:to-red-600 shadow-lg shadow-red-900/30"
                      size="lg"
                      icon="rocket_launch"
                    >
                      NHẬN BÁO GIÁ NGAY
                    </Button>
                 </form>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;
