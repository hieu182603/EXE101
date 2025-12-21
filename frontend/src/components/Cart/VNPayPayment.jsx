import React, { useState } from "react";
import styles from "./VNPayPayment.module.css";

const FAIL_CARD = "4111 1111 1111 1111";
const SUCCESS_CARD = "4242 4242 4242 4242";
const FAIL_CVV = "123";
const SUCCESS_CVV = "456";
const FAIL_EXPIRY = "12/34";
const SUCCESS_EXPIRY = "12/30";

const VNPayPayment = ({
  orderData,
  onPaymentComplete,
  onPaymentCancel,
  totalAmount,
}) => {
  const [paymentStep, setPaymentStep] = useState("info"); // 'info', 'error'
  const [error, setError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    // Simulate payment logic
    if (
      cardNumber.trim() === FAIL_CARD ||
      cvv.trim() === FAIL_CVV ||
      expiry.trim() === FAIL_EXPIRY
    ) {
      setPaymentStep("error");
      setError("Simulated payment failure.");
      setIsSubmitting(false);
    } else {
      onPaymentComplete({
        paymentMethod: "mock",
        transactionId: `MOCK${Date.now()}`,
        amount: totalAmount,
        status: "completed",
      });
    }
  };

  if (paymentStep === "error") {
    return (
      <div className={styles.vnpayContainer}>
        <div className={styles.vnpayHeader}>
          <img
            src="/img/logo.png"
            alt="Mock Payment"
            className={styles.vnpayLogo}
          />
          <h1>Mock Payment Gateway</h1>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Transaction Failed</h2>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setPaymentStep("info");
              setError("");
            }}
          >
            Try Again
          </button>
          <button className={styles.cancelButton} onClick={onPaymentCancel}>
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.vnpayContainer}>
      <div className={styles.vnpayHeader}>
        <img
          src="/img/logo.png"
          alt="Mock Payment"
          className={styles.vnpayLogo}
        />
        <h1>Mock Payment Gateway</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "400px",
          margin: "2rem auto 0 auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: 600 }}>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="e.g. 4242 4242 4242 4242"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: 4,
            }}
            required
          />
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            Use <b>{SUCCESS_CARD}</b> for success, <b>{FAIL_CARD}</b> for
            failure.
          </div>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: 600 }}>Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="MM/YY"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: 4,
            }}
            required
          />
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            Use <b>{SUCCESS_EXPIRY}</b> for success, <b>{FAIL_EXPIRY}</b> for
            failure.
          </div>
        </div>
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ fontWeight: 600 }}>CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="e.g. 456"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: 4,
            }}
            required
          />
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
            Use <b>{SUCCESS_CVV}</b> for success, <b>{FAIL_CVV}</b> for failure.
          </div>
        </div>
        <button
          type="submit"
          className={styles.payButton}
          style={{ width: "100%", marginBottom: 16 }}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Processing..."
            : `Pay ${formatCurrency(totalAmount)}`}
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          style={{ width: "100%" }}
          onClick={onPaymentCancel}
        >
          Cancel payment
        </button>
      </form>
    </div>
  );
};

export default VNPayPayment;
