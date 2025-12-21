import React, { useState, useRef, useCallback } from 'react';
import { useCart } from '../../contexts/CartContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import styles from './CartItem.module.css';

const CartItem = ({ item }) => {
    const { increaseQuantity, decreaseQuantity, removeItem, operationLoading, selectedItems, toggleItemSelection } = useCart();
    const [optimisticQuantity, setOptimisticQuantity] = useState(item.quantity);
    const debounceRef = useRef(null);

    // Update optimistic quantity when item changes
    React.useEffect(() => {
        setOptimisticQuantity(item.quantity);
    }, [item.quantity]);

    const handleIncrease = useCallback(async () => {
        // Check stock limit
        if (optimisticQuantity >= item.product.stock) return;
        
        // Optimistic update
        const newQuantity = optimisticQuantity + 1;
        setOptimisticQuantity(newQuantity);
        
        try {
            await increaseQuantity(item.product.id, 1);
        } catch (error) {
            // Revert on error
            setOptimisticQuantity(item.quantity);
        }
    }, [increaseQuantity, item.product.id, item.product.stock, optimisticQuantity, item.quantity]);

    const handleDecrease = useCallback(async () => {
        if (optimisticQuantity <= 1) {
            handleRemove();
            return;
        }
        
        // Optimistic update
        const newQuantity = optimisticQuantity - 1;
        setOptimisticQuantity(newQuantity);
        
        try {
            await decreaseQuantity(item.product.id, 1);
        } catch (error) {
            // Revert on error
            setOptimisticQuantity(item.quantity);
        }
    }, [decreaseQuantity, item.product.id, optimisticQuantity, item.quantity]);

    const handleRemove = useCallback(async () => {
        try {
            await removeItem(item.product.id);
        } catch (error) {
            // Handle error silently
        }
    }, [removeItem, item.product.id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount).replace('₫', '₫');
    };

    // Calculate item total using optimistic quantity
    const itemTotal = item.product.price * optimisticQuantity;
    
    // Get item ID for selection
    const itemId = item.product?.id || item.id;
    const isSelected = itemId && selectedItems ? selectedItems.has(itemId) : false;

    const handleSelectionChange = () => {
        if (itemId && toggleItemSelection) {
            toggleItemSelection(itemId);
        }
    };

    return (
        <div className={styles.cartItem}>
            {/* Selection checkbox */}
            <div className={styles.selectionCheckbox}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleSelectionChange}
                    className={styles.checkbox}
                />
            </div>
            
            <div className={styles.productImage}>
                {item.product.images && item.product.images.length > 0 ? (
                    <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name}
                        onError={(e) => {
                            e.target.src = '/img/pc.png';
                        }}
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>No Image</span>
                    </div>
                )}
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{item.product.name}</h3>
                {item.product.category && (
                    <p className={styles.productCategory}>{item.product.category}</p>
                )}
                <p className={styles.productPrice}>
                    {formatCurrency(item.product.price)}
                </p>
                
                {/* Stock info */}
                <div className={styles.stockInfo}>
                    <span className={`${styles.stockStatus} ${item.product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                        {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
            </div>

            <div className={styles.quantityControls}>
                <button 
                    className={styles.quantityBtn}
                    onClick={handleDecrease}
                    disabled={optimisticQuantity <= 0}
                    aria-label="Decrease quantity"
                >
                    <FaMinus />
                </button>
                
                <span className={styles.quantity}>{optimisticQuantity}</span>
                
                <button 
                    className={styles.quantityBtn}
                    onClick={handleIncrease}
                    disabled={optimisticQuantity >= item.product.stock}
                    aria-label="Increase quantity"
                    style={{ opacity: optimisticQuantity >= item.product.stock ? 0.6 : 1 }}
                >
                    <FaPlus />
                </button>
            </div>

            <div className={styles.itemTotal}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>
                    {formatCurrency(itemTotal)}
                </span>
            </div>

            <div className={styles.itemActions}>
                <button 
                    className={styles.removeBtn}
                    onClick={handleRemove}
                    aria-label="Remove item from cart"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
