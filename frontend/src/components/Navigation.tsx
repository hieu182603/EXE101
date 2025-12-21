import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { user } = useAuth();
  const [activeButton, setActiveButton] = useState<string>("");

  // Cập nhật active button dựa trên current location và state
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveButton("home");
    } else if (location.pathname === "/all-products") {
      if (location.state?.filter) {
        setActiveButton(location.state.filter);
      } else if (location.state?.clearFilter) {
        setActiveButton("all-products");
      } else {
        setActiveButton("all-products");
      }
    } else if (location.pathname === "/request-for-quota") {
      setActiveButton("build");
    }
  }, [location]);

  const handleFilter = (filter: string) => {
    setActiveButton(filter);
    navigate("/all-products", { state: { filter } });
  };

  const handleAllProducts = () => {
    setActiveButton("all-products");
    navigate("/all-products", { state: { clearFilter: true } });
  };

  const handleHome = () => {
    setActiveButton("home");
  };

  const getButtonStyle = (buttonType: string) => {
    const isActive = activeButton === buttonType;
    return {
      background: "none",
      border: "none",
      color: isActive ? "#ff2d55" : "#fff",
      textDecoration: "none",
      fontWeight: isActive ? 900 : 700,
      fontSize: 18,
      padding: "2px 8px",
      borderRadius: 4,
      cursor: "pointer",
      textShadow: isActive ? "0 0 5px rgba(255, 45, 85, 0.5)" : "none",
    };
  };

  return (
    <nav
      className="navigation"
      style={{
        background: "#181920",
        borderBottom: "2px solid #ff2d55",
        fontWeight: 600,
        boxShadow: "none",
        width: "100%",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            padding: "0.7rem 0",
            gap: 32,
          }}
        >
          <ul
            className="nav-list"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 36,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <Link to="/" style={getButtonStyle("home")} onClick={handleHome}>
                HOME
              </Link>
            </li>
            <li>
              <button
                style={getButtonStyle("all-products")}
                onClick={handleAllProducts}
              >
                ALL PRODUCTS
              </button>
            </li>
            <li>
              <button
                style={getButtonStyle("laptop")}
                onClick={() => handleFilter("laptop")}
              >
                LAPTOP
              </button>
            </li>
            <li>
              <button
                style={getButtonStyle("pc")}
                onClick={() => handleFilter("pc")}
              >
                PC
              </button>
            </li>
            <li>
              <button
                style={getButtonStyle("accessories")}
                onClick={() => handleFilter("accessories")}
              >
                ACCESSORIES
              </button>
            </li>
            <li>
              <button
                style={getButtonStyle("build")}
                onClick={() => {
                  setActiveButton("build");
                  navigate("/request-for-quota");
                }}
              >
                BUILD
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
