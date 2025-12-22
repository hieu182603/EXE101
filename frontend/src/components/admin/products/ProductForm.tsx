
import React from 'react';
import { Input, Textarea } from '../../ui/Input';
import Badge from '../../ui/Badge';

interface ProductFormProps {
  data: any;
  setData: (d: any) => void;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  data, 
  setData, 
  isEdit = false 
}) => {
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: 'Hết hàng', variant: 'danger' as const };
    if (stock < 10) return { label: 'Sắp hết', variant: 'warning' as const };
    return { label: 'Còn hàng', variant: 'success' as const };
  };

  const getDiscountPercent = (price: number, original?: number) => {
    if (!original || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Image */}
      <div className="lg:col-span-4 space-y-4">
        <div className="relative group w-full aspect-square rounded-3xl border-2 border-dashed border-border-dark hover:border-primary bg-background-dark/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shadow-inner">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          {data.image ? (
            <img src={data.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="text-center p-6">
              <div className="size-16 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined text-slate-500 text-3xl group-hover:text-primary transition-colors">cloud_upload</span>
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-widest">Tải ảnh lên</p>
              <p className="text-[10px] text-slate-500 mt-2">Hỗ trợ JPG, PNG (Max 5MB)</p>
            </div>
          )}
          {data.image && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none backdrop-blur-sm">
              <span className="material-symbols-outlined text-white text-3xl">edit</span>
            </div>
          )}
        </div>
        
        {isEdit && (
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-4 flex items-center justify-between">
             <span className="text-xs font-bold text-slate-400 uppercase">Tồn kho hiện tại</span>
             <Badge variant={getStockBadge(data.stock).variant}>{getStockBadge(data.stock).label}</Badge>
          </div>
        )}
      </div>

      {/* Right: Inputs */}
      <div className="lg:col-span-8 space-y-6">
        <Input 
          label="Tên sản phẩm" 
          placeholder="Ví dụ: RTX 4090 Gaming OC..." 
          value={data.name}
          onChange={(e) => setData({...data, name: e.target.value})}
          className="font-bold text-lg"
        />
        
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Thương hiệu</label>
            <select 
              value={data.brand}
              onChange={(e) => setData({...data, brand: e.target.value})}
              className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none transition-colors cursor-pointer"
            >
              <option>Chọn thương hiệu</option>
              <option>Apple</option>
              <option>ASUS</option>
              <option>Dell</option>
              <option>Gigabyte</option>
              <option>Logitech</option>
              <option>Keychron</option>
              <option>Razer</option>
            </select>
          </div>
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Danh mục</label>
            <select 
              value={data.category}
              onChange={(e) => setData({...data, category: e.target.value})}
              className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none transition-colors cursor-pointer"
            >
              <option>Chọn danh mục</option>
              <option>Laptop</option>
              <option>Linh kiện PC</option>
              <option>Phụ kiện</option>
              <option>Bàn phím</option>
            </select>
          </div>
        </div>

        {/* Pricing Logic Section */}
        <div className="p-5 rounded-2xl bg-surface-dark border border-border-dark grid grid-cols-2 gap-5">
           <div className="col-span-2 flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">payments</span>
                <span className="text-xs font-bold text-white uppercase">Thiết lập giá & Sale</span>
              </div>
              {data.originalPrice > data.price && (
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                   Đang giảm {getDiscountPercent(data.price, data.originalPrice)}%
                </span>
              )}
           </div>
           
           <div className="space-y-1">
             <Input 
                label="Giá gốc (Niêm yết)" 
                type="number" 
                placeholder="0" 
                value={data.originalPrice || ''}
                onChange={(e) => setData({...data, originalPrice: parseInt(e.target.value) || 0})}
             />
             <p className="text-[10px] text-slate-500">Nhập giá này cao hơn giá bán để tạo Sale</p>
           </div>
           
           <Input 
              label="Giá bán thực tế" 
              type="number" 
              placeholder="0" 
              value={data.price || ''}
              onChange={(e) => setData({...data, price: parseInt(e.target.value) || 0})}
           />
           
           <div className="col-span-2">
             <Input 
                label="Số lượng tồn kho" 
                type="number" 
                placeholder="0" 
                value={data.stock || ''}
                onChange={(e) => setData({...data, stock: parseInt(e.target.value) || 0})}
             />
           </div>

           {/* Discount Preview Box */}
           {data.originalPrice > data.price && (
              <div className="col-span-2 bg-gradient-to-r from-red-500/20 to-transparent border border-red-500/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
                  <div>
                    <span className="text-xs font-black text-red-400 uppercase flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-sm">local_offer</span>
                      SALE TAG TỰ ĐỘNG
                    </span>
                    <p className="text-[10px] text-slate-300">Sản phẩm sẽ hiển thị nhãn giảm giá trên cửa hàng.</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-black text-red-500">-{getDiscountPercent(data.price, data.originalPrice)}%</span>
                    <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">Flash Sale</span>
                  </div>
              </div>
           )}
        </div>
        
        <Textarea label="Mô tả sản phẩm" placeholder="Nhập thông tin chi tiết..." value={data.description} className="h-32 font-medium" />
      </div>
    </div>
  );
};

export default ProductForm;
