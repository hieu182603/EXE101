import React, { useState } from 'react';
import cartStyles from './CartView.module.css';
import styles from './OrderHistory.module.css'; 
import { formatDateTime } from '../../utils/dateFormatter';
import { useInvoiceExport } from '../../Hook/useInvoiceExport';
import { useOrders } from '../../Hook/useOrders';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const OrderHistory = ({ 
    orders, 
    totalOrders = 0,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    onOrderUpdate 
}) => {
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const { exportToPDF } = useInvoiceExport();
    const { cancelOrder } = useOrders();
    const [processingOrderIds, setProcessingOrderIds] = useState(new Set());

    // Filter states (cho client-side filtering bổ sung)
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Notification function
    const showNotification = (message, type = "info") => {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#22c55e';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4700);
    };

    // Validate props
    if (!Array.isArray(orders)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>⚠️ Lỗi dữ liệu đơn hàng</h3>
                <p>Dữ liệu đơn hàng không hợp lệ. Vui lòng thử lại.</p>
            </div>
        );
    }

    const toggleOrderDetails = (orderId) => {
        const newExpandedOrders = new Set(expandedOrders);
        if (newExpandedOrders.has(orderId)) {
            newExpandedOrders.delete(orderId);
        } else {
            newExpandedOrders.add(orderId);
        }
        setExpandedOrders(newExpandedOrders);
    };

    const getStatusColor = (status) => {
        if (!status) return '#6b7280'; // Gray for null/undefined
        
        switch (status) {
            case 'PENDING':
                return '#f59e0b'; // Orange - Pending
            case 'ASSIGNED':
                return '#3b82f6'; // Blue - Assigned
            case 'CONFIRMED':
                return '#0ea5e9'; // Light Blue - Confirmed
            case 'SHIPPING':
                return '#8b5cf6'; // Purple - Shipping
            case 'DELIVERED':
                return '#059669'; // Green - Delivered
            case 'CANCELLED':
                return '#ef4444'; // Red - Cancelled
            case 'EXTERNAL':
                return '#64748b'; // Slate - External delivery
            // Fallback for lowercase values (backward compatibility)
            case 'pending':
                return '#f59e0b';
            case 'shipping':
                return '#8b5cf6';
            case 'delivered':
                return '#059669';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280'; // Gray - Default
        }
    };

    const formatDate = (dateString) => {
        try {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const formatted = new Date(dateString).toLocaleDateString('vi-VN', options);
            return formatted;
        } catch (error) {
            return dateString || 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        try {
            const formatted = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount).replace('₫', 'đ');
            return formatted;
        } catch (error) {
            return `${amount || 0} VND`;
        }
    };

    const handleCancelOrder = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
        setCancelReason('');
    };

    const handleCancelConfirm = async () => {
        if (!selectedOrderId || !cancelReason.trim()) {
            showNotification('⚠️ Vui lòng nhập lý do hủy đơn hàng', 'warning');
            return;
        }

        try {
            // Set processing state for this order
            setProcessingOrderIds(prev => new Set(prev).add(selectedOrderId));
            
            // Call API to cancel order
            await cancelOrder(selectedOrderId, cancelReason);
            
            // Update local state immediately
            if (onOrderUpdate) {
                onOrderUpdate((prevOrders) => 
                    prevOrders.map(order => 
                        order.id === selectedOrderId 
                            ? { ...order, status: 'CANCELLED', cancelReason: cancelReason }
                            : order
                    )
                );
            }
            
            showNotification('✅ Đã hủy đơn hàng thành công!', 'success');
            
            // Close modal and reset states
            setShowCancelModal(false);
            setSelectedOrderId(null);
            setCancelReason('');
            
        } catch (error) {
            console.error('Error cancelling order:', error);
            
            // Handle specific error cases
            if (error.message?.includes('account_locked')) {
                showNotification('⚠️ Tài khoản của bạn đã bị khóa do hủy đơn hàng quá nhiều lần. Vui lòng liên hệ hỗ trợ.', 'error');
            } else if (error.message?.includes('order_cannot_cancel')) {
                showNotification('❌ Không thể hủy đơn hàng này vì đã quá thời gian cho phép.', 'error');
            } else {
                showNotification('❌ Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại.', 'error');
            }
        } finally {
            // Remove processing state for this order
            setProcessingOrderIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedOrderId);
                return newSet;
            });
        }
    };

    const handleCancelClose = () => {
        setShowCancelModal(false);
        setSelectedOrderId(null);
        setCancelReason('');
    };

    // Check if order can be cancelled (only pending orders)
    const canCancelOrder = (status) => {
        return status === 'PENDING';
    };

    // Filter orders based on filter criteria (client-side filtering for current page)
    const filteredOrders = orders.filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }

        // Search filter (Order ID or Product name)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const orderId = order.id?.toString().toLowerCase() || '';
            
            // Search in order details product names
            const productMatch = order.orderDetails?.some(detail => 
                detail.product?.name?.toLowerCase().includes(query)
            ) || false;

            if (!orderId.includes(query) && !productMatch) {
                return false;
            }
        }

        // Date range filter
        if (startDate) {
            const orderDate = new Date(order.orderDate);
            const start = new Date(startDate);
            if (orderDate < start) {
                return false;
            }
        }

        if (endDate) {
            const orderDate = new Date(order.orderDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end date
            if (orderDate > end) {
                return false;
            }
        }

        return true;
    });

    // Clear filters function
    const clearFilters = () => {
        setStatusFilter('all');
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
    };

    // Check if any filters are active
    const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() || startDate || endDate;

    return (
        <div className={cartStyles.cartView}>
            {/* Advanced Filter Section */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                margin: '10px 10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        🔍 Find Orders
                    </h3>
                   
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            ✕ Clear filters
                        </button>
                    )}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    alignItems: 'end'
                }}>
                    {/* Order Status Filter */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            Order Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="all">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="SHIPPING">Shipping</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Search Orders */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            Search Orders
                        </label>
                        <input
                            type="text"
                            placeholder="Search by order ID, product name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    {/* Order Date Range */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            From Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                        }}>
                            To Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className={cartStyles.emptyCart}>
                    <h2>🛒 No orders yet</h2>
                    <p>You don't have any orders in your history. Please shop and order now!</p>
                </div>
            ) : (
                <div style={{
                    padding: '5px 10px 20px 10px',
                    width: '100%',
                    marginLeft: '0',
                    marginRight: '0'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        alignItems: 'stretch',
                        maxWidth: '1300px'
                    }}>
                        {filteredOrders.map((order) => {
                            const isExpanded = expandedOrders.has(order.id);
                            const isProcessing = processingOrderIds.has(order.id);

                            return (
                                <div key={order.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                                    width: '100%',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid #f1f5f9',
                                    opacity: isProcessing ? 0.7 : 1,
                                    pointerEvents: isProcessing ? 'none' : 'auto'
                                }}>
                                    {isProcessing && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: '16px',
                                            zIndex: 10
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <div className={styles.spinner}></div>
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: '#3b82f6'
                                                }}>Đang xử lý...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '2px solid #e2e8f0',
                                        marginBottom: '1.5rem',
                                        width: '100%',
                                        position: 'relative'
                                    }}>
                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.4rem', color: '#1f2937', fontWeight: '700', textAlign: 'left' }}>
                                                📦 Order #{order.id}
                                            </h3>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem', textAlign: 'left' }}>
                                                📅 Order date: {formatDateTime(order.orderDate)}
                                            </p>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <span style={{ fontSize: '1rem', color: '#6b7280' }}>Status:</span>
                                                <span style={{
                                                    backgroundColor: getStatusColor(order.status),
                                                    color: 'white',
                                                    padding: '0.5rem 0.8rem',
                                                    borderRadius: '1.5rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    minWidth: '90px',
                                                    display: 'inline-block',
                                                    textAlign: 'center'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            {/* Cancel Order Button - show for cancellable orders only */}
                                            {canCancelOrder(order.status) && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    style={{
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#dc2626';
                                                        e.target.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#ef4444';
                                                        e.target.style.transform = 'translateY(0)';
                                                    }}
                                                    disabled={isProcessing}
                                                >
                                                    ❌ Cancel order
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => toggleOrderDetails(order.id)}
                                                style={{
                                                    backgroundColor: isExpanded ? '#dc2626' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '0.75rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    minWidth: '150px',
                                                    justifyContent: 'center'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                {isExpanded ? '🔼 Hide details' : '🔽 Order details'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Summary Preview (always visible) */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.2rem',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '0.75rem',
                                        marginBottom: isExpanded ? '1.5rem' : '0'
                                    }}>
                                                                <div style={{ fontSize: '1.2rem', color: '#4b5563', textAlign: 'left' }}>
                            <strong>Number of products:</strong> {(order.orderDetails && Array.isArray(order.orderDetails)) ? order.orderDetails.length : 0}
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>
                            <strong>Total amount:</strong> {formatCurrency(
                                order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0
                                    ? order.orderDetails.reduce((sum, item) => {
                                        return sum + ((item.price || 0) * (item.quantity || 0));
                                    }, 0)
                                    : parseFloat(order.totalAmount) || 0
                            )}
                        </div>
                                    </div>

                                    {/* Expanded Order Details */}
                                    {isExpanded && (
                                        <div style={{ 
                                            opacity: 1,
                                            transition: 'opacity 0.3s ease-in-out',
                                            width: '100%' 
                                        }}>
                                            {/* Order Items */}
                                            <div style={{ width: '100%' }}>
                                                <h4 style={{ 
                                                    fontSize: '1.3rem', 
                                                    color: '#1f2937', 
                                                    marginBottom: '1rem',
                                                    fontWeight: '600',
                                                    textAlign: 'left'
                                                }}>
                                                    📋 Product list:
                                                </h4>
                                                                                        {order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0 ? (
                                            order.orderDetails.map((item, index) => (
                                                        <div key={item.id || index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '1rem',
                                                            borderBottom: index < order.orderDetails.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                            backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                                                            borderRadius: '0.5rem',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            {item.product?.images && item.product.images.length > 0 ? (
                                                                <img
                                                                    src={item.product.images[0].url}
                                                                    alt={item.product?.name || 'Product'}
                                                                    style={{
                                                                        width: '80px',
                                                                        height: '80px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px',
                                                                        marginRight: '1.5rem'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.src = '/img/pc.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    backgroundColor: '#f3f4f6',
                                                                    borderRadius: '8px',
                                                                    marginRight: '1.5rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: '#6b7280',
                                                                    fontSize: '12px',
                                                                    border: '2px dashed #d1d5db'
                                                                }}>
                                                                    📦
                                                                </div>
                                                            )}
                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600', textAlign: 'left' }}>
                                                                    {item.product?.name || 'Product not specified'}
                                                                </h4>
                                                                <p style={{ margin: '0 0 0.25rem 0', color: '#6b7280', fontSize: '1rem', textAlign: 'left' }}>
                                                                    {item.product?.category?.name || 'No category'}
                                                                </p>
                                                                <p style={{ margin: 0, color: '#059669', fontSize: '1.1rem', fontWeight: '600', textAlign: 'left' }}>
                                                                    {formatCurrency(item.price || 0)}
                                                                </p>
                                                            </div>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '2rem',
                                                                fontSize: '1.1rem'
                                                            }}>
                                                                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                                                    <span style={{ display: 'block', color: '#6b7280', fontSize: '1rem' }}>Quantity</span>
                                                                    <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{item.quantity || 0}</span>
                                                                </div>
                                                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                                                    <span style={{ display: 'block', color: '#6b7280', fontSize: '1rem' }}>Total</span>
                                                                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#dc2626' }}>
                                                                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{
                                                        padding: '2rem',
                                                        textAlign: 'center',
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: '0.75rem',
                                                        border: '2px dashed #e2e8f0'
                                                    }}>
                                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                                                        <h4 style={{ 
                                                            color: '#6b7280', 
                                                            marginBottom: '0.5rem',
                                                            fontSize: '1.2rem'
                                                        }}>
                                                            No product details
                                                        </h4>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Summary */}
                                            <div style={{
                                                marginTop: '2rem',
                                                paddingTop: '1.5rem',
                                                borderTop: '2px solid #e2e8f0',
                                                width: '100%'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.75rem',
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {(() => {
                                                        // Tính subtotal từ orderDetails, fallback to totalAmount
                                                        const hasOrderDetails = order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0;
                                                        const subtotal = hasOrderDetails 
                                                            ? order.orderDetails.reduce((sum, item) => {
                                                                return sum + ((item.price || 0) * (item.quantity || 0));
                                                            }, 0)
                                                            : parseFloat(order.totalAmount) || 0;

                                                        const shippingFee = 0; 
                                                        const total = subtotal + shippingFee;

                                                        return (
                                                            <>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>
                                                                        {hasOrderDetails 
                                                                            ? `Temporary calculation (${order.orderDetails.length} products):`
                                                                            : 'Temporary calculation:'
                                                                        }
                                                                    </span>
                                                                    <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Shipping fee:</span>
                                                                    <span style={{ fontWeight: '600', color: '#059669' }}>Free</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Payment method:</span>
                                                                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                                                        {order.paymentMethod || 'Not updated'}
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Invoice status:</span>
                                                                    <span style={{ 
                                                                        fontWeight: '600', 
                                                                        color: order.requireInvoice ? '#059669' : '#6b7280',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        {order.requireInvoice ? (
                                                                            <>
                                                                                📄 Invoice Requested
                                                                                {order.status !== 'CANCELLED' && (
                                                                                    <span style={{
                                                                                        background: '#d1fae5',
                                                                                        color: '#065f46',
                                                                                        padding: '2px 6px',
                                                                                        borderRadius: '4px',
                                                                                        fontSize: '10px',
                                                                                        marginLeft: '4px'
                                                                                    }}>
                                                                                        {order.status === 'PENDING' ? 'Ready to export' :
                                                                                         order.status === 'SHIPPING' ? 'Ready to export' :
                                                                                         order.status === 'DELIVERED' ? 'Ready to export' :
                                                                                         order.status === 'COMPLETED' ? 'Ready to export' :
                                                                                         'Ready to export'}
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            '❌ No Invoice Required'
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div style={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between', 
                                                                    padding: '1rem 0', 
                                                                    borderTop: '1px solid #e2e8f0',
                                                                    fontSize: '1.3rem',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    <span>Total:</span>
                                                                    <span style={{ color: '#dc2626' }}>{formatCurrency(total)}</span>
                                                                </div>

                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Export Invoice Button - show if invoice required and order not cancelled */}
                                                {(() => {
                                                    // Sửa logic: Cho phép xuất hóa đơn ngay khi đặt hàng thành công
                                                    // Chỉ loại trừ các status không thể xuất: CANCELLED
                                                    const shouldShowButton = order.requireInvoice &&
                                                      order.status !== 'CANCELLED' &&
                                                      (!order.invoices || !order.invoices.length || order.invoices.every(inv => inv.status !== 'EXPORTED'));
                                                    
                                                    console.log(`Order ${order.id} invoice button check:`, {
                                                        requireInvoice: order.requireInvoice,
                                                        status: order.status,
                                                        invoices: order.invoices,
                                                        shouldShow: shouldShowButton,
                                                        reason: !shouldShowButton ? 
                                                            (!order.requireInvoice ? 'No invoice required' :
                                                             order.status === 'CANCELLED' ? 'Order cancelled' :
                                                             'Invoice already exported') : 'Should show'
                                                    });
                                                    
                                                    return shouldShowButton ? (
                                                        <div style={{
                                                            marginTop: '1.5rem',
                                                            display: 'flex',
                                                            justifyContent: 'flex-end'
                                                        }}>
                                                            <button
                                                                onClick={() => exportToPDF(order)}
                                                                style={{
                                                                    backgroundColor: '#059669',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '0.75rem 1.5rem',
                                                                    borderRadius: '0.5rem',
                                                                    fontSize: '1rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.backgroundColor = '#047857';
                                                                    e.target.style.transform = 'translateY(-1px)';
                                                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.backgroundColor = '#059669';
                                                                    e.target.style.transform = 'translateY(0)';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                📄 Export Invoice
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })()}

                                                {order.shippingAddress && (
                                                    <div style={{
                                                        marginTop: '1.5rem',
                                                        padding: '1.5rem',
                                                        backgroundColor: '#e0f2fe',
                                                        borderRadius: '0.75rem',
                                                        fontSize: '1.2rem',
                                                        fontWeight: 'bold',
                                                        color: '#0c4a6e',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem'
                                                    }}>
                                                        <span style={{fontSize: '1.4rem'}}>📍</span>
                                                        <span>Shipping address:</span>
                                                        <span style={{fontWeight: 700, fontSize: '1.2rem'}}>{order.shippingAddress}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Custom Pagination */}
            {totalPages > 0 && (
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        Display {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders
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
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        animation: 'modalSlideIn 0.3s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Confirm order cancellation
                            </h3>
                        </div>
                        
                        <p style={{
                            margin: '0 0 20px 0',
                            color: '#6b7280',
                            fontSize: '16px',
                            lineHeight: '1.5'
                        }}>
                            Are you sure you want to cancel order #{selectedOrderId}? Please enter the reason for cancellation:
                        </p>
                        
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter the reason for cancellation..."
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '12px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                resize: 'vertical',
                                outline: 'none',
                                marginBottom: '24px',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                            }}
                        />
                        
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={handleCancelClose}
                                style={{
                                    padding: '12px 24px',
                                    border: '2px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#6b7280',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f9fafb';
                                    e.target.style.borderColor = '#d1d5db';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = '#e2e8f0';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#ef4444';
                                }}
                            >
                                Confirm cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 
