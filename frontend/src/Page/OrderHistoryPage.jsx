import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderHistory } from '../components/Cart/OrderHistory.jsx';
import { orderService } from '../services/orderService';
import Header from '../components/header';
import Footer from '../components/footer';
import { useAuth } from '../contexts/AuthContext';

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [statistics, setStatistics] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination states for UI consistency but with a large limit
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async (page = 1) => {
        if (!isAuthenticated()) {
            setError("Please log in to view your order history");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("🔍 Fetching order data, page:", page);
            
            // Fetch both statistics and orders in parallel
            const [statsResponse, ordersResponse] = await Promise.all([
                orderService.getOrderStatistics(),
                orderService.getOrders({ page }) // Không truyền limit để sử dụng giá trị mặc định
            ]);

            console.log("📊 Order statistics response:", statsResponse);
            console.log("📋 Orders response:", ordersResponse);

            // Handle statistics
            if (statsResponse && statsResponse.message === "Order statistics retrieved successfully") {
                setStatistics(statsResponse.statistics);
            }

            // Handle orders with nested structure API response
            if (ordersResponse && ordersResponse.data) {
                // Check for nested data structure: success, statusCode, data: { message, data, pagination }
                if (ordersResponse.success === true && ordersResponse.data && ordersResponse.data.data && Array.isArray(ordersResponse.data.data)) {
                    // Nested data.data array
                    setOrders(ordersResponse.data.data);
                    console.log("✅ Setting orders from nested data.data:", ordersResponse.data.data.length);
                    
                    // Pagination from data.pagination
                    if (ordersResponse.data.pagination) {
                        setTotalOrders(ordersResponse.data.pagination.total);
                        setTotalPages(ordersResponse.data.pagination.totalPages);
                    } else {
                        setTotalOrders(ordersResponse.data.data.length);
                        setTotalPages(Math.ceil(ordersResponse.data.data.length / 10));
                    }
                } 
                // Regular structure: message, data array, pagination
                else if (ordersResponse.message === "Orders retrieved successfully" && Array.isArray(ordersResponse.data)) {
                    setOrders(ordersResponse.data);
                    console.log("✅ Setting orders from direct data array:", ordersResponse.data.length);
                    
                    // Pagination from top-level
                    if (ordersResponse.pagination) {
                        setTotalOrders(ordersResponse.pagination.total);
                        setTotalPages(ordersResponse.pagination.totalPages);
                    } else {
                        setTotalOrders(ordersResponse.data.length);
                        setTotalPages(Math.ceil(ordersResponse.data.length / 10));
                    }
                }
                // Direct array response
                else if (Array.isArray(ordersResponse)) {
                    setOrders(ordersResponse);
                    setTotalOrders(ordersResponse.length);
                    setTotalPages(Math.ceil(ordersResponse.length / 10));
                    console.log("✅ Setting orders from direct array:", ordersResponse.length);
                } 
                // No valid data
                else {
                    console.warn("⚠️ No valid orders data structure found:", ordersResponse);
                    setOrders([]);
                    setTotalOrders(0);
                    setTotalPages(0);
                }
            } else {
                console.warn("⚠️ Invalid orders response:", ordersResponse);
                setOrders([]);
                setTotalOrders(0);
                setTotalPages(0);
            }

        } catch (err) {
            console.error('❌ OrderHistoryPage Error:', err);
            setError(err.message || 'Cannot load order data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
        document.body.classList.add('order-history-page-active');
        return () => document.body.classList.remove('order-history-page-active');
    }, [currentPage]);
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <Header />
            <div className="container-fluid " style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                minHeight: 'calc(100vh - 80px)',
                marginTop: '20px',
                padding: '20px'
            }}>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading order history...</p>
                        </div>
                    </div>
                ) : (
                    <OrderHistory 
                        orders={orders}
                        onOrderUpdate={setOrders}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalOrders={totalOrders}
                    />
                )}
            </div>
            <Footer />
        </div>
    );
};

export default OrderHistoryPage;
