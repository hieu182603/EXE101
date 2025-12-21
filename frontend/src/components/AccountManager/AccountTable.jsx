import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import styles from "./AccountTable.module.css";
import { formatDate } from "../../utils/dateFormatter";

const AccountTable = ({
  accounts = [],
  currentPage = 1,
  totalPages = 1,
  totalAccounts = 0,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(
    indexOfFirstItem + itemsPerPage,
    totalAccounts
  );

  const getRoleClass = (role) => {
    switch (role?.slug) {
      case "admin":
        return styles.roleAdmin;
      case "manager":
        return styles.roleManager;
      case "staff":
        return styles.roleStaff;
      default:
        return styles.roleDefault;
    }
  };



  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  if (!accounts.length) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <Shield className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No accounts found</h3>
          <p className={styles.emptyDescription}>
            No accounts in system or no matches with current filters
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
              <th className={styles.headerCell}>USERNAME</th>
              <th className={styles.headerCell}>NAME</th>
              <th className={styles.headerCell}>PHONE NUMBER</th>
              <th className={styles.headerCell}>ROLE</th>
              <th className={styles.headerCell}>STATUS</th>
              <th className={styles.headerCell}>CREATED DATE</th>
              <th className={styles.headerCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {accounts.map((account) => (
              <tr key={account.id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <div className={styles.accountInfo}>
                    <div className={styles.avatar}>
                      {getInitial(account.username)}
                    </div>
                    <span className={styles.accountName}>
                      {account.username}
                    </span>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>
                      {account.name || 'Not provided'}
                    </span>
                  </div>
                </td>
                <td className={`${styles.tableCell} ${styles.phoneNumber}`}>
                  {account.phone}
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.role} ${getRoleClass(account.role)}`}
                  >
                    <Shield size={14} />
                    {account.role?.name || "Unknown"}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.status} ${
                      account.isRegistered
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {account.isRegistered ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className={`${styles.tableCell} ${styles.createdDate}`}>
                  {formatDate(account.createdAt)}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actions}>
                    <button
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      onClick={() => onView(account)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => onEdit(account)}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => onDelete(account.username)}
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
          Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {totalAccounts}{" "}
          accounts
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

export default AccountTable;
