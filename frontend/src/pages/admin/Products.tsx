
import React, { useState, useMemo, useEffect } from 'react';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Pagination from '@components/ui/Pagination';
import ProductForm from '@components/admin/products/ProductForm';
import { productService } from '@services/productService';
import type { Product } from '@/types/product';

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/1e293b/64748b?text=No+Image";
const ITEMS_PER_PAGE = 5;

const ProductManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Linh kiện PC',
    brand: 'Gigabyte',
    price: 0,
    originalPrice: 0,
    stock: 0,
    image: ''
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productService.getAllProductsIncludingOutOfStock();
        
        // Transform Product[] to local Product format
        const transformedProducts: Product[] = productsData.map((p: Product) => ({
          id: p.id,
          name: p.name,
          category: p.category?.name || 'Unknown',
          brand: p.category?.name || 'Unknown', // Use category as brand for now
          price: p.price,
          originalPrice: undefined, // Backend may not have this
          stock: p.stock,
          image: p.images?.[0]?.url || p.url || PLACEHOLDER_IMAGE
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
  }, []);

  const handleAddProduct = async () => {
    try {
      // Call API to create product
      const productData = {
        name: newProduct.name || '',
        categoryId: '', // Need to get category ID from category name
        price: newProduct.price || 0,
        stock: newProduct.stock || 0,
        description: '',
        images: newProduct.image ? [{ url: newProduct.image }] : []
      };
      
      const createdProduct = await productService.createProduct(productData);
      
      if (createdProduct) {
        // Reload products
        const productsData = await productService.getAllProductsIncludingOutOfStock();
        const transformedProducts: Product[] = productsData.map((p: Product) => ({
          id: p.id,
          name: p.name,
          category: p.category?.name || 'Unknown',
          brand: p.category?.name || 'Unknown',
          price: p.price,
          originalPrice: undefined,
          stock: p.stock,
          image: p.images?.[0]?.url || p.url || PLACEHOLDER_IMAGE
        }));
        setProducts(transformedProducts);
        
        setIsAddModalOpen(false);
        setNewProduct({ name: '', category: 'Linh kiện PC', brand: 'Gigabyte', price: 0, originalPrice: 0, stock: 0, image: '' });
        alert("Thêm sản phẩm thành công!");
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert("Thêm sản phẩm thất bại. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const success = await productService.removeProduct(id);
        if (success) {
          setProducts(products.filter(p => p.id !== id));
          alert("Xóa sản phẩm thành công!");
        } else {
          alert("Xóa sản phẩm thất bại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert("Xóa sản phẩm thất bại. Vui lòng thử lại.");
      }
    }
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    }));
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    alert("Cập nhật sản phẩm thành công!");
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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const { label: status } = getStockBadge(p.stock);
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      const matchesBrand = filterBrand === 'all' || p.brand === filterBrand;
      const matchesStockStatus = filterStockStatus === 'all' || status === filterStockStatus;
      
      const price = p.price;
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesCategory && matchesBrand && matchesStockStatus && matchesPrice;
    });
  }, [products, searchTerm, filterCategory, filterBrand, filterStockStatus, minPrice, maxPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts.length]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterBrand !== 'all' || filterStockStatus !== 'all' || minPrice || maxPrice;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-400 mt-1">Cập nhật và theo dõi tồn kho thời gian thực</p>
        </div>
        <Button 
          variant="primary" 
          icon="add" 
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm Sản Phẩm
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border border-border-dark bg-surface-dark p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-dark bg-background-dark text-sm text-white placeholder-gray-500 focus:border-primary outline-none transition-all"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-border-dark bg-background-dark px-4 pl-10 text-sm text-white focus:border-primary outline-none min-w-[160px] cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_1rem_center] bg-no-repeat"
              style={{ backgroundImage: 'none' }}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Laptop">Laptop</option>
              <option value="Linh kiện PC">Linh kiện PC</option>
              <option value="Phụ kiện">Phụ kiện</option>
              <option value="Bàn phím">Bàn phím</option>
              <option value="Màn hình">Màn hình</option>
            </select>

            <select 
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="h-11 appearance-none rounded-xl border border-border-dark bg-background-dark px-4 text-sm text-white focus:border-primary outline-none cursor-pointer min-w-[140px]"
            >
              <option value="all">Tất cả kho</option>
              <option value="Còn hàng">Còn hàng</option>
              <option value="Sắp hết">Sắp hết</option>
              <option value="Hết hàng">Hết hàng</option>
            </select>

            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-11 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${
                showAdvancedFilters || hasActiveFilters 
                ? 'border-primary text-primary bg-primary/10' 
                : 'border-border-dark text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Lọc
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-border-dark animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Thương hiệu</label>
              <select 
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full h-10 rounded-lg border border-border-dark bg-background-dark px-3 text-sm text-white focus:border-primary outline-none"
              >
                <option value="all">Tất cả</option>
                <option>Apple</option>
                <option>ASUS</option>
                <option>Dell</option>
                <option>Gigabyte</option>
                <option>Logitech</option>
                <option>Keychron</option>
                <option>Razer</option>
              </select>
            </div>
            
            <div className="md:col-span-6">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Khoảng giá</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  placeholder="Từ..." 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border-dark bg-background-dark px-3 text-sm text-white focus:border-primary outline-none"
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  placeholder="Đến..." 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border-dark bg-background-dark px-3 text-sm text-white focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterBrand('all');
                  setFilterStockStatus('all');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="w-full h-10 rounded-lg border border-border-dark text-gray-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Đặt lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Table */}
      <div className="rounded-2xl border border-border-dark bg-surface-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a1a] text-xs uppercase text-gray-300 border-b border-border-dark">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên sản phẩm</th>
                <th className="px-6 py-4 font-semibold">Thương hiệu</th>
                <th className="px-6 py-4 font-semibold">Giá bán</th>
                <th className="px-6 py-4 font-semibold text-center">Tồn kho</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const { label, variant } = getStockBadge(p.stock);
                  const discount = getDiscountPercent(p.price, p.originalPrice);
                  
                  return (
                    <tr key={p.id} className="group hover:bg-surface-accent transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-background-dark flex items-center justify-center text-gray-500 border border-border-dark overflow-hidden relative">
                            {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined">image</span>
                            )}
                            {discount && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-bl shadow-sm">-{discount}%</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-primary transition-colors">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{p.brand}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-white">{p.price.toLocaleString()}đ</span>
                            {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-xs text-slate-500 line-through">{p.originalPrice.toLocaleString()}đ</span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 bg-background-dark/30 rounded-xl p-1 w-fit mx-auto border border-border-dark/50">
                          <button 
                            onClick={() => handleUpdateStock(p.id, -1)}
                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <span className={`w-10 text-center font-mono font-bold text-base ${p.stock < 10 ? 'text-red-500' : 'text-white'}`}>
                            {p.stock}
                          </span>
                          <button 
                            onClick={() => handleUpdateStock(p.id, 1)}
                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold"
                            onClick={() => setEditingProduct(p)}
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Sửa
                          </button>
                          <button 
                            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                            onClick={() => handleDelete(p.id)}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Không tìm thấy sản phẩm nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Sản Phẩm Mới"
        size="4xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleAddProduct}>Lưu sản phẩm</Button>
          </>
        }
      >
        <ProductForm data={newProduct} setData={setNewProduct} />
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editingProduct} 
        onClose={() => setEditingProduct(null)}
        title="Chỉnh Sửa Sản Phẩm"
        size="4xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </>
        }
      >
        {editingProduct && <ProductForm data={editingProduct} setData={setEditingProduct} isEdit />}
      </Modal>
    </div>
  );
};

export default ProductManagement;
