import React from 'react';
import { Eye, Edit, Trash2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CustomerTable.module.css';
import { formatDate } from '../../utils/dateFormatter';

const CustomerTable = ({
  customers = [],
  currentPage = 1,
  totalPages = 1,
  totalCustomers = 0,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  onPageChange
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalCustomers);

  const getStatusClass = (status) => {
    return status === 'Active' ? styles.statusActive : styles.statusInactive;
  };



  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!customers.length) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <User className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No customers found</h3>
          <p className={styles.emptyDescription}>
            No customers in system or no matches with current filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.headerCell}>CUSTOMER NAME</th>
              <th className={styles.headerCell}>USERNAME</th>
              <th className={styles.headerCell}>PHONE NUMBER</th>
              <th className={styles.headerCell}>STATUS</th>
              <th className={styles.headerCell}>ORDERS</th>
              <th className={styles.headerCell}>CREATED DATE</th>
              <th className={styles.headerCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {customers.map((customer) => (
              <tr key={customer.id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <div className={styles.customerInfo}>
                    <div className={styles.avatar}>
                      {getInitial(customer.name)}
                    </div>
                    <span className={styles.customerName}>
                      {customer.name}
                    </span>
                  </div>
                </td>
                <td className={`${styles.tableCell} ${styles.customerId}`}>
                  {customer.username}
                </td>
                <td className={`${styles.tableCell} ${styles.phoneNumber}`}>
                  {customer.phone}
                </td>
                <td className={styles.tableCell}>
                  <span className={`${styles.status} ${getStatusClass(customer.status)}`}>
                    {customer.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.ordersBadge}>
                    {customer.customerOrders?.length || 0} orders
                  </span>
                </td>
                <td className={`${styles.tableCell} ${styles.createdDate}`}>
                  {formatDate(customer.createdAt)}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      onClick={() => onView(customer)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => onEdit(customer)}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => onDelete(customer.id)}
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
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {totalCustomers} customers
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

export default CustomerTable; 