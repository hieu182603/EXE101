import React, { useRef, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import styles from './FilterBar.module.css';

const FilterBar = ({
  searchTerm = '',
  statusFilter = 'all',
  createdDateFilter = '',
  zoneFilter = 'all',
  onSearchChange,
  onStatusChange,
  onDateChange,
  onZoneChange,
  onClearFilters,
  availableZones = []
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || createdDateFilter || zoneFilter !== 'all';
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const zoneSelectRef = useRef(null);

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onDateChange('');
    if (onZoneChange) onZoneChange('all');
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Xử lý đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (zoneSelectRef.current && !zoneSelectRef.current.contains(event.target)) {
        setIsZoneOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tạo danh sách zones có giới hạn chiều cao
  const handleZoneChange = (zone) => {
    onZoneChange(zone);
    setIsZoneOpen(false);
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGrid}>
        {/* Search Input */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, username, phone..."
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
          <option value="active">Available</option>
          <option value="inactive">Unavailable</option>
        </select>

        {/* Zone Filter - Custom Dropdown */}
        <div className={styles.zoneSelectContainer} ref={zoneSelectRef}>
          <div 
            className={`${styles.customSelect} ${isZoneOpen ? styles.open : ''}`}
            onClick={() => setIsZoneOpen(!isZoneOpen)}
          >
            <div className={styles.selectedValue}>
              {zoneFilter === 'all' ? 'All Zones' : zoneFilter}
            </div>
            <div className={`${styles.customOptions} ${isZoneOpen ? styles.show : ''}`}>
              <div 
                className={`${styles.customOption} ${zoneFilter === 'all' ? styles.selected : ''}`}
                onClick={() => handleZoneChange('all')}
              >
                All Zones
              </div>
              {availableZones.map(zone => (
                <div 
                  key={zone} 
                  className={`${styles.customOption} ${zoneFilter === zone ? styles.selected : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoneChange(zone);
                  }}
                >
                  {zone}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Created Date Filter */}
        <input
          type="date"
          className={styles.select}
          value={createdDateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          placeholder="Filter by date"
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