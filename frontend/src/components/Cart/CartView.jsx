import React from 'react';
import { useCart } from '../../contexts/CartContext';
import styles from './CartView.module.css';

// History icon component
const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
    </svg>
);

// Shopping icon component
const ShoppingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
    </svg>
);

// Empty Cart icon component
const EmptyCartIcon = () => (
    <svg className={styles.emptyCartIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.5 9.4L12.9 5.8M18 5V5C18 4.44772 17.5523 4 17 4H7C6.44772 4 6 4.44772 6 5V5M4 7H20M10 11V17M14 11V17M5 7L6 19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CartView = ({ 
    cartItems, 
    onUpdateQuantity, 
    onRemoveItem, 
    onCheckout, 
    onViewOrderHistory, 
    onContinueShopping,
    subtotal, 
    shippingFee, 
    totalAmount 
}) => {
    const { selectedItems, getSelectedSubtotal } = useCart();
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'đ');
    };

    // Calculate selection state
    const selectedCount = cartItems.filter(item => {
        const itemId = item.product?.id || item.id;
        return itemId && selectedItems.has(itemId);
    }).length;

    // Calculate totals for selected items
    const selectedSubtotal = getSelectedSubtotal();
    const selectedShippingFee = selectedSubtotal > 0 ? (selectedSubtotal >= 1000000 ? 0 : 30000) : 0;
    const selectedTotal = selectedSubtotal + selectedShippingFee;

    return (
        <>
        <div className={styles.cartView} style={{ marginTop: '0', paddingTop: '0' }}>
            {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                    <EmptyCartIcon />
                    <h2>Your cart is empty</h2>
                    <p>Add products to cart to proceed with checkout</p>
                    <button onClick={onContinueShopping} className={styles.continueShoppingButton}>
                        <ShoppingIcon />
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className={styles.cartContent}>
                    <div className={styles.cartItems}>
                        {/* Select All checkbox đã được xóa khỏi đây */}
                        {cartItems.map(item => (
                            <div key={item.id} className={styles.cartItem} style={{alignItems: 'center', minHeight: '150px'}}>
                                <button 
                                    onClick={() => onRemoveItem(item.id)}
                                    className={styles.removeButton}
                                    aria-label="Remove item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                    </svg>
                                </button>
                                <div className={styles.leftSection}>
                                    {(() => {
                                        // Debug log for cart item image
                                        console.log('🛒 CartView Image Debug:', {
                                            itemId: item.id,
                                            hasProduct: !!item.product,
                                            hasImages: !!(item.product?.images),
                                            hasImageFallback: !!(item.image),
                                            itemName: item.name
                                        });

                                        // Try multiple image sources
                                        const imageUrl = 
                                            (item.product?.images && item.product.images.length > 0 && item.product.images[0]?.url) ||
                                            item.product?.image ||
                                            item.image ||
                                            item.imageUrl;

                                        return imageUrl ? (
                                            <img 
                                                src={imageUrl} 
                                                alt={item.name}
                                                className={styles.itemImage}
                                                onError={(e) => {
                                                    console.log('🖼️ CartView image load failed');
                                                    e.target.src = '/img/pc.png';
                                                }}
                                            />
                                        ) : (
                                            <div className={`${styles.itemImage} ${styles.imagePlaceholder}`}>
                                                <span>📦</span>
                                            </div>
                                        );
                                    })()}
                                    <div className={styles.quantityControls}>
                                        <span className={styles.quantityLabel}>Quantity:</span>
                                        <div className={styles.quantityInputGroup}>
                                            <button 
                                                onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                className={styles.quantityButton}
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button 
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className={styles.quantityButton}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.itemContent}>
                                    <div className={styles.itemInfo}>
                                        <h3 className={styles.itemName}>{item.name}</h3>
                                        <p className={styles.itemCategory}>{item.category}</p>
                                    </div>
                                </div>
                                <div className={styles.rightSection}>
                                    <div className={styles.itemTotal}>
                                        <span>Total:</span>
                                        <span className={styles.totalValue}>
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.cartSummary}>
                        <h2>Order Summary</h2>
                        {selectedCount === 0 && (
                            <div className={styles.noSelectionWarning}>
                                <p>⚠️ Please select at least 1 product to checkout</p>
                            </div>
                        )}
                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal ({selectedCount} selected items)</span>
                                <span>{formatCurrency(selectedSubtotal)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping Fee</span>
                                <span>{selectedShippingFee === 0 ? 'Free' : formatCurrency(selectedShippingFee)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>{formatCurrency(selectedTotal)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onCheckout}
                            className={`${styles.checkoutButton} ${selectedCount === 0 ? styles.disabled : ''}`}
                            disabled={selectedCount === 0}
                        >
                            Checkout
                        </button>
                        <button 
                            onClick={onContinueShopping} 
                            className={styles.continueShoppingBtn}
                        >
                            <ShoppingIcon />
                            Continue Shopping
                        </button>
                        {totalAmount > 1000000 && shippingFee === 0 && (
                            <p className={styles.shippingPromo}>
                                Free shipping for orders over 1,000,000₫
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default CartView;
