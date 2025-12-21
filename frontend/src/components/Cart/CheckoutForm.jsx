import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutForm.module.css";
import { useVietnamProvinces } from "../../Hook/useVietnamProvinces";
import { orderService } from "../../services/orderService";
import { sendOtpForGuest, verifyOtpForGuest } from "../../services/authService";
import OTPPopup from "../Login/OTPPopup";

// SVG Icons (placeholders)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
  </svg>
);

const GeoAltIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
    />
  </svg>
);

const CheckoutForm = ({
  cartItems,
  subtotal,
  shippingFee,
  totalAmount,
  onPlaceOrder,
  onBackToCart,
  isProcessing = false,
  error = null,
  isGuest = false,
}) => {
  const navigate = useNavigate();
  const {
    provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useVietnamProvinces();

  // OTP states for guest verification
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // Clear saved form data when order is successfully placed
  const clearSavedFormData = () => {
    try {
      sessionStorage.removeItem("checkoutFormData");
    } catch (error) {}
  };

  // Early return for invalid props
  if (!cartItems || !Array.isArray(cartItems)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>⚠️ Cart data error</h3>
        <p>Cart data is invalid. Please try again.</p>
        <button
          onClick={() => onBackToCart && onBackToCart()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back to cart
        </button>
      </div>
    );
  }

  // Load saved form data from sessionStorage on component mount
  const getSavedFormData = () => {
    try {
      const saved = sessionStorage.getItem("checkoutFormData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    ward: "",
    commune: "",
  });

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to Cash on Delivery
  const [isVNPayProcessing, setIsVNPayProcessing] = useState(false); // Local state for VNPAY processing
  // Always require VAT invoice
  const requireInvoice = true;

  // Add these state variables after the other useState declarations
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    ward: "",
    commune: "",
  });

  // Add this function to validate individual fields
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "fullName":
        if (!value.trim()) {
          error = "Họ tên không được để trống";
        } else if (value.trim().length < 2) {
          error = "Họ tên phải có ít nhất 2 ký tự";
        } else if (value.trim().length > 100) {
          error = "Họ tên không được vượt quá 100 ký tự";
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value.trim())) {
          error = "Họ tên chỉ được chứa chữ cái và khoảng trắng";
        }
        break;
        
      case "phone":
        if (!value.trim()) {
          error = "Số điện thoại không được để trống";
        } else {
          const cleanPhone = value.trim().replace(/\D/g, '');
          const vietnamesePhonePatterns = [
            /^0[3|5|7|8|9][0-9]{8}$/, // Mobile
            /^0[2|3|4|5|6|7|8][0-9]{8}$/, // Landline
            /^84[3|5|7|8|9][0-9]{8}$/, // International mobile
            /^84[2|3|4|5|6|7|8][0-9]{8}$/ // International landline
          ];
          
          const isValidPhone = vietnamesePhonePatterns.some(pattern => pattern.test(cleanPhone));
          if (!isValidPhone) {
            error = "Số điện thoại không hợp lệ (VD: 0912345678)";
          }
        }
        break;
        
      case "email":
        if (!value.trim()) {
          error = "Email không được để trống";
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value.trim())) {
            error = "Email không hợp lệ (VD: example@email.com)";
          } else if (value.trim().length > 254) {
            error = "Email không được vượt quá 254 ký tự";
          }
        }
        break;
        
      case "address":
        if (!value.trim()) {
          error = "Địa chỉ không được để trống";
        } else if (value.trim().length < 10) {
          error = "Địa chỉ phải có ít nhất 10 ký tự";
        } else if (value.trim().length > 200) {
          error = "Địa chỉ không được vượt quá 200 ký tự";
        }
        break;
        
      case "city":
        if (!value.trim()) {
          error = "Vui lòng chọn Tỉnh/Thành phố";
        }
        break;
        
      case "ward":
        if (!value.trim()) {
          error = "Vui lòng chọn Quận/Huyện";
        }
        break;
        
      case "commune":
        if (!value.trim()) {
          error = "Vui lòng chọn Phường/Xã";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  // Load saved form data on component mount
  React.useEffect(() => {
    const savedData = getSavedFormData();
    if (savedData) {
      setFormData({
        fullName: savedData.fullName || "",
        phone: savedData.phone || "",
        email: savedData.email || "",
        address: savedData.address || "",
        city: savedData.city || "",
        ward: savedData.ward || "",
        commune: savedData.commune || "",
      });
      setSelectedProvince(savedData.city || "");
      setSelectedDistrict(savedData.ward || "");
      setPaymentMethod(savedData.paymentMethod || "cod");
    }
  }, []); // Empty dependency array - only run once on mount

  // Populate districts and wards when component loads with saved data
  React.useEffect(() => {
    if (selectedProvince && provinces[selectedProvince]) {
      setAvailableDistricts(Object.keys(provinces[selectedProvince]));

      if (selectedDistrict && provinces[selectedProvince][selectedDistrict]) {
        setAvailableWards(provinces[selectedProvince][selectedDistrict]);
      }
    }
  }, [provinces, selectedProvince, selectedDistrict]);

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
      case "success":
        notification.style.backgroundColor = "#22c55e";
        break;
      case "error":
        notification.style.backgroundColor = "#ef4444";
        break;
      case "warning":
        notification.style.backgroundColor = "#f59e0b";
        break;
      default:
        notification.style.backgroundColor = "#3b82f6";
    }

    // Add animation keyframes if not already added
    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
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
        notification.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 4700);
  };

  // Save form data to sessionStorage
  const saveFormData = (newFormData) => {
    try {
      const dataToSave = {
        ...newFormData,
        paymentMethod,
      };
      sessionStorage.setItem("checkoutFormData", JSON.stringify(dataToSave));
    } catch (error) {}
  };

  // Modify the handleInputChange function to validate as user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    
    // Validate the field and update error state
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    saveFormData(newFormData);
  };

  // Modify the handleProvinceChange function to include validation
  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setSelectedDistrict("");
    const newFormData = {
      ...formData,
      city: provinceName,
      ward: "",
      commune: "",
    };
    setFormData(newFormData);
    
    // Validate the field and update error state
    const error = validateField("city", provinceName);
    setFieldErrors(prev => ({
      ...prev,
      city: error,
      ward: "",
      commune: ""
    }));
    
    saveFormData(newFormData);

    if (provinces[provinceName]) {
      setAvailableDistricts(Object.keys(provinces[provinceName]));
      setAvailableWards([]);
    } else {
      setAvailableDistricts([]);
      setAvailableWards([]);
    }
  };

  // Modify the handleDistrictChange function to include validation
  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setSelectedDistrict(districtName);
    const newFormData = { ...formData, ward: districtName, commune: "" };
    setFormData(newFormData);
    
    // Validate the field and update error state
    const error = validateField("ward", districtName);
    setFieldErrors(prev => ({
      ...prev,
      ward: error,
      commune: ""
    }));
    
    saveFormData(newFormData);

    if (
      provinces[selectedProvince] &&
      provinces[selectedProvince][districtName]
    ) {
      setAvailableWards(provinces[selectedProvince][districtName]);
    } else {
      setAvailableWards([]);
    }
  };

  // Modify the handleWardChange function to include validation
  const handleWardChange = (e) => {
    const wardName = e.target.value;
    const newFormData = { ...formData, commune: wardName };
    setFormData(newFormData);
    
    // Validate the field and update error state
    const error = validateField("commune", wardName);
    setFieldErrors(prev => ({
      ...prev,
      commune: error
    }));
    
    saveFormData(newFormData);
  };

  const handlePaymentMethodChange = (e) => {
    const newPaymentMethod = e.target.value;
    setPaymentMethod(newPaymentMethod);
    saveFormData({ ...formData, paymentMethod: newPaymentMethod });
  };

  // OTP handling functions for guest users
  const handleSendOtpForGuest = async () => {
    try {
      const result = await sendOtpForGuest(formData.phone);
      if (result.success) {
        setShowOtpPopup(true);
        setOtpError('');
        showNotification("OTP sent to your phone number", "success");
      } else {
        showNotification(result.message || "Failed to send OTP", "error");
      }
    } catch (error) {
      showNotification("Failed to send OTP. Please try again.", "error");
    }
  };

  const handleVerifyOtpForGuest = async (otpCode) => {
    try {
      const result = await verifyOtpForGuest(formData.phone, otpCode);
      if (result.success) {
        setOtpVerified(true);
        setShowOtpPopup(false);
        setOtpError('');
        showNotification("Phone number verified successfully!", "success");

        // If we have pending order data, proceed with order creation
        if (pendingOrderData) {
          processOrder(pendingOrderData);
        }
      } else {
        setOtpError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    }
  };

  const processOrder = (orderData) => {
    if (paymentMethod === "vnpay") {
      // VNPay payment flow - create order first, then redirect to VNPay
      setIsVNPayProcessing(true);

      // Create order request with proper structure
      const orderRequest = {
        shippingAddress: orderData.shippingAddress,
        note: [
          `Khách hàng: ${orderData.fullName.trim()}`,
          `Số điện thoại: ${orderData.phone.trim()}`,
          `Email: ${orderData.email.trim()}`,
          `Số lượng sản phẩm: ${cartItems.length}`,
          `Total amount: ${formatCurrency(totalAmount + (subtotal * 0.1))}`,
          "VAT Invoice Included",
          "Phone Verified" 
        ].join(" | "),
        paymentMethod: orderData.paymentMethod,
        requireInvoice: true,
        isGuest: isGuest,
        ...(isGuest
          ? {
              guestInfo: {
                fullName: orderData.fullName.trim(),
                phone: orderData.phone.trim(),
                email: orderData.email.trim(),
              },
              guestCartItems: cartItems.map((item) => ({
                productId: item.product?.id || item.id,
                quantity: item.quantity || 1,
                price: item.product?.price || item.price || 0,
                name: item.product?.name || item.name || "Unknown Product",
              })),
            }
          : {}),
      };

      // Create order first, then redirect to VNPay
      orderService
        .createOrder(orderRequest)
        .then((response) => {
          // Get the order data with ID
          const orderData = response.data?.id
            ? response.data
            : response.data?.data;
          if (!orderData?.id) {
            showNotification(
              "Order creation failed - no order ID received",
              "error"
            );
            setIsVNPayProcessing(false);
            return;
          }

          // Navigate to VNPay payment page with the real order object
          navigate("/vnpay-payment", {
            state: {
              orderData: orderData,
              totalAmount: totalAmount + (subtotal * 0.1),
              cartItems: cartItems,
            },
          });
        })
        .catch((error) => {
          showNotification(error.message || "Order creation failed", "error");
          setIsVNPayProcessing(false);
        });
    } else {
      // COD payment flow - create order first, then show success notification
      const orderRequest = {
        shippingAddress: orderData.shippingAddress,
        note: [
          `Khách hàng: ${orderData.fullName.trim()}`,
          `Số điện thoại: ${orderData.phone.trim()}`,
          `Email: ${orderData.email.trim()}`,
          `Số lượng sản phẩm: ${cartItems.length}`,
          `Total amount: ${formatCurrency(totalAmount + (subtotal * 0.1))}`,
          "VAT Invoice Included",
          ...(isGuest && otpVerified ? ["Phone Verified"] : [])
        ].join(" | "),
        paymentMethod: orderData.paymentMethod,
        requireInvoice: true,
        isGuest: isGuest,
        ...(isGuest ? {
          guestInfo: {
            fullName: orderData.fullName.trim(),
            phone: orderData.phone.trim(),
            email: orderData.email.trim()
          },
          guestCartItems: cartItems.map(item => ({
            productId: item.product?.id || item.id,
            quantity: item.quantity || 1,
            price: item.product?.price || item.price || 0,
            name: item.product?.name || item.name || 'Unknown Product'
          }))
        } : {})
      };
      
      // Set processing state
      const processingState = isProcessing;
      if (!processingState) {
        onPlaceOrder({ ...orderData, processing: true });
      }
      
      // Create order with COD payment method
      orderService
        .createOrder(orderRequest)
        .then((response) => {
          // Clear saved form data when order is successfully placed
          clearSavedFormData();
          
          // Get the order data with ID
          const createdOrderData = response.data?.id
            ? response.data
            : response.data?.data;
            
          if (!createdOrderData?.id) {
            showNotification(
              "Đặt hàng thất bại - không nhận được mã đơn hàng",
              "error"
            );
            return;
          }
          
          // Show success notification
          showNotification("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi.", "success");
          
          // Pass the created order data to parent component
          setTimeout(() => {
            onPlaceOrder(createdOrderData);
          }, 2000); // Reduced timeout to 2 seconds
        })
        .catch((error) => {
          showNotification(error.message || "Đặt hàng thất bại", "error");
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // validation function
    const validateCustomerInfo = () => {
      const errors = [];

      // 1. Full Name Validation
      const fullName = formData.fullName?.trim();
      if (!fullName) {
        errors.push("Họ tên không được để trống");
      } else if (fullName.length < 2) {
        errors.push(" Họ tên phải có ít nhất 2 ký tự");
      } else if (fullName.length > 30) {
        errors.push(" Họ tên không được vượt quá 30 ký tự");
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
        errors.push("Họ tên chỉ được chứa chữ cái và khoảng trắng");
      }

      // 2. Phone Number Validation (Vietnamese format)
      const phone = formData.phone?.trim();
      if (!phone) {
        errors.push("Số điện thoại không được để trống");
      } else {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Vietnamese phone number patterns
        const vietnamesePhonePatterns = [
          /^0[3|5|7|8|9][0-9]{8}$/, 
          /^0[2|3|4|5|6|7|8][0-9]{8}$/, 
          /^84[3|5|7|8|9][0-9]{8}$/, 
          /^84[2|3|4|5|6|7|8][0-9]{8}$/ 
        ];

        const isValidPhone = vietnamesePhonePatterns.some(pattern => pattern.test(cleanPhone));
        
        if (!isValidPhone) {
          errors.push("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ (VD: 0123456789)");
        }
      }

      // 3. Email Validation
      const email = formData.email?.trim();
      if (!email) {
        errors.push("Email không được để trống");
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          errors.push("Email không hợp lệ. Vui lòng nhập email đúng định dạng (VD: example@email.com)");
        } else if (email.length > 254) {
          errors.push("Email không được vượt quá 254 ký tự");
        }
      }

      // 4. Address Validation
      const address = formData.address?.trim();
      if (!address) {
        errors.push(" Địa chỉ không được để trống");
      } else if (address.length < 10) {
        errors.push("Địa chỉ phải có ít nhất 10 ký tự");
      } else if (address.length > 200) {
        errors.push(" Địa chỉ không được vượt quá 200 ký tự");
      }

      // 5. Province/City Validation
      const city = formData.city?.trim();
      if (!city) {
        errors.push(" Vui lòng chọn Tỉnh/Thành phố");
      }

      // 6. District/County Validation
      const ward = formData.ward?.trim();
      if (!ward) {
        errors.push(" Vui lòng chọn Quận/Huyện");
      }

      // 7. Commune/Ward Validation
      const commune = formData.commune?.trim();
      if (!commune) {
        errors.push(" Vui lòng chọn Phường/Xã");
      }

      // 8. Payment Method Validation
      if (!paymentMethod) {
        errors.push("Vui lòng chọn phương thức thanh toán");
      }

      return errors;
    };

    // Run validation
    const validationErrors = validateCustomerInfo();
    
    if (validationErrors.length > 0) {
      showNotification(validationErrors[0], "warning");
      
      // Show additional errors if there are more
      if (validationErrors.length > 1) {
        setTimeout(() => {
          showNotification(`Còn ${validationErrors.length - 1} lỗi khác cần sửa`, "warning");
        }, 1000);
      }
      return;
    }

    // Build the full address - Improved to avoid duplication
    const addressDetail = formData.address.trim();
    const commune = formData.commune.trim();
    const ward = formData.ward.trim();
    const city = formData.city.trim();

    // Create full address in standard format
    let fullAddress = addressDetail;

    // Only add dropdown information if not already in the detailed address
    if (commune && !addressDetail.toLowerCase().includes(commune.toLowerCase())) {
      fullAddress += `, ${commune}`;
    }

    if (ward && !addressDetail.toLowerCase().includes(ward.toLowerCase())) {
      fullAddress += `, ${ward}`;
    }

    if (city && !addressDetail.toLowerCase().includes(city.toLowerCase())) {
      fullAddress += `, ${city}`;
    }

    const backendPaymentMethod = paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment';

    // Create order data with proper structure
    const orderData = {
      ...formData,
      paymentMethod: backendPaymentMethod, 
      requireInvoice: true, 
      shippingAddress: fullAddress, 
      isGuest: isGuest, 
    };

    // For guest users, require OTP verification before processing order
    if (isGuest && !otpVerified) {

      setPendingOrderData(orderData);  
      handleSendOtpForGuest();
      return;
    }

    // Process order (either authenticated user or OTP-verified guest)
    processOrder(orderData);
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      })
        .format(amount)
        .replace("₫", "đ");
    } catch (error) {
      return `${amount || 0} VND`;
    }
  };

  // Calculate total with VAT
  const vatAmount = subtotal * 0.1;
  const finalTotal = totalAmount + vatAmount;

  try {
    return (
      <div
        className={styles.checkoutContainer}
        style={{ marginTop: "0", paddingTop: "0" }}
      >
        {/* Đã xóa checkoutHeader */}

        {/* Form & Cart Summary */}
        <div className={styles.checkoutContent}>
          <div className={styles.orderDetails}>
            <div className={styles.orderItems}>
              <h2>Your order</h2>
              {cartItems.map((item, index) => {
                // Safe data extraction with fallbacks
                const itemName =
                  item.product?.name || item.name || `Product ${index + 1}`;
                const itemPrice = item.product?.price;
                const itemCategory =
                  item.product?.category?.name ||
                  item.product?.category ||
                  item.category ||
                  "Product";
                const itemQuantity = item.quantity || 1;

                // Try multiple image sources
                const imageUrl =
                  (item.product?.images &&
                    item.product.images.length > 0 &&
                    item.product.images[0]?.url) ||
                  item.product?.image ||
                  item.product?.imageUrl ||
                  item.image ||
                  item.imageUrl;

                return (
                  <div
                    key={item.id || `item-${index}`}
                    className={styles.orderItem}
                  >
                    <div className={styles.leftSection}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={itemName}
                          className={styles.itemImage}
                          onError={(e) => {
                            e.target.src = "/img/pc.png";
                          }}
                        />
                      ) : (
                        <div
                          className={`${styles.itemImage} ${styles.imagePlaceholder}`}
                        >
                          <span>📦</span>
                        </div>
                      )}
                      <div className={styles.itemQuantity}>
                        <span>Số lượng: {itemQuantity}</span>
                      </div>
                    </div>
                    <div className={styles.itemInfo}>
                      <h3>{itemName}</h3>
                      <p className={styles.itemCategory}>{itemCategory}</p>
                    </div>
                    <div className={styles.itemTotal}>
                      {formatCurrency(itemPrice * itemQuantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className={styles.shippingForm}>
              <h2>Customer information</h2>

              {isGuest && (
                <div className={styles.guestNotification}>
                  <div className={styles.guestNotificationIcon}>ℹ️</div>
                  <div className={styles.guestNotificationText}>
                    <strong>Bạn đang đặt hàng dưới dạng khách.</strong>
                    <br />
                    Đơn hàng sẽ không hiển thị trong tài khoản. Bạn có thể tạo
                    tài khoản sau để theo dõi đơn hàng dễ dàng hơn.
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="fullName">Full name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
                {fieldErrors.fullName && <p className={styles.errorMessage}>{fieldErrors.fullName}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="0123 456 789"
                />
                {fieldErrors.phone && <p className={styles.errorMessage}>{fieldErrors.phone}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="email@example.com"
                />
                {fieldErrors.email && <p className={styles.errorMessage}>{fieldErrors.email}</p>}
              </div>

              <div className={styles.addressSection}>
                <h2>Shipping address</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="address">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="House number, street name"
                  />
                  {fieldErrors.address && <p className={styles.errorMessage}>{fieldErrors.address}</p>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">Province/City *</label>
                    <select
                      id="city"
                      name="city"
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      required
                      disabled={provincesLoading}
                    >
                      <option value="">Select province/city</option>
                      {Object.keys(provinces).map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {provincesLoading && <small>Loading data...</small>}
                    {provincesError && (
                      <small style={{ color: "red" }}>
                        Error: {provincesError}
                      </small>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ward">District/County *</label>
                    <select
                      id="ward"
                      name="ward"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      required
                      disabled={
                        !selectedProvince || availableDistricts.length === 0
                      }
                    >
                      <option value="">Select district/county</option>
                      {availableDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.ward && <p className={styles.errorMessage}>{fieldErrors.ward}</p>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="commune">Ward/Commune *</label>
                  <select
                    id="commune"
                    name="commune"
                    value={formData.commune}
                    onChange={handleWardChange}
                    required
                    disabled={!selectedDistrict || availableWards.length === 0}
                  >
                    <option value="">Select ward/commune</option>
                    {availableWards.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.commune && <p className={styles.errorMessage}>{fieldErrors.commune}</p>}
                </div>
              </div>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h2>Order summary</h2>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({cartItems.length} products)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {/* VAT Row - always show */}
              <div className={styles.summaryRow}>
                <span>VAT (10%)</span>
                <span>{formatCurrency(vatAmount)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping fee</span>
                <span>
                  {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
                </span>
              </div>



              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className={styles.paymentSectionSummary}>
              <h3>Payment method</h3>

              <div className={styles.paymentMethodsCompact}>
                <div className={styles.paymentOptionCompact}>
                  <input
                    type="radio"
                    id="cod-summary"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={handlePaymentMethodChange}
                    className={styles.paymentRadio}
                  />
                  <label
                    htmlFor="cod-summary"
                    className={styles.paymentLabelCompact}
                  >
                    <div className={styles.paymentIconCompact}>💰</div>
                    <div className={styles.paymentInfoCompact}>
                      <span className={styles.paymentTitle}>COD</span>
                      <span className={styles.paymentDesc}>
                        Cash on delivery
                      </span>
                    </div>
                  </label>
                </div>

                <div className={styles.paymentOptionCompact}>
                  <input
                    type="radio"
                    id="vnpay-summary"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={handlePaymentMethodChange}
                    className={styles.paymentRadio}
                  />
                  <label
                    htmlFor="vnpay-summary"
                    className={styles.paymentLabelCompact}
                  >
                    <div className={styles.paymentIconCompact}>💳</div>
                    <div className={styles.paymentInfoCompact}>
                      <span className={styles.paymentTitle}>Card</span>
                      <span className={styles.paymentDesc}>
                        Pay by credit or debit card
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="button"
              className={`${styles.placeOrderButton} ${paymentMethod === "vnpay"
                  ? styles.vnpayButton
                  : styles.codButton
                }`}
              onClick={handleSubmit}
              disabled={
                cartItems.length === 0 || isProcessing || isVNPayProcessing
              }
            >
              {isProcessing || isVNPayProcessing
                ? "Processing..."
                : paymentMethod === "vnpay"
                  ? `💳 Payment VNPay • ${formatCurrency(finalTotal)}`
                  : `💰 Order COD • ${formatCurrency(finalTotal)}`}
            </button>

            {totalAmount > 1000000 && shippingFee === 0 && (
              <p className={styles.shippingPromo}>
                Free shipping for orders over 1.000.000đ
              </p>
            )}
          </div>
        </div>

        {/* OTP Popup for guest verification */}
        <OTPPopup
          isOpen={showOtpPopup}
          onClose={() => {
            setShowOtpPopup(false);
            setOtpError("");
            setPendingOrderData(null);
          }}
          onVerify={handleVerifyOtpForGuest}
          onResend={handleSendOtpForGuest}
          error={otpError}
        />
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>⚠️ Error displaying payment page</h3>
        <p>
          An error occurred while displaying the payment page. Please try again.
        </p>
        <p style={{ color: "red", fontSize: "14px" }}>{error.message}</p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔄 Reload page
        </button>
        <button
          onClick={() => onBackToCart && onBackToCart()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back to cart
        </button>
      </div>
    );
  }
};

export default CheckoutForm;
