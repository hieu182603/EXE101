import React, { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import styles from "./ShipperOrderList.module.css";
import { OrderDetailView } from "../OrderManager";
import ShipperOrderTable from "./ShipperOrderTable";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook

const ShipperOrderList = ({ shipperId, shipperName, shipperUsername, onClose }) => {
  // Get auth context
  const { user } = useAuth();
  const userRole = user?.role?.name?.toLowerCase() || "user";
  const isShipperRole = userRole === "shipper";
  const hasAdminPrivileges = userRole === "admin" || userRole === "manager";
  const loggedInUsername = user?.username || "";

  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort: "date",
    orderDate: "", // Thêm filter cho ngày đặt hàng
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Check if user has permission to view this shipper's orders
  // For shipper role, they can only view their own orders
  // For admin/manager, they can view all orders
  const hasPermission =
    hasAdminPrivileges ||
    !isShipperRole ||
    (isShipperRole &&
      (user?.id === shipperId || user?.username === shipperUsername));


  // Add notification system
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    // Hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  // Order status options cho shipper (sync với backend enum)
  const statusOptions = [
    { value: "", label: "All status" },
    { value: "PENDING", label: "Pending" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPING", label: "Shipping" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "EXTERNAL", label: "External" },
  ];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      setNotification({ show: false, message: '', type: '' });
      
      // Kiểm tra quyền truy cập
      if (!hasPermission) {
        setError("You do not have permission to view these orders");
        showNotification("You do not have permission to view these orders", "error");
        setLoading(false);
        return;
      }

      const params = {
        status: filters.status || undefined,
        search: filters.search || undefined,
        sort: filters.sort || undefined,
        orderDate: filters.orderDate || undefined,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await orderService.getOrdersByShipper(shipperId, params);

      if (response.success) {
        // Handle nested response structure from Response Interceptor
        const responseData = response.data || {};
        const ordersData = responseData.data || [];
        const total = responseData.pagination?.total || 0;
        const totalPages =
          responseData.pagination?.totalPages ||
          Math.ceil(total / pagination.limit);

        // Đảm bảo orders luôn là array
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setPagination((prev) => ({
          ...prev,
          total: total,
          totalPages: totalPages,
        }));
      } else {
        throw new Error(response.message || "Cannot load order list");
      }
    } catch (err) {
      setError(err.message || "Failed to load order list");
      setOrders([]); // Ensure always set array
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when dependencies change
  useEffect(() => {
    if (shipperId) {
      fetchOrders();
    } else {
      setError("No shipper ID provided");
    }
  }, [shipperId, filters.status, filters.search, filters.sort, filters.orderDate, pagination.page, pagination.limit]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await orderService.updateOrderStatusByShipper(
        shipperId,
        orderId,
        { status: newStatus }
      );

      if (response.success) {
        await fetchOrders(); // Refresh list
        showNotification(
          `Trạng thái đơn hàng #${orderId.substring(
            0,
            8
          )} đã được cập nhật thành ${newStatus}`,
          "success"
        );
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
      showNotification(
        `Không thể cập nhật trạng thái đơn hàng: ${err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle confirm order action
  const handleConfirmOrder = async (orderId) => {
    try {
      setLoading(true);
      // Call the API to confirm the order
      const response = await orderService.confirmOrderByShipper(
        shipperId,
        orderId
      );

      if (response.success) {
        await fetchOrders(); // Refresh list
        showNotification(
          `Đơn hàng #${orderId.substring(0, 8)} đã được xác nhận thành công`,
          "success"
        );
      } else {
        throw new Error(response.message || "Confirmation failed");
      }
    } catch (err) {
      setError(err.message || "Failed to confirm order");
      showNotification(`Không thể xác nhận đơn hàng: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  return (
    <div className={styles.orderListWrapper}>
      {/* Notification */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3>Order list - {shipperName}</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          {/* Search input - đặt đầu tiên và rộng hơn */}
          <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
            <input
              type="text"
              placeholder="Search order ID, customer name..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Status filter */}
          <div className={styles.filterGroup}>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className={styles.filterSelect}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order Date filter - date picker */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Order Date</label>
            <input
              type="date"
              value={filters.orderDate}
              onChange={(e) => handleFilterChange("orderDate", e.target.value)}
              className={styles.filterSelect}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <span>Loading...</span>
        </div>
      ) : (
        <ShipperOrderTable
          orders={orders}
          currentPage={pagination.page}
          totalPages={pagination.totalPages || 1}
          totalOrders={pagination.total}
          itemsPerPage={pagination.limit}
          role={userRole}
          onView={handleViewOrder}
          onStatusUpdate={handleStatusUpdate}
          onConfirm={handleConfirmOrder}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailView
          order={selectedOrder}
          open={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onStatusChange={handleStatusUpdate}
          role={userRole}
        />
      )}
    </div>
  );
};

export default ShipperOrderList;
