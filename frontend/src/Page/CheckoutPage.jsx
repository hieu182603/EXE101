import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import CheckoutForm from '../components/Cart/CheckoutForm';
import './CheckoutPage.css';
import Header from '../components/header';
import Footer from '../components/footer';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { items, totalAmount, loading, error, isInitialized, refreshCart, clearCart } = useCart();
    const [orderData, setOrderData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [validatedCart, setValidatedCart] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState(null);

    // Check authentication but don't block rendering
    useEffect(() => {
        if (!isAuthenticated()) {
            // Don't redirect immediately - let them see the form
        }
    }, [isAuthenticated]);

    // Handle payment messages from navigation state
    useEffect(() => {
        const state = location.state;
        if (state) {
            if (state.paymentCancelled && state.message) {
                setPaymentMessage({ type: 'warning', text: state.message });
                // Clear the state
                navigate(location.pathname, { replace: true });
            } else if (state.paymentSuccess && state.message) {
                setPaymentMessage({ type: 'success', text: state.message });
                // Clear the state
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location, navigate]);

    
    useEffect(() => {
        if (paymentMessage) {
            const timer = setTimeout(() => {
                setPaymentMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [paymentMessage]);


    // Khi vào trang checkout, luôn lấy cart mới nhất
    useEffect(() => {
        const validateCartOnMount = async () => {
            if (isAuthenticated()) {
                // Authenticated user - get cart from backend
                try {
                    const cartResponse = await cartService.viewCart();
                    
                    if (cartResponse.success && cartResponse.data?.data?.cartItems?.length > 0) {
                        setValidatedCart(cartResponse.data.data);
                    } else {
                        setValidatedCart(null);
                    }
                } catch (error) {
                    setValidatedCart(null);
                }
            } else {
                // Guest user - cart is already in context from sessionStorage
                setValidatedCart(null);
            }
        };
        validateCartOnMount();
    }, [isAuthenticated]);

    // Check cart but don't block rendering  
    useEffect(() => {
        if (!items || items.length === 0) {
            
        }
    }, [items]);


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount).replace('₫', ' ₫');
    };

    const handleOrderSubmit = async (formData) => {
        setSubmitting(true);
        setOrderError(null);
        
        try {
            let currentCart;
            
            if (isAuthenticated()) {
                // Authenticated user - get latest cart from backend
                const cartResponse = await cartService.viewCart();
                
                if (!cartResponse.success || !cartResponse.data?.data?.cartItems || cartResponse.data.data.cartItems.length === 0) {
                    setOrderError('Your cart is empty or has changed. Please check again!');
                    setSubmitting(false);
                    return;
                }
                
                currentCart = cartResponse.data.data;
            } else {
                // Guest user - use cart from context/sessionStorage
                if (!items || items.length === 0) {
                    setOrderError('Your cart is empty. Please add products before checkout!');
                    setSubmitting(false);
                    return;
                }
                
                // Use context cart for guest
                currentCart = {
                    cartItems: items,
                    totalAmount: totalAmount
                };
            }
            
            // Validate thông tin khách hàng
            const requiredFields = ['fullName', 'phone', 'email', 'shippingAddress'];
            const missingFields = requiredFields.filter(field => !formData[field]?.trim());
            if (missingFields.length > 0) {
                setOrderError(`Please fill in all required information: ${missingFields.join(', ')}`);
                setSubmitting(false);
                return;
            }
            
            // Check if user is guest (not authenticated)
            const isGuestOrder = !isAuthenticated();
            
            // Tạo order request với cấu trúc đúng
            const orderRequest = {
                shippingAddress: formData.shippingAddress,
                note: [
                    `Khách hàng: ${formData.fullName.trim()}`,
                    `Số điện thoại: ${formData.phone.trim()}`,
                    `Email: ${formData.email.trim()}`,
                    `Số lượng sản phẩm: ${currentCart.cartItems.length}`,
                    `Total amount: ${formatCurrency(currentCart.totalAmount)}`,
                    ...(isGuestOrder ? ['Guest Order'] : [])
                ].join(' | '),
                paymentMethod: formData.paymentMethod || 'Cash on delivery',
                requireInvoice: formData.requireInvoice || false,
                // Guest order fields
                ...(isGuestOrder ? {
                    isGuest: true,
                    guestInfo: {
                        fullName: formData.fullName.trim(),
                        phone: formData.phone.trim(),
                        email: formData.email.trim()
                    },
                    guestCartItems: currentCart.cartItems.map(item => {
                        // Validate item data before sending
                        if (!item.product?.id || !item.quantity || !item.product?.price) {
                            throw new Error(`Invalid cart item: ${item.product?.name || 'Unknown'}`);
                        }
                        
                        return {
                            productId: item.product.id,
                            quantity: item.quantity,
                            price: item.product.price,
                            name: item.product.name || 'Unknown Product'
                        };
                    })
                } : {})
            };
            
            const response = await orderService.createOrder(orderRequest);
            
            // Check for nested error structure
            if (response.data?.success === false) {
                throw new Error(response.data.message || response.data.error || 'Order placement failed');
            }
            
            // Log để debug cấu trúc response
            console.log('[DEBUG] Order Response:', JSON.stringify(response));
            console.log('[DEBUG] Order Data Structure:', {
                hasDirectId: !!response.data?.id,
                hasNestedId: !!response.data?.data?.id,
                responseData: response.data,
                requireInvoice: orderRequest.requireInvoice
            });
            
            // Try both direct and nested structure for order ID
            const orderData = response.data?.id ? response.data : response.data?.data;
            if (!orderData?.id) {
                console.error('[ERROR] Order data missing ID!', {response, orderData, orderRequest});
                throw new Error('Payment successful but order ID not received');
            }

            // Handle successful order
            setOrderData(orderData);
            
            // Clear cart after successful order
            if (isAuthenticated()) {
                await refreshCart();
            } else {
                clearCart();
            }

            // Redirect based on payment method
            if (formData.paymentMethod === 'Online payment') {
                // Handle VNPay redirect
                navigate('/payment/vnpay', { 
                    state: { 
                        orderId: orderData.id,
                        amount: currentCart.totalAmount
                    }
                });
            } else {
                // COD - show success and redirect
                // Không cần lưu vào sessionStorage vì đã hiển thị thông báo ở CheckoutForm
                
                navigate('/order-history', { 
                    state: { 
                        paymentSuccess: true,
                        message: 'Order placed successfully!' 
                    }
                });
            }
            
        } catch (error) {
            console.error('Order submission error:', error);
            
            // Handle authentication error
            if (error.message?.includes('Authentication required')) {
                setOrderError('Please log in to place an order with invoice. For guest orders, please uncheck the VAT invoice option.');
            } else {
                setOrderError(error.message || 'Failed to place order. Please try again.');
            }
            
        } finally {
            setSubmitting(false);
        }
    };


    // Show error state
    if (error) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>Cart loading error</h3>
                <p>{error}</p>
                <button 
                    onClick={() => navigate('/cart')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back to cart
                </button>
            </div>
        );
    }

    // Show loading state briefly
    if (loading && !isInitialized) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p style={{ marginTop: '10px' }}>Loading cart information...</p>
                </div>
            </div>
        );
    }

    // Ưu tiên sử dụng validatedCart nếu có, fallback về context với validation
    let cartItems = [];
    let subtotal = 0;
    
    if (validatedCart && validatedCart.cartItems) {
        // Authenticated user - use backend cart data
        cartItems = validatedCart.cartItems;
        subtotal = validatedCart.totalAmount || 0;
    } else if (items && items.length > 0) {
        // Guest user - use context cart data  
        cartItems = items;
        subtotal = totalAmount || 0;
    }
    
    // Validate cart data structure
    if (cartItems && cartItems.length > 0) {
        cartItems = cartItems.filter(item => {
            if (!item || !item.product || !item.product.id) {
                console.warn('Invalid cart item filtered out:', item);
                return false;
            }
            return true;
        });
    }
    const shippingFee = subtotal > 1000000 ? 0 : 30000;
    const finalTotal = subtotal + shippingFee;

    if ((!cartItems || cartItems.length === 0)) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
                <h3>Empty cart</h3>
                <p>Please add products to cart before checkout</p>
                <button onClick={() => navigate('/cart')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Back to cart
                </button>
            </div>
        );
    }

    // Transform cart items với error handling
    const transformedCartItems = cartItems.map((item, index) => {
        try {
            return {
                id: item.product?.id || item.id || `item-${index}`,
                name: item.product?.name || item.name || `Product ${index + 1}`,
                price: item.product?.price || item.price || 0,
                quantity: item.quantity || 1,
                category: item.product?.category?.name || item.product?.category || 'Product',
                image: item.product?.images && item.product.images.length > 0 
                    ? item.product.images[0].url 
                    : '/img/pc.png',
                // Pass through the full product data
                product: item.product
            };
        } catch (error) {
            return {
                id: `error-item-${index}`,
                name: `Error product ${index + 1}`,
                price: 0,
                quantity: 1,
                category: 'Error',
                image: '/img/product01.png'
            };
        }
    });

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <>
            <Header />
            <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '10px', paddingBottom: '20px', marginTop: '10px' }}>
                <div className="container">
                    {/* Payment Message */}
                    {paymentMessage && (
                        <div className="row">
                            <div className="col-md-12">
                                <div 
                                    className={`alert alert-${paymentMessage.type === 'success' ? 'success' : 'warning'} alert-dismissible fade show`}
                                    role="alert"
                                    style={{ marginBottom: '20px' }}
                                >
                                    <strong>
                                        {paymentMessage.type === 'success' ? '✅ ' : '⚠️ '}
                                    </strong>
                                    {paymentMessage.text}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setPaymentMessage(null)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="row">
                        <div className="col-md-12">
                            <CheckoutForm
                                cartItems={transformedCartItems}
                                subtotal={subtotal}
                                shippingFee={shippingFee}
                                totalAmount={finalTotal}
                                onPlaceOrder={handleOrderSubmit}
                                onBackToCart={handleBackToCart}
                                isProcessing={submitting}
                                error={orderError}
                                isGuest={!isAuthenticated()}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage; 