import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './FilterBar.module.css';

const FilterBar = ({
  searchTerm = '',
  statusFilter = 'all',
  dateFilter = '',
  shipperFilter = 'all',
  amountFilter = 'all',
  onSearchChange,
  onStatusChange,
  onDateChange,
  onShipperChange,
  onAmountChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter || shipperFilter !== 'all' || amountFilter !== 'all';

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onDateChange('');
    onShipperChange('all');
    onAmountChange('all');
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGrid}>
        {/* Search Input */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search by order ID, customer name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Status Filter */}
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All status</option>
          
          <option value="PENDING">Pending</option>
          <option value="SHIPPING">Shipping</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          className={styles.select}
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          placeholder="dd/mm/yyyy"
        />

        {/* Amount Filter */}
        <select
          className={styles.select}
          value={amountFilter}
          onChange={(e) => onAmountChange(e.target.value)}
        >
          <option value="all">All Amounts</option>
          <option value="0-500000">0 - 500,000 VND</option>
          <option value="500000-2000000">500,000 - 2,000,000 VND</option>
          <option value="2000000-10000000">2,000,000 - 10,000,000 VND</option>
          <option value="10000000-50000000">10,000,000 - 50,000,000 VND</option>
          <option value="50000000+">50,000,000+ VND</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          className={styles.clearButton}
          onClick={handleClearFilters}
        >
          <X size={18} />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar; 