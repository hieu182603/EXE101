import React from 'react';
import { Eye, Edit, Trash2, Phone, MapPin, Truck, ChevronLeft, ChevronRight, User, List, Settings, Power, Star } from 'lucide-react';
import styles from './ShipperCard.module.css';

const ShipperCard = ({
  shippers = [],
  currentPage = 1,
  totalPages = 1,
  totalShippers = 0,
  itemsPerPage = 5,
  onView,
  onEdit,
  onDelete,
  onViewOrders,
  onPageChange,
  onManageWorkingZones,
  onToggleAvailability,
  onUpdatePriority,
  userRole = 'user' // Default to basic user role if not provided
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalShippers);

  // Check if user has admin privileges (admin or manager roles)
  const hasAdminPrivileges = userRole === 'admin' || userRole === 'manager';

  const getAvailabilityClass = (isAvailable) => {
    return isAvailable ? styles.available : styles.unavailable;
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (!shippers.length) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.emptyState}>
          <User className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No shippers found</h3>
          <p className={styles.emptyDescription}>
            No shippers in system or no matches with current filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Shipper Cards */}
      <div className={styles.cardContainer}>
        {shippers.map((shipper) => (
          <div key={shipper.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.shipperInfo}>
                <div className={styles.avatar}>
                  {getInitial(shipper.name)}
                </div>
                <div className={styles.shipperDetails}>
                  <h3 className={styles.shipperName}>{shipper.name}</h3>
                  <p className={styles.shipperId}>ID: {shipper.id}</p>
                </div>
              </div>
              <div className={styles.statusContainer}>
                <span className={`${styles.availability} ${getAvailabilityClass(shipper.isAvailable)}`}>
                  {shipper.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} />
                  <span className={styles.infoText}>{shipper.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.infoIcon} />
                  <span className={styles.infoText}>Member since: {formatDate(shipper.createdAt)}</span>
                </div>
                {shipper.workingZones && shipper.workingZones.length > 0 && (
                  <div className={styles.infoItem}>
                    <Truck className={styles.infoIcon} />
                    <span className={styles.infoText}>
                      Zones: {shipper.workingZones.slice(0, 2).join(", ")}
                      {shipper.workingZones.length > 2 && ` +${shipper.workingZones.length - 2} more`}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Orders:</span>
                  <span className={styles.statValue}>{shipper.totalOrders}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Delivered:</span>
                  <span className={styles.statValue}>{shipper.deliveredOrders}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Priority:</span>
                  <span className={styles.statValue}>
                    <Star size={14} className={styles.priorityStar} />
                    {shipper.priority || 1}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Daily:</span>
                  <span className={styles.statValue}>
                    {shipper.dailyOrderCount || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              {/* View button - always visible for all roles */}
              <button
                className={`${styles.actionButton} ${styles.viewButton}`}
                onClick={() => onView(shipper)}
              >
                <Eye className={styles.actionIcon} />
                View
              </button>
              
              {/* Orders button - always visible for all roles */}
              <button
                className={`${styles.actionButton} ${styles.ordersButton}`}
                onClick={() => onViewOrders(shipper)}
                title="View Orders"
              >
                <List className={styles.actionIcon} />
                Orders
              </button>
              
              {/* Admin-only actions */}
              {hasAdminPrivileges && (
                <>
                  {/* Zones button - only visible for admin/manager */}
                  <button
                    className={`${styles.actionButton} ${styles.zonesButton}`}
                    onClick={() => onManageWorkingZones(shipper)}
                    title="Manage Working Zones"
                  >
                    <MapPin className={styles.actionIcon} />
                    Zones
                  </button>
                  
                  {/* Edit button - only visible for admin/manager */}
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => onEdit(shipper)}
                  >
                    <Edit className={styles.actionIcon} />
                    Edit
                  </button>
                  
                  {/* Delete button - only visible for admin/manager */}
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onDelete(shipper.id)}
                  >
                    <Trash2 className={styles.actionIcon} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Display {startIndex + 1} to {endIndex} of {totalShippers} shippers
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
    </>
  );
};

export default ShipperCard; 