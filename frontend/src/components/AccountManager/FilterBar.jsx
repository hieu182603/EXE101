import React from "react";
import { Search } from "lucide-react";
import styles from "./FilterBar.module.css";

const FilterBar = ({
  searchTerm = "",
  roleFilter = "all",
  createdDateFilter = "",
  onSearchChange,
  onRoleChange,
  onDateChange,
  onClearFilters,
  availableRoles = [],
}) => {
  const hasActiveFilters =
    searchTerm || roleFilter !== "all" || createdDateFilter;

  const handleClearFilters = () => {
    onSearchChange("");
    onRoleChange("all");
    onDateChange("");
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
            placeholder="Search by username, phone..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select
          className={styles.select}
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          <option value="all">All Roles</option>
          {availableRoles.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.name}
            </option>
          ))}
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
