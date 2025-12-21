import React from 'react';
import { Eye, XCircle, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './OrderTable.module.css';

const OrderTable = ({
  orders = [],
  currentPage = 1,
  totalPages = 1,
  totalOrders = 0,
  itemsPerPage = 10,
  role = 'admin',
  onView,
  onReject,
  onPageChange
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalOrders);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'SHIPPING': return styles.statusShipping;
      case 'DELIVERED': return styles.statusDelivered;
      case 'CANCELLED': return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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
                      <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
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
                        <button
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          onClick={() => onView(order)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {role === 'admin' && onReject && order.status !== 'CANCELLED' && (
                          <button
                            className={`${styles.actionButton} ${styles.rejectButton}`}
                            onClick={() => onReject(order.id)}
                            title="Reject Order"
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
          Display {indexOfFirstItem + 1} to {indexOfLastItem} of {totalOrders} orders
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

export default OrderTable; 