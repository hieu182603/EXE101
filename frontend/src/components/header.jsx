import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faPhone,
  faMapMarker,
  faShoppingCart,
  faTimes,
  faHistory,
  faBars,
  faUser as faUserRegular,
} from "@fortawesome/free-solid-svg-icons";
import { faEnvelope as faEnvelopeRegular } from "@fortawesome/free-regular-svg-icons";
import "../Page/HomePage.css";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { productService } from "../services/productService";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { items, totalAmount } = useCart();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const userDropdownTimeout = React.useRef();

  // Debug user data
  React.useEffect(() => {
    if (user) {
      console.log("🔍 [DEBUG] Header - User data:", {
        username: user.username,
        phone: user.phone,
        role: user.role,
        isRegistered: user.isRegistered,
      });
    }
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  const totalItems = items
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("SEARCH SUBMIT:", searchValue);
    if (!searchValue.trim()) {
      navigate("/all-products", { state: { clearFilter: true } });
      setSearchValue("");
      return;
    }
    setIsSearching(true);
    try {
      const results = await productService.searchProducts(searchValue.trim());
      // Chỉ lấy sản phẩm active
      const activeResults = Array.isArray(results)
        ? results.filter((p) => p.isActive)
        : [];
      console.log("SEARCH API RESULT:", activeResults);
      navigate("/all-products", {
        state: {
          searchResults: activeResults,
          searchKeyword: searchValue.trim(),
        },
      });
      setSearchValue("");
    } catch (error) {
      console.error("Search error:", error);
      navigate("/all-products", {
        state: {
          searchKeyword: searchValue.trim(),
        },
      });
      setSearchValue("");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserDropdown = (open) => setUserDropdownOpen(open);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* HEADER */}
      <header>
        {/* TOP HEADER */}
        <div id="top-header" className="bg-gray-900 text-white text-xs">
          <div className="container">
            <div className="flex flex-wrap justify-between items-center py-2 gap-2">
              <ul className="header-links flex flex-wrap gap-16 items-center mb-0">
                <li className="p-0 m-0">
                  <a href="#" className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPhone} color="#D10024" /> 1900-1234
                  </a>
                </li>
                <li className="p-0 m-0">
                  <a href="#" className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" />{" "}
                    Technical@gmail.com
                  </a>
                </li>
                <li className="p-0 m-0">
                  <a href="#" className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faMapMarker} color="#D10024" /> Khu
                    Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội
                  </a>
                </li>
              </ul>
              {/* Login Button/Welcome ở top header */}
              <div className="ml-8">
                {isAuthenticated() ? (
                  <div
                    className="user-dropdown-wrapper"
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}
                    onMouseEnter={() => {
                      if (userDropdownTimeout.current)
                        clearTimeout(userDropdownTimeout.current);
                      setUserDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      userDropdownTimeout.current = setTimeout(
                        () => setUserDropdownOpen(false),
                        120
                      );
                    }}
                  >
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        padding: "6px 12px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.08)",
                        transition: "background 0.2s",
                        minWidth: "auto",
                        gap: 8,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUserRegular}
                        style={{ fontSize: 14 }}
                      />
                      <span style={{ whiteSpace: "nowrap" }}>
                        Welcome, {user?.username || "User"}
                      </span>
                    </span>
                    {userDropdownOpen && (
                      <div
                        className="user-dropdown-menu"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          background: "#222",
                          color: "#fff",
                          boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                          zIndex: 1000,
                          minWidth: 140,
                          padding: "10px 0",
                          borderRadius: 6,
                          marginTop: 8,
                        }}
                        onMouseEnter={() => {
                          if (userDropdownTimeout.current)
                            clearTimeout(userDropdownTimeout.current);
                          setUserDropdownOpen(true);
                        }}
                        onMouseLeave={() => {
                          userDropdownTimeout.current = setTimeout(
                            () => setUserDropdownOpen(false),
                            120
                          );
                        }}
                      >
                        {isAuthenticated() && (
                          <>
                            <button
                              className="logout-btn"
                              style={{
                                width: "100%",
                                padding: "12px 0",
                                border: "none",
                                background: "none",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                borderRadius: 0,
                              }}
                              onClick={() => navigate("/user/details")}
                            >
                              View Account
                            </button>
                            <button
                              className="logout-btn"
                              style={{
                                width: "100%",
                                padding: "12px 0",
                                border: "none",
                                background: "none",
                                color: "#e53935",
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: "pointer",
                                borderRadius: 0,
                              }}
                              onClick={handleLogout}
                            >
                              Log out
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    style={{
                      color: "#fff",
                      background: "#D10024",
                      borderRadius: 20,
                      padding: "6px 12px",
                      fontWeight: 700,
                      fontSize: 14,
                      transition: "background 0.2s",
                      border: "none",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      minWidth: "auto",
                      gap: 8,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUserRegular}
                      style={{ fontSize: 14 }}
                    />
                    <span style={{ whiteSpace: "nowrap" }}>Login</span>
                  </Link>
                )}
              </div>
              {/* /Login Button/Welcome ở top header */}
            </div>
          </div>
        </div>
        {/* /TOP HEADER */}

        {/* MAIN HEADER */}
        <div id="header" className="bg-[#15161D] shadow">
          <div className="container">
            <div
              className="header-main-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                padding: "16px 0",
                flexWrap: "nowrap",
                minHeight: 80,
              }}
            >
              {/* LOGO */}
              <div
                style={{ minWidth: 160, display: "flex", alignItems: "center" }}
              >
                <Link to="/" className="logo">
                  <img
                    src="/img/logo.png"
                    alt=""
                    style={{ height: 60, width: "auto" }}
                  />
                </Link>
              </div>
              {/* /LOGO */}

              {/* SEARCH BAR */}
              <div style={{ flex: 1, maxWidth: 600, margin: "0 24px" }}>
                <div className="header-search">
                  <form
                    style={{ display: "flex", width: "100%" }}
                    onSubmit={handleSearch}
                  >
                    <input
                      className="input"
                      placeholder="Search for products..."
                      style={{ flex: 1, minWidth: 0 }}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      disabled={isSearching}
                    />
                    <button
                      className="search-btn"
                      type="submit"
                      disabled={isSearching}
                      style={{ opacity: isSearching ? 0.7 : 1 }}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </form>
                </div>
              </div>
              {/* /SEARCH BAR */}

              {/* Cart + Login */}
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {/* Cart */}
                <Link
                  to="/cart"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    position: "relative",
                    padding: "10px 16px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                    textDecoration: "none",
                    minWidth: 140,
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(209, 0, 36, 0.8)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} size="sm" />
                  <span style={{ whiteSpace: "nowrap" }}>Your Cart</span>
                  <div
                    style={{
                      background: totalItems > 0 ? "#D10024" : "#444",
                      color: "#fff",
                      borderRadius: "50%",
                      minWidth: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 12,
                      padding: "0 6px",
                      flexShrink: 0,
                    }}
                  >
                    {totalItems}
                  </div>
                </Link>
                {/* /Cart */}

                {/* Order History */}
                <Link
                  to="/order-history"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    padding: "10px 16px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                    textDecoration: "none",
                    minWidth: 140,
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(209, 0, 36, 0.8)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FontAwesomeIcon icon={faHistory} size="sm" />
                  <span style={{ whiteSpace: "nowrap" }}>Order History</span>
                </Link>
                {/* Login Button */}
              </div>
              {/* /Cart + Login */}
            </div>
          </div>
        </div>
        {/* /MAIN HEADER */}
      </header>
      {/* /HEADER */}
      {/* Responsive cho mobile */}
      <style>{`
      @media (max-width: 767px) {
        .header-main-row {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
          padding: 12px 0 !important;
        }
        .header-main-row > div {
          margin: 0 !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }
        .header-search {
          margin: 0 !important;
          max-width: 100% !important;
        }
      }
      `}</style>
    </>
  );
};

export default Header;
