import React from 'react';
import { X, Calendar, MapPin, CreditCard, Package, Truck } from 'lucide-react';
import styles from './OrderDetailModal.module.css';
import { formatDateTime } from '../../utils/dateFormatter';

const OrderDetailView = ({ order, open, onClose, role = 'admin', showStatusUpdate = true }) => {
  if (!open || !order) return null;

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount).replace('₫', 'đ');
    } catch (error) {
      return `${amount || 0} VND`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'SHIPPING': return '#3b82f6';
      case 'DELIVERED': return '#059669';
      case 'CANCELLED': return '#ef4444';
      // Fallback for lowercase values (backward compatibility)
      case 'pending': return '#f59e0b';
      case 'shipping': return '#3b82f6';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Calculate order summary
  const orderDetails = order.orderDetails || [];
  const subtotal = orderDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; 
  const total = subtotal + shippingFee;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Package className={styles.headerIcon} />
            <div>
              <h2 className={styles.title}>Order details</h2>
              <p className={styles.orderId}>#{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Left Column - Order Info */}
          <div className={styles.leftColumn}>
            {/* Order Info */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Calendar className={styles.sectionIcon} />
                <h3>Order information</h3>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Order date:</span>
                  <span className={styles.value}>{formatDateTime(order.orderDate)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Status:</span>
                  <span 
                    className={styles.status}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                
                {order.cancelReason && (
                  <div className={styles.infoItem}>
                      <span className={styles.label}>Reason for cancellation:</span>
                    <span className={styles.value} style={{ color: '#ef4444' }}>{order.cancelReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <MapPin className={styles.sectionIcon} />
                <h3>Shipping address</h3>
              </div>
              <div className={styles.shippingCard}>
                <Truck className={styles.shippingIcon} />
                <p>{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Products */}
          <div className={styles.rightColumn}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Package className={styles.sectionIcon} />
                <h3>Products ordered({orderDetails.length})</h3>
              </div>
              
              <div className={styles.productsList}>
                {orderDetails.length > 0 ? (
                  orderDetails.map((item, index) => (
                    <div key={index} className={styles.productItem}>
                      <div className={styles.productImage}>
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product?.name}
                            onError={(e) => {
                              e.target.src = '/img/pc.png';
                            }}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h4>{item.product?.name || 'Unknown Product'}</h4>
                        <p className={styles.category}>{item.product?.category?.name || 'No Category'}</p>
                        <div className={styles.priceQty}>
                          <span className={styles.price}>{formatCurrency(item.price)}</span>
                          <span className={styles.quantity}>x {item.quantity}</span>
                        </div>
                      </div>
                      <div className={styles.productTotal}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyProducts}>
                    <Package className={styles.emptyIcon} />
                    <p>There are no products in the order</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className={styles.orderSummary}>
                <div className={styles.summaryRow}>
                  <span>Provisional ({orderDetails.length} product):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping fee:</span>
                  <span style={{ color: '#059669' }}>free shipping</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailView; 