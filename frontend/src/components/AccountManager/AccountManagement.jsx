import React, { useState, useEffect } from "react";
import { Plus, X, Save, User, Phone, Trash2, Shield } from "lucide-react";

import AccountTable from "./AccountTable";
import FilterBar from "./FilterBar";
import styles from "./AccountManagement.module.css";
import './AccountFormOverride.css'; // Import CSS override
import { accountService } from "../../services/accountService";
import { formatDate } from "../../utils/dateFormatter";

const AccountManagement = () => {
  // State management
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [createdDateFilter, setCreatedDateFilter] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit', 'add'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const itemsPerPage = 10;

  // Available roles - will be fetched from API
  const [availableRoles, setAvailableRoles] = useState([]);

  // Notification function
  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `${styles.notification} ${
      styles[`notification${type.charAt(0).toUpperCase() + type.slice(1)}`]
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      console.log("🔄 [AccountManagement] Starting fetchRoles...");
      
      const response = await accountService.getRoles();
      console.log("📡 [AccountManagement] Roles API Response:", response);

      if (response.success && response.data) {
        // Make sure we're getting an array of roles
        const rolesData = Array.isArray(response.data) ? response.data : 
                          (response.data.data && Array.isArray(response.data.data)) ? 
                          response.data.data : [];
                          
        // Map roles to the format needed by the component
        const mappedRoles = rolesData.map(role => ({
          id: role.id,
          name: role.name.charAt(0).toUpperCase() + role.name.slice(1), 
          slug: role.slug || role.name.toLowerCase() 
        }));
        
        console.log("✅ [AccountManagement] Mapped roles:", mappedRoles);
        
        setAvailableRoles(mappedRoles);
      } else {
        console.error("❌ [AccountManagement] Roles API Failed:", response);
        showNotification("Failed to load roles", "error");
        // Nếu API thất bại, sử dụng danh sách vai trò mặc định (không có admin)
        setAvailableRoles([
          { id: 'staff-id', slug: "staff", name: "Staff" },
          { id: 'manager-id', slug: "manager", name: "Manager" },
        ]);
      }
    } catch (err) {
      console.error("💥 [AccountManagement] Error fetching roles:", err);
      showNotification("Failed to load roles", "error");
      // Nếu API thất bại, sử dụng danh sách vai trò mặc định (không có admin)
      setAvailableRoles([
        { id: 'staff-id', slug: "staff", name: "Staff" },
        { id: 'manager-id', slug: "manager", name: "Manager" },
      ]);
    }
  };

  // Fetch accounts from API
  const fetchAccounts = async () => {
    try {
      console.log("🔄 [AccountManagement] Starting fetchAccounts...");
      setLoading(true);
      setError(null);

      const response = await accountService.getAllAccounts();
      console.log("📡 [AccountManagement] API Response:", response);

      if (response.success && response.data) {
        console.log("✅ [AccountManagement] API Success - Raw data:", response.data);

        // Access nested data structure if needed
        const rawData = response.data.data || response.data;
        console.log("🔍 [AccountManagement] Raw data after extraction:", rawData);

        // Ensure data is an array
        const dataArray = Array.isArray(rawData) ? rawData : [];
        console.log("📊 [AccountManagement] Data array length:", dataArray.length);

        const accountsData = dataArray.map((account) => ({
          id: account.id,
          username: account.username,
          name: account.name || '',
          phone: account.phone,
          role: account.role || { name: "Unknown", slug: "unknown" },
          createdAt: account.createdAt,
          isRegistered:
            account.isRegistered !== undefined ? account.isRegistered : true,
        }));

        console.log("[AccountManagement] Mapped accounts data:", accountsData);

        setAccounts(accountsData);
        setTotalAccounts(accountsData.length);
        setTotalPages(Math.ceil(accountsData.length / itemsPerPage));

        console.log(
          "💾 [AccountManagement] State updated - accounts length:",
          accountsData.length
        );
      } else {
        console.error("❌ [AccountManagement] API Failed:", response);
        throw new Error(response.message || "Failed to fetch accounts");
      }
    } catch (err) {
      console.error("💥 [AccountManagement] Error fetching accounts:", err);
      setError("Failed to fetch accounts");
      showNotification("Failed to load accounts", "error");
    } finally {
      setLoading(false);
      console.log("🏁 [AccountManagement] fetchAccounts completed");
    }
  };

  useEffect(() => {
    // Fetch roles first, then accounts
    fetchRoles().then(() => fetchAccounts());
  }, []);

  // Filter accounts
  const filteredAccounts = accounts.filter((account) => {
    if (!account) return false;

    const matchesSearch =
      account.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" || account.role?.slug === roleFilter;

    let matchesDate = true;
    if (createdDateFilter && account.createdAt) {
      const accountDate = new Date(account.createdAt);
      const filterDate = new Date(createdDateFilter);

      const accountDateOnly = new Date(
        accountDate.getFullYear(),
        accountDate.getMonth(),
        accountDate.getDate()
      );
      const filterDateOnly = new Date(
        filterDate.getFullYear(),
        filterDate.getMonth(),
        filterDate.getDate()
      );

      matchesDate = accountDateOnly.getTime() === filterDateOnly.getTime();
    }

    return matchesSearch && matchesRole && matchesDate;
  });

  // Update pagination when filtered accounts change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    setTotalPages(newTotalPages);

    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredAccounts, currentPage]);

  // Get current page accounts
  const getCurrentPageAccounts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageData = filteredAccounts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    return currentPageData;
  };

  // Modal operations
  const openModal = (mode, account = null) => {
    setModalMode(mode);
    setSelectedAccount(account);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
  };

  // CRUD operations
  const handleSave = async (formData) => {
    try {
      if (modalMode === "add") {
        const createData = {
          username: formData.username,
          name: formData.name,
          password: formData.password || "12345678",
          phone: formData.phone,
          roleSlug: formData.roleSlug,
        };

        const response = await accountService.createAccount(createData);

        if (response.success) {
          showNotification("Account created successfully", "success");
          await fetchAccounts();
        }
      } else if (modalMode === "edit") {
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          roleSlug: formData.roleSlug,
        };

        const response = await accountService.updateAccount(
          selectedAccount.username,
          updateData
        );

        if (response.success) {
          showNotification("Account updated successfully", "success");
          await fetchAccounts();
        }
      }
      closeModal();
    } catch (error) {
      console.error("Save error:", error);
      
      // Xử lý lỗi cụ thể
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Kiểm tra lỗi không tìm thấy vai trò
        if (errorData.message && errorData.message.includes("Role not found")) {
          showNotification(`Error: Role not found. Please select a valid role.`, "error");
        } else {
          showNotification(`Error: ${errorData.message || "Operation failed"}`, "error");
        }
      } else {
        showNotification("Operation failed", "error");
      }
    }
  };

  const handleDelete = async (username) => {
    setSelectedAccount(accounts.find((acc) => acc.username === username));
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedAccount) {
        const response = await accountService.deleteAccount(
          selectedAccount.username
        );

        if (response.success) {
          showNotification("Account deleted successfully", "success");
          await fetchAccounts();
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Failed to delete account", "error");
    } finally {
      setShowDeleteModal(false);
      setSelectedAccount(null);
    }
  };

  function getModalTitle() {
    switch (modalMode) {
      case "add":
        return "Add New Account";
      case "edit":
        return "Edit Account";
      case "view":
        return "Account Details";
      default:
        return "Account";
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading accounts...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <Shield className={styles.titleIcon} />
            Account Management
          </h1>
          <p className={styles.subtitle}>Manage system accounts and roles</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={() => openModal("add")}>
            <Plus size={20} />
            Add Account
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <FilterBar
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          createdDateFilter={createdDateFilter}
          onSearchChange={setSearchTerm}
          onRoleChange={setRoleFilter}
          onDateChange={setCreatedDateFilter}
          availableRoles={availableRoles}
        />

        <AccountTable
          accounts={getCurrentPageAccounts()}
          currentPage={currentPage}
          totalPages={totalPages}
          totalAccounts={filteredAccounts.length}
          itemsPerPage={itemsPerPage}
          onView={(account) => openModal("view", account)}
          onEdit={(account) => openModal("edit", account)}
          onDelete={handleDelete}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      {showModal && (
        <Modal isOpen={showModal} title={getModalTitle()} onClose={closeModal}>
          {modalMode === "view" ? (
            <AccountDetail account={selectedAccount} />
          ) : (
            <AccountForm
              mode={modalMode}
              initialData={selectedAccount}
              availableRoles={availableRoles}
              onSubmit={handleSave}
              onCancel={closeModal}
            />
          )}
        </Modal>
      )}

      {showDeleteModal && (
        <DeleteConfirmation
          account={selectedAccount}
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>
  );
};

// Account Detail Component
const AccountDetail = ({ account }) => (
  <div className={styles.accountDetail}>
    <div className={styles.detailRow}>
      <User className={styles.detailIcon} />
      <div>
        <label className={styles.detailLabel}>Username</label>
        <p className={styles.detailValue}>{account.username}</p>
      </div>
    </div>

    <div className={styles.detailRow}>
      <User className={styles.detailIcon} />
      <div>
        <label className={styles.detailLabel}>Name</label>
        <p className={styles.detailValue}>{account.name || 'Not provided'}</p>
      </div>
    </div>

    <div className={styles.detailRow}>
      <Phone className={styles.detailIcon} />
      <div>
        <label className={styles.detailLabel}>Phone</label>
        <p className={styles.detailValue}>{account.phone}</p>
      </div>
    </div>

    <div className={styles.detailRow}>
      <Shield className={styles.detailIcon} />
      <div>
        <label className={styles.detailLabel}>Role</label>
        <p className={styles.detailValue}>{account.role?.name}</p>
      </div>
    </div>

    <div className={styles.detailRow}>
      <div>
        <label className={styles.detailLabel}>Created Date</label>
        <p className={styles.detailValue}>
          {formatDate(account.createdAt)}
        </p>
      </div>
    </div>
  </div>
);

// Account Form Component
const AccountForm = ({
  mode,
  initialData,
  availableRoles,
  onSubmit,
  onCancel,
}) => {
  // Đảm bảo roleSlug mặc định hợp lệ dựa trên availableRoles
  const getDefaultRoleSlug = () => {
    // Nếu có vai trò từ dữ liệu ban đầu và vai trò đó tồn tại trong danh sách
    if (initialData?.role?.slug && 
        availableRoles.some(role => role.slug === initialData.role.slug)) {
      return initialData.role.slug;
    }
    
    // Ưu tiên staff nếu có, nếu không thì lấy vai trò đầu tiên trong danh sách
    const staffRole = availableRoles.find(role => role.slug === "staff");
    return staffRole ? staffRole.slug : (availableRoles[0]?.slug || "");
  };

  const [formData, setFormData] = useState({
    username: initialData?.username || "",
    name: initialData?.name || "",
    password: "",
    phone: initialData?.phone || "",
    roleSlug: getDefaultRoleSlug(),
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (mode === "add") {
      if (!formData.username.trim())
        newErrors.username = "Username is required";
      if (!formData.password.trim())
        newErrors.password = "Password is required";
    }
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.roleSlug) newErrors.roleSlug = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {mode === "add" && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`${styles.input} ${
              errors.username ? styles.inputError : ""
            }`}
            placeholder="Enter username"
          />
          {errors.username && (
            <span className={styles.errorText}>{errors.username}</span>
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${
            errors.name ? styles.inputError : ""
          }`}
          placeholder="Enter full name"
        />
        {errors.name && (
          <span className={styles.errorText}>{errors.name}</span>
        )}
      </div>

      {mode === "add" && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.input} ${
              errors.password ? styles.inputError : ""
            }`}
            placeholder="Enter password"
          />
          {errors.password && (
            <span className={styles.errorText}>{errors.password}</span>
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
          placeholder="Enter phone number"
        />
        {errors.phone && (
          <span className={styles.errorText}>{errors.phone}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Role *</label>
        <select
          name="roleSlug"
          value={formData.roleSlug}
          onChange={handleChange}
          className={`${styles.input} ${
            errors.roleSlug ? styles.inputError : ""
          }`}
        >
          {availableRoles.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.roleSlug && (
          <span className={styles.errorText}>{errors.roleSlug}</span>
        )}
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className={styles.saveButton}>
          <Save size={18} />
          {mode === "add" ? "Create Account" : "Update Account"}
        </button>
      </div>
    </form>
  );
};

// Delete Confirmation Component
const DeleteConfirmation = ({ account, onConfirm, onClose }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.deleteHeader}>
        <Trash2 className={styles.deleteIcon} />
        <h3 className={styles.deleteTitle}>Delete Account</h3>
      </div>

      <div className={styles.deleteContent}>
        <p>Are you sure you want to delete the account:</p>
        <strong>{account?.username}</strong>
        <p className={styles.deleteWarning}>This action cannot be undone.</p>
      </div>

      <div className={styles.deleteActions}>
        <button className={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.deleteButton} onClick={onConfirm}>
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>
    </div>
  </div>
);

export default AccountManagement;
