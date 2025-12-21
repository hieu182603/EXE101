import { useState, useEffect } from 'react';

export const useCheckout = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    const processOrder = async (cartItems, customerDetails, orderActions, navigationActions) => {
        setIsProcessing(true);
        setCheckoutError(null);

        try {
            // Validate cart
            if (!cartItems || cartItems.length === 0) {
                throw new Error('Giỏ hàng trống');
            }

            // Validate customer details
            const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'ward', 'commune'];
            const missingFields = [];
            
            for (const field of requiredFields) {
                if (!customerDetails[field]?.trim()) {
                    missingFields.push(field);
                }
            }
            
            if (missingFields.length > 0) {
                throw new Error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(', ')}`);
            }

            // Calculate totals
            const subtotal = cartItems.reduce((total, item) => {
                const itemTotal = item.price * item.quantity;
                return total + itemTotal;
            }, 0);
            
            const shippingFee = subtotal >= 1000000 ? 0 : 30000;
            const totalAmount = subtotal + shippingFee;

            // Validate order actions
            if (!orderActions || typeof orderActions.createOrder !== 'function') {
                throw new Error('Invalid order actions');
            }

            if (!orderActions.clearCart || typeof orderActions.clearCart !== 'function') {
                throw new Error('Invalid clear cart function');
            }

            // Create order
            const newOrder = orderActions.createOrder(
                cartItems,
                customerDetails,
                subtotal,
                totalAmount,
                shippingFee
            );

            // Clear cart
            orderActions.clearCart();

            // Navigate
            if (navigationActions && typeof navigationActions.goToOrderHistory === 'function') {
                navigationActions.goToOrderHistory();
            }

            // Show success message
            alert('Payment successful');

            return newOrder;
        } catch (error) {
            const errorMessage = error.message || 'An error occurred while processing the order';
            setCheckoutError(errorMessage);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const clearError = () => {
        setCheckoutError(null);
    };

    return {
        isProcessing,
        checkoutError,
        processOrder,
        clearError,
    };
}; 