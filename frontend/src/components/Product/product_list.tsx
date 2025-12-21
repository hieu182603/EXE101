/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import type { Product } from '../../types/product';
import './ProductList.css'

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsSearching(true);
        const [products, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories()
        ]);
        setProducts(products);
        setFilteredProducts(products);
        setCategories(categoriesData);
      } catch (err: any) {
        setError("Đã có lỗi xảy ra khi gọi API: " + err.message);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const keyword = filterKeyword.toLowerCase().trim();
    const filtered = products.filter((product) => {
      const matchKeyword =
        product.name.toLowerCase().includes(keyword) ||
        (product.category?.name || '').toLowerCase().includes(keyword);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "true" && product.isActive) ||
        (statusFilter === "false" && !product.isActive);
      const matchCategory =
        categoryFilter === "all" ||
        product.category?.id === categoryFilter;
      return matchKeyword && matchStatus && matchCategory;
    });
    setFilteredProducts(filtered);
  };

  // Auto search when filters change
  useEffect(() => {
    handleSearch();
  }, [filterKeyword, statusFilter, categoryFilter]);

  const handleDetail = (id: string) => {
    navigate(`/products/${id}`);
  };
  const handleAddNew = () => {
    navigate("/products/add");
  };
  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-container">
      <h2>Product List</h2>
      
      {/* Search result info */}
      {(filterKeyword || statusFilter !== "all" || categoryFilter !== "all") && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '5px',
          border: '1px solid #bbdefb'
        }}>
          <strong>Filter results:</strong>
          <span style={{ marginLeft: '10px', color: '#1976d2' }}>
            {filteredProducts.length} products
          </span>
          {(filterKeyword || statusFilter !== "all" || categoryFilter !== "all") && (
            <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
              (From total {products.length} products)
            </span>
          )}
        </div>
      )}

      <div
        className="filter-section"
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginLeft: "5px" }}
          >
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ marginLeft: "5px" }}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Product name:</label>
          <input
            type="text"
            placeholder="Enter product name"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            style={{ marginLeft: "5px" }}
            disabled={isSearching}
          />
        </div>

        <button 
          className="search-button" 
          onClick={handleSearch}
          disabled={isSearching}
          style={{ opacity: isSearching ? 0.7 : 1 }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button 
          className="reset-button" 
          onClick={() => {
            setFilterKeyword("");
            setStatusFilter("all");
            setCategoryFilter("all");
          }}
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Reset
        </button>
        <button className="add-button" onClick={handleAddNew}>
          Add new
        </button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Category</th>
            <th>Image</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.category?.name || 'N/A'}</td>
                <td>
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0].url : '/img/product-default.png'}
                    alt={product.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                <td>{product.stock}</td>
                <td>{product.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <button onClick={() => handleDetail(product.id)}>
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
                No data to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
