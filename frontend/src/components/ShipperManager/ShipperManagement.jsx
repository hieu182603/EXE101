import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X,
  Save,
  MapPin,
  Clock,
  Star
} from 'lucide-react';

import ShipperCard from "./ShipperCard";
import FilterBar from "./FilterBar";
import ShipperOrderList from "./ShipperOrderList";
import styles from "./ShipperManagement.module.css";
import { shipperService } from "../../services/shipperService";
import { formatDate } from "../../utils/dateFormatter";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook instead

const ShipperManagement = () => {
  // Access auth context using the hook
  const { user } = useAuth();
  
  // Determine user role from context
  const userRole = user?.role?.name?.toLowerCase() || 'user';
  const isShipperRole = userRole === 'shipper';
  const loggedInUsername = user?.username || '';

  // State management
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShippers, setTotalShippers] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdDateFilter, setCreatedDateFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [availableZones, setAvailableZones] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit', 'add'
  const [selectedShipper, setSelectedShipper] = useState(null);

  // Order list states
  const [showOrderList, setShowOrderList] = useState(false);
  const [selectedShipperForOrders, setSelectedShipperForOrders] = useState(null);

  // New states for working zone management
  const [showWorkingZoneModal, setShowWorkingZoneModal] = useState(false);
  const [selectedShipperForZone, setSelectedShipperForZone] = useState(null);
  const [workingZones, setWorkingZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);

  const itemsPerPage = 5;

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

  // Mock areas and calculate orders for demo
  const mockAreas = ["Downtown", "Midtown", "Brooklyn", "Queens", "Bronx"];
  const mockVehicles = ["Motorcycle", "Small Truck"];

  // Fetch shippers from API
  const fetchShippers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shipperService.getAllShippers();

      if (response.success && response.data && response.data.data) {
        // Backend returns nested structure due to ResponseInterceptor:
        // { success: true, statusCode: 200, data: { success: true, data: shippers } }
        const rawData = response.data.data;

        // Ensure rawData is an array
        const dataArray = Array.isArray(rawData) ? rawData : [];

        const shippersData = dataArray.map((shipper) => {

          // Calculate real statistics from orders
          const totalOrders = shipper.shipperOrders?.length || 0;
              const deliveredOrders =
      shipper.shipperOrders?.filter((order) => order.status === "DELIVERED")
              .length || 0;
          const activeOrders =
            shipper.shipperOrders?.filter((order) =>
              ["SHIPPING", "PENDING"].includes(order.status)
            ).length || 0;
              const cancelledOrders =
      shipper.shipperOrders?.filter((order) => order.status === "CANCELLED")
              .length || 0;

          // Calculate performance metrics
          const deliveryRate =
            totalOrders > 0
              ? ((deliveredOrders / totalOrders) * 100).toFixed(1)
              : "0";

          return {
            id: shipper.id,
            name: shipper.name || "N/A",
            username: shipper.username || "N/A",
            phone: shipper.phone || "N/A",

            // Real data from database
            totalOrders,
            deliveredOrders,
            activeOrders,
            cancelledOrders,
            deliveryRate,

            // Status from database
            status: shipper.isRegistered ? "Active" : "Suspended",
            isRegistered: shipper.isRegistered,

            // Real timestamps
            createdAt: shipper.createdAt,
            updatedAt: shipper.updatedAt,

            // New fields for automatic assignment
            workingZones: shipper.workingZones || [],
            isAvailable: shipper.isAvailable !== undefined ? shipper.isAvailable : true,
            priority: shipper.priority || 1,
            dailyOrderCount: shipper.dailyOrderCount || 0,
            maxDailyOrders: shipper.maxDailyOrders || 10,

            // Keep original order data for reference
            shipperOrders: shipper.shipperOrders || [],
            feedbacks: shipper.feedbacks || [],
          };
        });

        // If user is a shipper, filter the list to only show their own data
        let filteredShippersData = shippersData;
        if (isShipperRole && loggedInUsername) {
          filteredShippersData = shippersData.filter(
            (shipper) => shipper.username === loggedInUsername
          );
          
          console.log(`Filtering shippers for shipper user: ${loggedInUsername}`);
          console.log(`Found ${filteredShippersData.length} matching records`);

          // Auto show order list for shipper's own data
          if (filteredShippersData.length === 1) {
            setSelectedShipperForOrders(filteredShippersData[0]);
            setShowOrderList(true);
          }
        }

        setShippers(filteredShippersData);
        setTotalShippers(filteredShippersData.length);
        setTotalPages(Math.ceil(filteredShippersData.length / itemsPerPage));
      } else {
        throw new Error(response.data?.message || response.message || "Failed to fetch shippers");
      }
    } catch (err) {
      setError("Failed to fetch shippers");
      showNotification("Failed to load shippers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippers();
    fetchAvailableZones();
  }, []);

  // Auto-open order list for shipper account when the component mounts
  useEffect(() => {
    if (isShipperRole && shippers.length === 1) {
      setSelectedShipperForOrders(shippers[0]);
      setShowOrderList(true);
    }
  }, [isShipperRole, shippers]);

  // Fetch available working zones
  const fetchAvailableZones = async () => {
    try {
      setLoadingZones(true);
      const response = await shipperService.getAvailableZones();
      
      if (response.success && response.data) {
        // Lấy danh sách quận từ tỉnh Hà Nội
        const hanoi = "Hà Nội";
        if (response.data.districtsByProvince && response.data.districtsByProvince[hanoi]) {
          setAvailableZones(response.data.districtsByProvince[hanoi]);
        } else {
          // Fallback to hardcoded zones
          const fallbackZones = [
            "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
            "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
            "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
            "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
            "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
          ];
          setAvailableZones(fallbackZones);
        }
      } else {
        // Fallback to hardcoded zones
        const fallbackZones = [
          "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
          "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
          "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
          "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
          "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
        ];
        setAvailableZones(fallbackZones);
      }
    } catch (error) {
      showNotification("Failed to load available zones", "error");
      // Fallback to hardcoded zones on error
      const fallbackZones = [
        "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ",
        "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm",
        "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Phúc Thọ",
        "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ",
        "Thanh Oai", "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
      ];
      setAvailableZones(fallbackZones);
    } finally {
      setLoadingZones(false);
    }
  };

  // Filter shippers
  const filteredShippers = shippers.filter((shipper) => {
    if (!shipper) return false;

    // If user is a shipper, they've already been filtered in fetchShippers
    // No need for additional username filtering here

    const matchesSearch =
      shipper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && shipper.isAvailable) ||
      (statusFilter === "inactive" && !shipper.isAvailable);

    let matchesDate = true;
    if (createdDateFilter && shipper.createdAt) {
      const shipperDate = new Date(shipper.createdAt);
      const filterDate = new Date(createdDateFilter);

      // Compare only the date part (ignore time)
      const shipperDateOnly = new Date(
        shipperDate.getFullYear(),
        shipperDate.getMonth(),
        shipperDate.getDate()
      );
      const filterDateOnly = new Date(
        filterDate.getFullYear(),
        filterDate.getMonth(),
        filterDate.getDate()
      );

      matchesDate = shipperDateOnly.getTime() === filterDateOnly.getTime();
    }

    // Check if shipper works in the selected zone
    let matchesZone = true;
    if (zoneFilter !== 'all') {
      matchesZone = shipper.workingZones && 
        shipper.workingZones.includes(zoneFilter);
    }

    return matchesSearch && matchesStatus && matchesDate && matchesZone;
  });

  // Update pagination when filtered shippers change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredShippers.length / itemsPerPage);
    setTotalPages(newTotalPages);

    // Reset to page 1 if current page is beyond new total
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredShippers, currentPage]);

  // Get current page shippers
  const getCurrentPageShippers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredShippers.slice(startIndex, startIndex + itemsPerPage);
  };

  // Modal operations
  const openModal = (mode, shipper = null) => {
    setModalMode(mode);
    setSelectedShipper(shipper);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShipper(null);
  };

  // Order list operations
  const openOrderList = (shipper) => {
    // If current user is a shipper, only allow viewing their own orders
    if (isShipperRole && shipper.username !== loggedInUsername) {
      showNotification("You don't have permission to view other shippers' orders", "error");
      return;
    }
    
    setSelectedShipperForOrders(shipper);
    setShowOrderList(true);
  };

  const closeOrderList = () => {
    // If user is a shipper, don't allow them to close their order list view
    if (isShipperRole) {
      return;
    }
    
    setShowOrderList(false);
    setSelectedShipperForOrders(null);
  };

  // Working zone operations
  const openWorkingZoneModal = async (shipper) => {
    setSelectedShipperForZone(shipper);
    setWorkingZones(shipper.workingZones || []);
    setShowWorkingZoneModal(true);
    
    // Load available zones if not already loaded
    if (availableZones.length === 0) {
      await fetchAvailableZones();
    }
  };

  const closeWorkingZoneModal = () => {
    setShowWorkingZoneModal(false);
    setSelectedShipperForZone(null);
    setWorkingZones([]);
  };

  const handleWorkingZoneChange = (zone) => {
    setWorkingZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const saveWorkingZones = async () => {
    if (!selectedShipperForZone) return;

    try {
      const response = await shipperService.updateWorkingZone(
        selectedShipperForZone.id,
        workingZones
      );

      if (response.success) {
        showNotification("Working zones updated successfully", "success");
        await fetchShippers(); // Refresh the list
        closeWorkingZoneModal();
      } else {
        throw new Error(response.message || "Failed to update working zones");
      }
    } catch (error) {
      showNotification(error.message || "An error occurred", "error");
    }
  };

  const toggleAvailability = async (shipperId, currentAvailability) => {
    try {
      const response = await shipperService.updateAvailability(
        shipperId,
        !currentAvailability
      );

      if (response.success) {
        showNotification(
          `Shipper ${!currentAvailability ? 'activated' : 'deactivated'} successfully`, 
          "success"
        );
        await fetchShippers(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update availability");
      }
    } catch (error) {
      showNotification(error.message || "An error occurred", "error");
    }
  };

  const updatePriority = async (shipperId, newPriority) => {
    try {
      const response = await shipperService.updatePriority(shipperId, newPriority);

      if (response.success) {
        showNotification("Priority updated successfully", "success");
        await fetchShippers(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update priority");
      }
    } catch (error) {
      showNotification(error.message || "An error occurred", "error");
    }
  };

  // CRUD operations
  const handleSave = async (formData) => {
    try {
      if (modalMode === "add") {
        const createData = {
          username: formData.username,
          password: formData.password || "12345678", // Default password
          fullName: formData.name,
          phone: formData.phone,
        };

        const response = await shipperService.createShipper(createData);

        if (response.success) {
          showNotification("Shipper added successfully", "success");
          await fetchShippers(); // Refresh the list
        } else {
          throw new Error(response.message || "Failed to create shipper");
        }
      } else if (modalMode === "edit" && selectedShipper) {
        const updateData = {
          username: formData.username,
          fullName: formData.name,
          phone: formData.phone,
          isRegistered: formData.isRegistered,
        };

        const response = await shipperService.updateShipper(
          selectedShipper.id,
          updateData
        );

        if (response.success) {
          showNotification("Shipper updated successfully", "success");
          await fetchShippers(); // Refresh the list
        } else {
          throw new Error(response.message || "Failed to update shipper");
        }
      }
      closeModal();
    } catch (error) {
      showNotification(error.message || "An error occurred", "error");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this shipper?")) {
      try {
        const response = await shipperService.deleteShipper(id);

        if (response.success) {
          showNotification("Shipper deleted successfully", "success");
          await fetchShippers(); // Refresh the list
        } else {
          throw new Error(response.message || "Failed to delete shipper");
        }
      } catch (error) {
        showNotification(error.message || "An error occurred", "error");
      }
    }
  };

  // Export operation
  const handleExportData = async () => {
    try {
      const response = await shipperService.exportShippers();
      
      if (response.success && response.data) {
        // Get filename from response or use default
        const filename = response.meta?.filename || `shippers_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Create and download CSV file
        const csvContent = response.data;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        showNotification(
          `Data exported successfully (${response.meta?.totalRecords || 0} records)`, 
          'success'
        );
      } else {
        throw new Error(response.message || 'Failed to export data');
      }
    } catch (error) {
      showNotification('Failed to export data: ' + error.message, 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingText}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorText}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Only allow admin/manager to add new shippers
  const hasAdminPrivileges = userRole === 'admin' || userRole === 'manager';

  // If user is a shipper and order list is open, just show the order list
  if (isShipperRole && showOrderList && selectedShipperForOrders) {
    return (
      <div className={styles.container}>
        <ShipperOrderList
          shipperId={selectedShipperForOrders.id}
          shipperName={selectedShipperForOrders.name}
          shipperUsername={selectedShipperForOrders.username}
          onClose={closeOrderList}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Shipper Management</h1>
            <p className={styles.description}>
              Manage delivery information and performance
            </p>
          </div>

          <div className={styles.headerActions}>
            {hasAdminPrivileges && (
              <button
                className={`${styles.actionButton} ${styles.addButton}`}
                onClick={() => openModal("add")}
              >
                <Plus size={18} />
                <span>Add Shipper</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        createdDateFilter={createdDateFilter}
        zoneFilter={zoneFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onDateChange={setCreatedDateFilter}
        onZoneChange={setZoneFilter}
        availableZones={availableZones}
      />

      {/* Shipper Cards */}
      <ShipperCard
        shippers={getCurrentPageShippers()}
        currentPage={currentPage}
        totalPages={totalPages}
        totalShippers={filteredShippers.length}
        itemsPerPage={itemsPerPage}
        onView={(shipper) => openModal("view", shipper)}
        onEdit={(shipper) => openModal("edit", shipper)}
        onViewOrders={openOrderList}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
        onManageWorkingZones={openWorkingZoneModal}
        onToggleAvailability={toggleAvailability}
        onUpdatePriority={updatePriority}
        userRole={userRole} // Pass the user's role to ShipperCard
      />

      {/* Modal */}
      {showModal && (
        <Modal isOpen={showModal} title={getModalTitle()} onClose={closeModal}>
          <ShipperForm
            mode={modalMode}
            initialData={selectedShipper}
            onSubmit={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {/* Order List Modal */}
      {showOrderList && selectedShipperForOrders && (
        <div className={styles.orderListModalOverlay}>
          <div className={styles.orderListModal}>
            <ShipperOrderList
              shipperId={selectedShipperForOrders.id}
              shipperName={selectedShipperForOrders.name}
              shipperUsername={selectedShipperForOrders.username}
              onClose={closeOrderList}
            />
          </div>
        </div>
      )}

      {/* Working Zone Modal */}
      {showWorkingZoneModal && selectedShipperForZone && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Manage Working Zones - {selectedShipperForZone.name}
              </h2>
              <button onClick={closeWorkingZoneModal} className={styles.closeButton}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.workingZoneContent}>
              <div className={styles.zoneSelection}>
                <h3>Select Working Zones for {selectedShipperForZone?.name}:</h3>
                {loadingZones ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingContent}>
                      <div className={styles.loadingText}>Loading available zones...</div>
                    </div>
                  </div>
                ) : (
                <div className={styles.zoneGrid}>
                  {availableZones.map((zone) => (
                    <label key={zone} className={styles.zoneCheckbox}>
                      <input
                        type="checkbox"
                        checked={workingZones.includes(zone)}
                        onChange={() => handleWorkingZoneChange(zone)}
                      />
                      <span>{zone}</span>
                    </label>
                  ))}
                </div>
                )}
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={closeWorkingZoneModal}
                  className={`${styles.formButton} ${styles.cancelFormButton}`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveWorkingZones}
                  className={`${styles.formButton} ${styles.saveButton}`}
                >
                  <Save size={16} />
                  <span>Save Zones</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function for modal title
  function getModalTitle() {
    switch (modalMode) {
      case "view":
        return "Shipper Details";
      case "edit":
        return "Edit Shipper";
      case "add":
        return "Add New Shipper";
      default:
        return "";
    }
  }
};

// Modal Component
const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Shipper Form Component
const ShipperForm = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    username: initialData?.username || "",
    phone: initialData?.phone || "",
    status: initialData?.status || "Active",
    isRegistered:
      initialData?.isRegistered !== undefined ? initialData.isRegistered : true,
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (formData.name.length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    }

    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Support both formats: 0xxxxxxxxx or +84xxxxxxxxx
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone format: 0xxxxxxxxx or +84xxxxxxxxx";
    }

    if (
      mode === "add" &&
      (!formData.password || formData.password.length < 8)
    ) {
      newErrors.password = "Password must be at least 8 characters";
    }

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

    // Handle boolean conversion for isRegistered field
    const finalValue = name === "isRegistered" ? value === "true" : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isViewMode = mode === "view";

  if (isViewMode) {
    return (
      <div className={styles.viewContainer}>
        {/* Basic Information */}
        <div className={styles.viewSection}>
          <h3 className={styles.viewSectionTitle}>Basic Information</h3>
          <div className={styles.viewGrid}>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Full Name:</span>
              <span className={styles.viewValue}>
                {initialData?.name || "N/A"}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Username:</span>
              <span className={styles.viewValue}>
                {initialData?.username || "N/A"}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Phone:</span>
              <span className={styles.viewValue}>
                {initialData?.phone || "N/A"}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Status:</span>
              <span
                className={`${styles.viewValue} ${
                  initialData?.status === "Active"
                    ? styles.statusActiveText
                    : styles.statusInactiveText
                }`}
              >
                {initialData?.status || "N/A"}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Member Since:</span>
              <span className={styles.viewValue}>
                {formatDate(initialData?.createdAt)}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Last Updated:</span>
              <span className={styles.viewValue}>
                {formatDate(initialData?.updatedAt)}
              </span>
            </div>
            {/* New fields for automatic assignment */}
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Availability:</span>
              <span className={styles.viewValue}>
                {initialData?.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Priority:</span>
              <span className={styles.viewValue}>
                {initialData?.priority || 1}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Daily Orders:</span>
              <span className={styles.viewValue}>
                {initialData?.dailyOrderCount || 0} 
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Working Zones:</span>
              <span className={styles.viewValue}>
                {initialData?.workingZones?.length > 0 
                  ? initialData.workingZones.join(", ")
                  : "Not set"
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label className={styles.label}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={`${styles.input} ${
              errors.name ? styles.errorInput : ""
            }`}
          />
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={`${styles.input} ${
              errors.username ? styles.errorInput : ""
            }`}
          />
          {errors.username && (
            <span className={styles.errorMessage}>{errors.username}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={`${styles.input} ${
              errors.phone ? styles.errorInput : ""
            }`}
          />
          {errors.phone && (
            <span className={styles.errorMessage}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={styles.select}
          >
            <option value="Active">Active</option>
            <option value="On Break">On Break</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Registration Status *</label>
          <select
            name="isRegistered"
            value={formData.isRegistered}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={styles.select}
          >
            <option value={true}>Registered</option>
            <option value={false}>Not Registered</option>
          </select>
        </div>

        {mode === "add" && (
          <div className={styles.formField}>
            <label className={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`${styles.input} ${
                errors.password ? styles.errorInput : ""
              }`}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>
        )}
      </div>

      {!isViewMode && (
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.formButton} ${styles.cancelFormButton}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.formButton} ${styles.saveButton}`}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </form>
  );
};

export default ShipperManagement;
