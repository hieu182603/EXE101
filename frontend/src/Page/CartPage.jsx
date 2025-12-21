import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CartView from '../components/Cart/CartView';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/header';
import Footer from '../components/footer';

const CartPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { 
        items, 
        totalAmount, 
        loading, 
        error, 
        isInitialized,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        refreshCart
    } = useCart();



    // Handlers for CartView
    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            const currentItem = items.find(item => item.product.id === productId);
            if (!currentItem) return;

            // If new quantity is 0 or less, remove item
            if (newQuantity <= 0) {
                await handleRemoveItem(productId);
                return;
            }

            const difference = newQuantity - currentItem.quantity;
            
            if (difference > 0) {
                await increaseQuantity(productId, difference);
            } else if (difference < 0) {
                await decreaseQuantity(productId, Math.abs(difference));
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeItem(productId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleCheckout = () => {
        if (transformedCartItems.length === 0) {
            alert('Cart is empty! Please add products before checkout.');
            return;
        }
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    // Transform cart items to match CartView expected format - with fallback for empty/undefined items
    const transformedCartItems = (items || []).map(item => {
        const imageUrl = item.product?.images && item.product.images.length > 0 
            ? item.product.images[0].url 
            : item.product?.url || '/img/pc.png';
            
        return {
            id: item.product?.id || item.id, // Use product ID for cart operations
            name: item.product?.name || 'Unknown Product',
            price: item.product?.price || 0,
            quantity: item.quantity || 1,
            category: item.product?.category?.name || 'Product', // Extract name from category object
            image: imageUrl,
            // Pass through the full product data so CartItem can access images
            product: item.product
        };
    });

    const subtotal = totalAmount || 0;
    const shippingFee = subtotal > 1000000 ? 0 : 30000; // Free shipping over 1M VND
    const finalTotal = subtotal + shippingFee;

    // Add cart-page-active class to body to remove main-content padding
    useEffect(() => {
        document.body.classList.add('cart-page-active');
        return () => {
            document.body.classList.remove('cart-page-active');
        };
    }, []);

    // Check authentication but don't block rendering
    useEffect(() => {
        if (!isAuthenticated()) {
            // Don't redirect immediately - let them see the page
        }
    }, [isAuthenticated]);

    // Check for showHistory parameter and redirect to order history page
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('showHistory') === 'true') {
            // Navigate directly to order history page
            navigate('/order-history');
        }
    }, [location.search, navigate]);

    // Remove loading screen - just show cart immediately

    // Show error state
    if (error) {
        return (
            <div style={{ 
                minHeight: '60vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <h3>Error loading cart</h3>
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }



    return (
        <>
            <Header />
            <div style={{ minHeight: '80vh', paddingTop: '10px', paddingBottom: '20px', marginTop: '10px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">

                            <CartView 
                                cartItems={transformedCartItems}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onCheckout={handleCheckout}
                                onContinueShopping={handleContinueShopping}
                                subtotal={subtotal}
                                shippingFee={shippingFee}
                                totalAmount={finalTotal}
                                onViewOrderHistory={() => navigate('/order-history')}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CartPage; 