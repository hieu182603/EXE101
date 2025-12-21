import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VNPayPayment from "../components/Cart/VNPayPayment";
import "./VNPayPaymentPage.css";
import { orderService } from "../services/orderService";

const VNPayPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Lấy data từ navigation state
    const state = location.state;

    if (!state || !state.orderData || !state.totalAmount) {
      // Nếu không có data, chuyển về trang checkout
      console.log("❌ No order data found, redirecting to checkout");
      navigate("/checkout", { replace: true });
      return;
    }

    console.log("✅ Order data received:", state.orderData);
    console.log("💰 Total amount:", state.totalAmount);

    setOrderData(state.orderData);
    setTotalAmount(state.totalAmount);
  }, [location, navigate]);

  const handlePaymentComplete = async (paymentResult) => {
    console.log("✅ Payment completed:", paymentResult);
    try {
      await orderService.updatePaymentStatus(
        orderData.id,
        "completed",
        paymentResult?.paymentMethod || "MOCK"
      );
    } catch (err) {
      console.error("Failed to update payment status:", err);
      // Optionally show error to user
    }
    // Lưu message vào sessionStorage để HomePage luôn hiển thị được thông báo
    sessionStorage.setItem(
      "paymentSuccessMessage",
      "Payment successful! Your order is being processed."
    );
    // Redirect to home page
    navigate("/", {
      replace: true,
    });
  };

  const handlePaymentCancel = () => {
    console.log("❌ Payment cancelled");

    // Redirect to checkout page with message
    navigate("/checkout", {
      replace: true,
      state: {
        paymentCancelled: true,
        message: "Payment has been cancelled. You can try again.",
      },
    });
  };

  // Hiển thị loading nếu chưa có data
  if (!orderData || !totalAmount) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            className="vnpay-loading-spinner"
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e9ecef",
              borderTop: "4px solid #1e3c72",
              borderRadius: "50%",
              margin: "0 auto 20px",
            }}
          ></div>
          <h2 style={{ color: "#1e3c72", marginBottom: "10px" }}>Loading...</h2>
          <p style={{ color: "#6c757d", margin: 0 }}>Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <VNPayPayment
      orderData={orderData}
      totalAmount={totalAmount}
      onPaymentComplete={handlePaymentComplete}
      onPaymentCancel={handlePaymentCancel}
    />
  );
};

export default VNPayPaymentPage;
