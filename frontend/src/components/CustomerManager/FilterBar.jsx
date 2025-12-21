import React from 'react';
import { Search } from 'lucide-react';
import styles from './FilterBar.module.css';

const FilterBar = ({
  searchTerm = '',
  statusFilter = 'all',
  createdDateFilter = '',
  onSearchChange,
  onStatusChange,
  onDateChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || createdDateFilter;

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onDateChange('');
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGrid}>
        {/* Search Input */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, phone..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Date Filter */}
        <input
          type="date"
          placeholder="Created from date"
          className={styles.dateInput}
          value={createdDateFilter}
          onChange={(e) => onDateChange(e.target.value)}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar; 