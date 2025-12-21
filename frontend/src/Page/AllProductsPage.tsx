import React, { useEffect, useState, useMemo } from 'react';
import ProductFilters from '../components/Product/ProductFilters';
import ProductCard from '../components/Product/ProductCard';
import Pagination from '../components/Product/Pagination';
import { productService } from '../services/productService';
import type { Product, FilterState, ProductCategory } from '../types/product';
import { useLocation } from 'react-router-dom';
import ProductDetailModal from '../components/Product/productDetailModal';
import Footer from '../components/footer';
import { useCart } from '../contexts/CartContext';

const PRODUCTS_PER_PAGE = 16;

const defaultFilters: FilterState = {
  categories: [],
  searchQuery: '',
  sortOrder: 'none',
};

const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addToCartStatus, setAddToCartStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const location = useLocation();
  const { addToCart } = useCart();

  // Auto-hide cart notification after 3 seconds
  useEffect(() => {
    if (addToCartStatus) {
      const timer = setTimeout(() => {
        setAddToCartStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [addToCartStatus]);

  // Fetch all products on mount or when location changes (search, filter from homepage)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (location.state && location.state.searchResults) {
          setProducts(location.state.searchResults);
          setFilters((prev) => ({ ...prev, searchQuery: location.state.searchKeyword || '' }));
        } else if (location.state && location.state.searchKeyword) {
          const searchResults = await productService.searchProducts(location.state.searchKeyword);
          setProducts(searchResults);
          setFilters((prev) => ({ ...prev, searchQuery: location.state.searchKeyword }));
        } else {
          const res = await productService.getAllProducts();
          setProducts(res);
          // Ưu tiên filter từ navigation, chỉ reset filter nếu không có filter và không có search
          if (!location.state || (!location.state.filter && !location.state.searchKeyword)) {
            setFilters(defaultFilters);
          }
        }
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.state]);

  // Áp dụng filter từ navigation
  useEffect(() => {
    if (location.state && location.state.filter) {
      let categories: string[] = [];
      if (location.state.filter === 'laptop') categories = ['laptop'];
      else if (location.state.filter === 'pc') categories = ['pc'];
      else if (location.state.filter === 'accessories') categories = [
        'cpu', 'ram', 'drive', 'monitor', 'cooler', 'psu', 'case', 'headset', 'network-card', 'motherboard', 'keyboard', 'gpu', 'mouse'
      ];
      setFilters((prev) => ({ ...prev, categories: categories as ProductCategory[], searchQuery: '' }));
    } else if (location.state && location.state.clearFilter) {
      setFilters(defaultFilters);
    }
  }, [location.state]);

  // Filter, search, sort logic
  useEffect(() => {
    let filtered = [...products];
    // Chỉ lấy sản phẩm active
    filtered = filtered.filter((p) => p.isActive);
    // Filter by category
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) => {
        const categorySlug = p.category?.slug?.toLowerCase();
        return filters.categories.some((cat) => categorySlug === cat.toLowerCase());
      });
    }
    // Search
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const keyword = filters.searchQuery.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(keyword) ||
        (p.category?.name?.toLowerCase() || '').includes(keyword)
      );
    }
    // Sort
    if (filters.sortOrder === 'asc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortOrder === 'desc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, filters]);

  // Tính số lượng sản phẩm theo category cho badge
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const slug = p.category?.slug;
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Handlers
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleAddToCart = async (product: Product) => {
    if (!product.id) {
      setAddToCartStatus({
        message: 'Invalid product data',
        type: 'error'
      });
      return;
    }

    try {
      await addToCart(product.id, 1);
      setAddToCartStatus({
        message: 'Product added to cart successfully!',
        type: 'success'
      });
    } catch (error) {
      setAddToCartStatus({
        message: 'Failed to add product to cart',
        type: 'error'
      });
    }
  };
  const handleQuickView = async (product: Product) => {
    const detail = await productService.getProductById(product.id);
    setQuickViewProduct(detail || product);
    setIsQuickViewOpen(true);
  };
  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };
  // Xử lý search input (nếu có search bar riêng)
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  return (
    <>
      {addToCartStatus && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px',
            borderRadius: '5px',
            backgroundColor: addToCartStatus.type === 'success' ? '#4CAF50' : '#f44336',
            color: 'white',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {addToCartStatus.message}
        </div>
      )}
      <div className="w-full bg-[#f7f8fa] min-h-screen py-8 px-2 sm:px-6 lg:px-12 pr-4 sm:pr-8 lg:pr-24">
        <div className="w-full flex flex-col md:flex-row gap-8 max-w-[1800px] mx-auto pr-4 sm:pr-8 lg:pr-24">
          {/* Sidebar filter */}
          <div className="w-full md:w-[360px] mb-8 md:mb-0 pl-8 sm:pl-16 lg:pl-24">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categoryCounts={categoryCounts}
            />
          </div>
          {/* Main content */}
          <div className="flex-1 max-w-full md:max-w-[calc(100%-384px)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">All Products</h1>
                <div className="text-gray-600 text-lg">
                  Total products: <span className="font-semibold">{filteredProducts.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by price:</span>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' | 'none' }))}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <option value="none">Sort by price</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            {/* Search bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.searchQuery}
                onChange={handleSearchInput}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
              />
            </div>
            {/* Product grid */}
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading products...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedProducts.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">No products found.</div>
                  ) : (
                    paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={handleQuickView}
                      />
                    ))
                  )}
                </div>
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={PRODUCTS_PER_PAGE}
                  totalItems={filteredProducts.length}
                  className=""
                />
                {/* Quick view modal */}
                <ProductDetailModal isOpen={isQuickViewOpen} onClose={handleCloseQuickView} product={quickViewProduct} />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllProductsPage; 