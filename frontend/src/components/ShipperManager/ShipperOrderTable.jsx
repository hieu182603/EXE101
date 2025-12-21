import React from 'react';
import { Eye, XCircle, CheckCircle, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import styles from './ShipperOrderTable.module.css';

const ShipperOrderTable = ({
  orders = [],
  currentPage = 1,
  totalPages = 1,
  totalOrders = 0,
  itemsPerPage = 10,
  role = 'shipper',
  onView,
  onStatusUpdate,
  onReject,
  onConfirm,
  onPageChange,
  loading = false
}) => {
  const indexOfFirstItem = totalOrders > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalOrders);

  // Determine if a table should be shown
  const shouldShowTable = orders.length > 0;

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'ASSIGNED': return styles.statusAssigned;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'SHIPPING': return styles.statusShipping;
      case 'DELIVERED': return styles.statusDelivered;
      case 'CANCELLED': return styles.statusCancelled;
      case 'EXTERNAL': return styles.statusDefault;
      default: return styles.statusDefault;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
  };

  // Determine status options based on current status
  const getStatusOptions = (currentStatus) => {
    if (role === 'shipper') {
      switch (currentStatus) {
        case 'ASSIGNED': return ['ASSIGNED', 'CONFIRMED']; // Can confirm
        case 'CONFIRMED': return ['CONFIRMED', 'SHIPPING']; // Can start shipping
        case 'SHIPPING': return ['SHIPPING', 'DELIVERED']; // Can mark delivered
        default: return [];
      }
    }
    
    // Only admin can set any status now (not staff)
    if (role === 'admin') {
      return ['PENDING', 'ASSIGNED', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'EXTERNAL'].filter(s => s !== currentStatus);
    }
    
    return []; // Staff or other roles can't change status
  };
  
  // Check if order can be confirmed (shipper only, for ASSIGNED status)
  const canConfirmOrder = (status, userRole) => {
    return userRole === 'shipper' && (status === 'ASSIGNED' || status === 'PENDING');
  };
  
  // Check if user has permission to change order status
  const canChangeStatus = (userRole) => {
    return userRole === 'admin' || userRole === 'shipper';
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.headerCell}>ORDER ID</th>
              <th className={styles.headerCell}>CUSTOMER</th>
              <th className={styles.headerCell}>ORDER DATE</th>
              <th className={styles.headerCell}>TOTAL AMOUNT</th>
              <th className={styles.headerCell}>STATUS</th>
              <th className={styles.headerCell}>SHIPPING ADDRESS</th>
              <th className={styles.headerCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {!orders.length ? (
              <tr>
                <td colSpan="7" className={styles.emptyStateCell}>
                  <div className={styles.emptyState}>
                    <ShoppingCart className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No order found</h3>
                    <p className={styles.emptyDescription}>
                      No order found in the system or no order matches the filter
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusOptions = getStatusOptions(order.status);
                const showConfirmButton = (order.status === 'PENDING' || order.status === 'ASSIGNED') && role === 'shipper' && onConfirm;
                
                return (
                  <tr key={order.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.orderId}`}>
                      #{order.id}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.customerInfo}>
                        <div className={styles.avatar}>
                          {(order.customer?.name || order.customer?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.customerName}>
                          {order.customer?.name || order.customer?.username || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.orderDate}`}>
                      {formatDate(order.orderDate)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.totalAmount}`}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className={styles.tableCell}>
                      {canChangeStatus(role) && statusOptions.length > 0 ? (
                        <select
                          className={`${styles.statusSelect} ${getStatusClass(order.status)}`}
                          value={order.status}
                          onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                          disabled={loading || (role === 'shipper' && statusOptions.length === 0)}
                        >
                          <option value={order.status}>{order.status}</option>
                          {statusOptions
                            .filter(opt => opt !== order.status)
                            .map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                      ) : (
                        <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className={`${styles.tableCell} ${styles.shippingAddress}`}>
                      <span className={styles.addressText} title={order.shippingAddress}>
                        {order.shippingAddress?.length > 30 
                          ? `${order.shippingAddress.substring(0, 30)}...` 
                          : order.shippingAddress}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                        {/* View button - always show */}
                        <button
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          onClick={() => onView(order)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {/* Confirm Order Button - for PENDING or ASSIGNED status, shipper only */}
                        {showConfirmButton && (
                          <button
                            className={`${styles.actionButton} ${styles.confirmButton}`}
                            onClick={() => onConfirm(order.id)}
                            title="Confirm Order"
                            disabled={loading}
                          >
                            <CheckCircle size={18} />
                            <span className={styles.buttonText}>Confirm</span>
                          </button>
                        )}
                        
                        {/* Reject Order Button - only for admin now, not staff */}
                        {role === 'admin' && onReject && order.status !== 'CANCELLED' && (
                          <button
                            className={`${styles.actionButton} ${styles.rejectButton}`}
                            onClick={() => onReject(order.id)}
                            title="Reject Order"
                            disabled={loading}
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Display {indexOfFirstItem} to {indexOfLastItem} of {totalOrders} orders
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.currentPage}>{currentPage}</span>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipperOrderTable; 