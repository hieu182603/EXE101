import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Plus,
  X,
  Save,
  User,
  Phone,
  Calendar,
  Trash2,
  XCircle,
  Eye,
  Edit,
} from "lucide-react";

import OrderTable from "./OrderTable";
import FilterBar from "./FilterBar";
import OrderDetailModal from "./OrderDetailModal";
import styles from "./OrderManagement.module.css";
import { orderService } from "../../services/orderService";

const OrderManagement = forwardRef(({ role = "admin", onFetchOrders }, ref) => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [shipperFilter, setShipperFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const itemsPerPage = 10;

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

  // Fetch orders from API with pagination and filters
  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      // Compose params: filters + pagination
      const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        date: dateFilter || undefined,
        shipper: shipperFilter !== "all" ? shipperFilter : undefined,
        amount: amountFilter !== "all" ? amountFilter : undefined,
        ...params,
      };
      const response = await orderService.getAllOrdersForAdmin(queryParams);

      // Backend returns nested structure due to ResponseInterceptor:
      // { success: true, statusCode: 200, data: { message: "...", data: orders[], pagination: {...} } }
      if (response.data && response.data.data && response.data.pagination) {
        const ordersArr = response.data.data || [];
        const pagination = response.data.pagination || {};
        setOrders(ordersArr);
        setTotalOrders(pagination.total || ordersArr.length);
        setTotalPages(pagination.totalPages || 1);
      } else {
        // Fallback for simpler response format
        const ordersArr = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setOrders(ordersArr);
        setTotalOrders(ordersArr.length);
        setTotalPages(1);
      }
    } catch (err) {
      setError("Cannot load orders: " + err.message);
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on mount and when filters/page change
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    dateFilter,
    shipperFilter,
    amountFilter,
  ]);

  useImperativeHandle(ref, () => ({
    fetchOrders,
  }));

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Modal operations
  const openModal = (mode, order = null) => {
    setModalMode(mode);
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Status update operation
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, {
        status: newStatus,
      });

      if (response.success) {
        showNotification("Update order status successfully", "success");
        await fetchOrders(); // Refresh the list
      } else {
        throw new Error(response.message || "Cannot update order status");
      }
    } catch (error) {
      showNotification(error.message || "An error occurred", "error");
    }
  };

  const handleReject = async (id) => {
    const order = orders.find((o) => o.id === id);
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedOrder) return;

    try {
      // Reject order by changing status to "CANCELLED"
      const response = await orderService.updateOrderStatus(selectedOrder.id, {
        status: "CANCELLED",
        cancelReason: "Rejected by admin",
      });

      if (response.success) {
        showNotification("Reject order successfully", "success");
        await fetchOrders(); // Refresh the list
      } else {
        throw new Error(response.message || "Cannot reject order");
      }

      setShowRejectModal(false);
      setSelectedOrder(null);
    } catch (error) {
      showNotification(error.message || "An error occurred", "error");
    }
  };

  // Export operation
  const handleExportData = async () => {
    try {
      const response = await orderService.exportOrders();

      if (response.success && response.data) {
        // Create download link with proper Excel MIME type
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `orders_${new Date().toISOString().split("T")[0]}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showNotification("Export data successfully", "success");
      } else {
        throw new Error("Cannot export data");
      }
    } catch (error) {
      showNotification("Cannot export data", "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("");
    setShipperFilter("all");
    setAmountFilter("all");
    setCurrentPage(1);
    showNotification("Cleared filters", "info");
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Order management</h1>
            <p className={styles.description}>
              Manage order information and status
            </p>
          </div>

          <div className={styles.headerActions}>
            {/* Removed Export Data button */}
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        shipperFilter={shipperFilter}
        amountFilter={amountFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onDateChange={setDateFilter}
        onShipperChange={setShipperFilter}
        onAmountChange={setAmountFilter}
        onClearFilters={clearFilters}
      />

      {/* Order Table */}
      <OrderTable
        orders={safeOrders}
        currentPage={currentPage}
        totalPages={totalPages}
        totalOrders={totalOrders}
        itemsPerPage={itemsPerPage}
        role={role}
        onView={(order) => openModal("view", order)}
        onStatusUpdate={handleStatusUpdate}
        onReject={role !== "shipper" ? handleReject : undefined}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      {showModal && modalMode === "view" && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          open={showModal}
          onClose={closeModal}
          onStatusChange={handleStatusUpdate}
          role={role}
        />
      )}

      {showRejectModal && selectedOrder && (
        <RejectConfirmation
          order={selectedOrder}
          onConfirm={handleRejectConfirm}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );

  // Helper function for modal title
  function getModalTitle() {
    switch (modalMode) {
      case "view":
        return "Order details";
      default:
        return "";
    }
  }
});

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

// Order Detail Component
const OrderDetail = ({ order }) => (
  <div className={styles.orderDetail}>
    <div className={styles.orderHeader}>
      <div className={styles.orderHeaderInfo}>
        <h3 className={styles.orderHeaderName}>Order #{order.id}</h3>
        <span className={`${styles.status} ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>
    </div>

    <div className={styles.orderDetailGrid}>
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <User size={16} />
          <span>Customer</span>
        </div>
        <div className={styles.detailValue}>
          {order.customer?.name || order.customer?.username}
        </div>
      </div>

      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <Calendar size={16} />
          <span>Order date</span>
        </div>
        <div className={styles.detailValue}>
          {new Date(order.orderDate).toLocaleDateString("vi-VN")}
        </div>
      </div>

      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <span>Tổng tiền</span>
        </div>
        <div className={styles.detailValue}>
          {order.totalAmount?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </div>
      </div>

      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <span>Địa chỉ giao hàng</span>
        </div>
        <div className={styles.detailValue}>{order.shippingAddress}</div>
      </div>

      {order.note && (
        <div className={styles.detailField}>
          <div className={styles.detailLabel}>
            <span>Ghi chú</span>
          </div>
          <div className={styles.detailValue}>{order.note}</div>
        </div>
      )}

      {order.cancelReason && (
        <div className={styles.detailField}>
          <div className={styles.detailLabel}>
            <span>Lý do hủy</span>
          </div>
          <div className={styles.detailValue}>{order.cancelReason}</div>
        </div>
      )}
    </div>

    {order.orderDetails && order.orderDetails.length > 0 && (
      <div className={styles.orderProducts}>
        <h4>Sản phẩm đã đặt</h4>
        <div className={styles.productsList}>
          {order.orderDetails.map((item, index) => (
            <div key={index} className={styles.productItem}>
              <span>{item.product?.name || "Product"}</span>
              <span>x{item.quantity}</span>
              <span>
                {item.price?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Helper function for status class
const getStatusClass = (status) => {
  switch (status) {
    case "PENDING":
      return styles.statusPending;
    case "PENDING_EXTERNAL_SHIPPING":
      return styles.statusPending;
    case "SHIPPING":
      return styles.statusShipping;
    case "DELIVERED":
      return styles.statusDelivered;
    case "CANCELLED":
      return styles.statusCancelled;
    default:
      return styles.statusDefault;
  }
};

// Reject Confirmation Component
const RejectConfirmation = ({ order, onConfirm, onClose }) => (
  <div className={styles.deleteModalOverlay}>
    <div className={styles.deleteModalContent}>
      <div className={styles.deleteModalBody}>
        <div className={styles.deleteIcon}>
          <XCircle size={24} color="#dc2626" />
        </div>
        <h3 className={styles.deleteTitle}>Confirm reject order</h3>
        <p className={styles.deleteMessage}>
          Are you sure you want to reject order "#{order.id}"? The order will be
          changed to "CANCELLED".
        </p>
        <div className={styles.deleteActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmDeleteButton}>
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OrderManagement;
