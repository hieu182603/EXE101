import React, { useState, useEffect, useRef } from 'react';
import { Eye, Trash2, User, ChevronLeft, ChevronRight, Plus, Download, Search } from 'lucide-react';
import styles from '../CustomerManager/CustomerManagement.module.css';
import tableStyles from '../CustomerManager/CustomerTable.module.css';
import api from '../../services/apiInterceptor';
import { formatDate } from '../../utils/dateFormatter';
import filterStyles from '../ShipperManager/FilterBar.module.css';
import { productService } from '../../services/productService';

const itemsPerPage = 10;

const FeedbackManagement = () => {
  // State
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [pageSize] = useState(10);

  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categorySelectRef = useRef(null);

  // Notification
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${styles[`notification${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Fetch feedbacks (lấy toàn bộ, không phân trang backend)
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/feedbacks');
      // API trả về: { success, statusCode, data: [...] }
      const feedbackArr = Array.isArray(res.data?.data) ? res.data.data : [];
      setFeedbacks(feedbackArr);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch feedbacks');
      showNotification('Failed to load feedbacks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, []);

  // Lấy danh sách loại sản phẩm từ productService (giống bên products)
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await productService.getCategories();
      setCategoryOptions(Array.isArray(cats) ? cats : []);
    };
    fetchCategories();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categorySelectRef.current && !categorySelectRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClearFilters = () => {
    setFilterName('');
    setFilterDate('');
    setFilterCategory('all');
  };

  // Filtered feedbacks (áp dụng filter trước khi phân trang)
  const filteredFeedbacks = feedbacks.filter(fb => {
    // Filter theo tên sản phẩm hoặc tên người dùng
    const nameMatch = filterName.trim() === '' ||
      (fb.product?.name?.toLowerCase().includes(filterName.toLowerCase()) ||
      fb.account?.name?.toLowerCase().includes(filterName.toLowerCase()) ||
      fb.account?.username?.toLowerCase().includes(filterName.toLowerCase()));
    // Filter theo loại sản phẩm (so sánh giống bên products)
    const categoryMatch = filterCategory === 'all' ||
      ((fb.product?.category?.name || '').toLowerCase() === filterCategory.toLowerCase());
    // Filter theo ngày
    let dateMatch = true;
    if (filterDate && fb.createdAt) {
      const fbDate = new Date(fb.createdAt);
      const filterDateObj = new Date(filterDate);
      // So sánh yyyy-mm-dd
      dateMatch = fbDate.getFullYear() === filterDateObj.getFullYear() &&
        fbDate.getMonth() === filterDateObj.getMonth() &&
        fbDate.getDate() === filterDateObj.getDate();
    }
    return nameMatch && categoryMatch && dateMatch;
  });

  // Pagination trên filteredFeedbacks
  const totalPages = Math.ceil(filteredFeedbacks.length / pageSize) || 1;
  const indexOfFirstItem = filteredFeedbacks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const indexOfLastItem = filteredFeedbacks.length === 0 ? 0 : (currentPage - 1) * pageSize + Math.min(pageSize, filteredFeedbacks.length - (currentPage - 1) * pageSize);
  const currentPageFeedbacks = filteredFeedbacks.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [feedbacks, currentPage, totalPages]);

  // Actions
  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    if (!id || typeof id !== 'string' || id.length < 10) {
      showNotification('Invalid feedback id', 'error');
      return;
    }
    console.log('Deleting feedback id:', id);
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks(feedbacks.filter(fb => fb.id !== id));
      showNotification('Feedback deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete feedback', 'error');
    }
  };

  // Export feedbacks to Excel
  const handleExport = async () => {
    try {
      const res = await api.get('/feedbacks/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      link.setAttribute('download', `Feedbacks_${yyyy}-${mm}-${dd}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showNotification('Exported feedbacks to Excel!', 'success');
    } catch (err) {
      showNotification('Failed to export feedbacks', 'error');
    }
  };

  // Table avatar helper
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Hàm tạo mảng số trang dạng rút gọn (tham khảo ProductManagement)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (currentPage > 4) pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 2 && i < totalPages - 1) pages.push(i);
      }
      if (currentPage < totalPages - 4) pages.push('...');
      pages.push(totalPages - 1, totalPages);
    }
    // Loại bỏ số trùng và ... cạnh nhau
    const result = [];
    let prev = null;
    for (const p of pages) {
      if (typeof p === 'string' && (prev === '...' || typeof prev === 'number' && Math.abs(prev - (pages[pages.indexOf(p) + 1] || 0)) === 1)) {
        continue;
      }
      if (result.length && result[result.length - 1] === p) continue;
      result.push(p);
      prev = p;
    }
    return result.filter((p, i, arr) => !(p === '...' && (i === 0 || i === arr.length - 1)));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.title}>Feedbacks Management</div>
            <div className={styles.description}>View and manage all product feedbacks from customers.</div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all duration-200" onClick={handleExport}>
              <Download size={18} className="text-white" />
              <span className="text-white font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.loadingContent}>Loading...</div></div>
      ) : error ? (
        <div className={styles.errorContainer}><div className={styles.errorContent}>{error}</div></div>
      ) : (
        <div className={tableStyles.tableContainer}>
          {/* Filter Bar - UI giống ShipperManager */}
          <div className={filterStyles.filterContainer}>
            <div className={filterStyles.filterGrid} style={{ gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '1.5rem' }}>
              {/* Search Input */}
              <div className={filterStyles.searchContainer} style={{ minWidth: 180 }}>
                <Search className={filterStyles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by product or user name..."
                  className={filterStyles.searchInput}
                  value={filterName}
                  onChange={e => setFilterName(e.target.value)}
                />
              </div>
              {/* Category Filter - Custom Dropdown */}
              <div className={filterStyles.zoneSelectContainer} ref={categorySelectRef} style={{ minWidth: 160 }}>
                <div
                  className={`${filterStyles.customSelect} ${isCategoryOpen ? filterStyles.open : ''}`}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <div className={filterStyles.selectedValue}>
                    {filterCategory === 'all' ? 'All Categories' : (categoryOptions.find(c => c.name.toLowerCase() === filterCategory.toLowerCase())?.name || filterCategory)}
                  </div>
                  <div className={`${filterStyles.customOptions} ${isCategoryOpen ? filterStyles.show : ''}`}>
                    <div
                      className={`${filterStyles.customOption} ${filterCategory === 'all' ? filterStyles.selected : ''}`}
                      onClick={() => { setFilterCategory('all'); setIsCategoryOpen(false); }}
                    >
                      All Categories
                    </div>
                    {categoryOptions.map(cat => (
                      <div
                        key={cat.id}
                        className={`${filterStyles.customOption} ${(cat.name.toLowerCase() === filterCategory.toLowerCase()) ? filterStyles.selected : ''}`}
                        onClick={e => { e.stopPropagation(); setFilterCategory(cat.name); setIsCategoryOpen(false); }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Date Filter */}
              <input
                type="date"
                className={filterStyles.select}
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                placeholder="Filter by date"
                style={{ minWidth: 140 }}
              />
              {/* Clear Filters Button */}
              {(filterName || filterDate || filterCategory !== 'all') && (
                <button
                  type="button"
                  className={filterStyles.clearButton}
                  onClick={handleClearFilters}
                  style={{ marginLeft: 'auto', minWidth: 120 }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead className={tableStyles.tableHeader}>
                <tr>
                  <th className={tableStyles.headerCell}>PRODUCT NAME</th>
                  <th className={tableStyles.headerCell}>ACCOUNT NAME</th>
                  <th className={tableStyles.headerCell}>CONTENT</th>
                  <th className={tableStyles.headerCell}>CREATED DATE</th>
                  <th className={tableStyles.headerCell}>ACTIONS</th>
                </tr>
              </thead>
              <tbody className={tableStyles.tableBody}>
                {currentPageFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className={tableStyles.emptyState}>
                        <User className={tableStyles.emptyIcon} />
                        <h3 className={tableStyles.emptyTitle}>No feedbacks found</h3>
                        <p className={tableStyles.emptyDescription}>
                          No feedbacks in system or no matches with current filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : currentPageFeedbacks.map(fb => (
                  <tr key={fb.id} className={tableStyles.tableRow}>
                    <td className={tableStyles.tableCell}>
                      <div className={tableStyles.customerInfo}>
                        <div className={tableStyles.avatar}>
                          {getInitial(fb.product?.name)}
                        </div>
                        <span className={tableStyles.customerName}>
                          {fb.product?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className={tableStyles.tableCell}>
                      <div className={tableStyles.customerInfo}>
                        <div className={tableStyles.avatar} style={{ background: '#991b1b' }}>
                          {getInitial(fb.account?.name || fb.account?.username)}
                        </div>
                        <span className={tableStyles.customerName}>
                          {fb.account?.name || fb.account?.username || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className={tableStyles.tableCell} style={{ maxWidth: 300, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fb.content}
                    </td>
                    <td className={tableStyles.tableCell}>
                      {formatDate(fb.createdAt)}
                    </td>
                    <td className={tableStyles.tableCell}>
                      <div className={tableStyles.actions}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.viewButton}`}
                          onClick={() => handleView(fb)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => handleDelete(fb.id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className={tableStyles.pagination}>
            <div className={tableStyles.paginationInfo}>
              Showing {indexOfFirstItem} to {indexOfLastItem} of {filteredFeedbacks.length} feedbacks
            </div>
            <div className={tableStyles.paginationControls}>
              <button
                className={tableStyles.paginationButton}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((page, idx) =>
                typeof page === 'number' ? (
                  <button
                    key={page}
                    className={`${tableStyles.paginationButton} ${page === currentPage ? tableStyles.currentPage : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={"ellipsis-" + idx} className={tableStyles.paginationButton} style={{ cursor: 'default' }}>...</span>
                )
              )}
              <button
                className={tableStyles.paginationButton}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {showDetail && selectedFeedback && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Feedback Detail</div>
              <button className={styles.closeButton} onClick={() => setShowDetail(false)}><span>&times;</span></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: 0, minWidth: 400, minHeight: 180 }}>
              {/* Left: Product Image (50%) */}
              <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
                {((selectedFeedback.product?.images && selectedFeedback.product.images[0]?.url) ||
                  (selectedFeedback.product?.images && selectedFeedback.product.images[0]?.imageUrl)) && (
                  <img
                    src={selectedFeedback.product.images[0].url || selectedFeedback.product.images[0].imageUrl}
                    alt={selectedFeedback.product?.name || 'Product'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                  />
                )}
              </div>
              {/* Right: Product Name & Feedback Content (50%) */}
              <div style={{ flex: '1 1 0', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', background: '#fff', borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8, textAlign: 'left', width: '100%' }}>
                  {selectedFeedback.product?.name || 'N/A'}
                </div>
                <div style={{ color: '#991b1b', fontWeight: 500, marginBottom: 16, textAlign: 'left', width: '100%' }}>
                  Feedback:
                </div>
                <div style={{ fontSize: 16, color: '#374151', whiteSpace: 'pre-line', textAlign: 'left', width: '100%' }}>
                  {selectedFeedback.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement; 