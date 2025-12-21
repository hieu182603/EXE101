import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowCircleRight,
  faEye,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";
// @ts-expect-error: No type declaration for footer.jsx, accept any type for Footer import
import Footer from "../components/footer";
import { productService } from "../services/productService";
import type { Product } from "../types/product";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductDetailModal from "../components/Product/productDetailModal";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const promoSlides = [
  { id: 1, image: "/img/banner/banner1.png" },
  { id: 2, image: "/img/banner/banner2.png" },
  { id: 3, image: "/img/banner/banner3.jpg" },
  { id: 4, image: "/img/banner/banner4.png" },
  { id: 5, image: "/img/banner/banner5.png" },
  { id: 6, image: "/img/banner/banner6.jpg" },
  { id: 7, image: "/img/banner/banner7.png" },
  { id: 8, image: "/img/banner/banner8.png" },
  { id: 9, image: "/img/banner/banner9.png" },
  { id: 10, image: "/img/banner/banner10.png" },
  { id: 11, image: "/img/banner/banner11.png" },
  { id: 12, image: "/img/banner/banner12.png" },
  { id: 13, image: "/img/banner/banner13.png" },
  { id: 14, image: "/img/banner/banner14.png" },
];

// Custom Arrow Components
type ArrowProps = React.ComponentPropsWithoutRef<"button">;

const ArrowStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  width: 48,
  height: 48,
  background: "rgba(255,255,255,0.5)",
  border: "none",
  borderRadius: 25,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.2s, box-shadow 0.2s, transform 0.2s, opacity 0.2s",
  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  fontSize: 32,
};

const NextArrow = ({
  onClick,
  isImgHover,
}: ArrowProps & { isImgHover: boolean }) => (
  <button
    className="custom-banner-arrow custom-banner-arrow-next"
    style={{
      ...ArrowStyle,
      right: 16,
      opacity: isImgHover ? 1 : 0,
      pointerEvents: isImgHover ? "auto" : "none",
    }}
    onClick={onClick}
    aria-label="Next"
  >
    <span style={{ color: "#222" }}>&#8250;</span>
  </button>
);
const PrevArrow = ({
  onClick,
  isImgHover,
}: ArrowProps & { isImgHover: boolean }) => (
  <button
    className="custom-banner-arrow custom-banner-arrow-prev"
    style={{
      ...ArrowStyle,
      left: 16,
      opacity: isImgHover ? 1 : 0,
      pointerEvents: isImgHover ? "auto" : "none",
    }}
    onClick={onClick}
    aria-label="Previous"
  >
    <span style={{ color: "#222" }}>&#8249;</span>
  </button>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, clearCart } = useCart();
  const { user, token } = useAuth();
  const [newProducts, setNewProducts] = useState<{
    laptops: Product[];
    pcs: Product[];
    accessories: Product[];
  }>({ laptops: [], pcs: [], accessories: [] });
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "laptop" | "pc" | "accessories"
  >("laptop");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addToCartStatus, setAddToCartStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<
    string | null
  >(null);
  const [isImgHover, setIsImgHover] = useState(false);
  const promoSliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow isImgHover={isImgHover} />,
    prevArrow: <PrevArrow isImgHover={isImgHover} />,
  };

  // Debug auth state changes - FIXED: Remove isAuthenticated function from dependencies
  useEffect(() => {
    // const authStatus = isAuthenticated(); // Không dùng, xóa dòng này
  }, [user, token]);

  // Debug registration success state
  useEffect(() => {
    const registrationSuccess = sessionStorage.getItem("registrationSuccess");
    if (registrationSuccess) {
      try {
        // const regData = JSON.parse(registrationSuccess); // Không dùng, xóa dòng này
      } catch (e) {
        // Không làm gì
      }
    }
  }, []);

  // Handle payment success messages from VNPay
  useEffect(() => {
    const state = location.state as {
      paymentSuccess?: boolean;
      message?: string;
    } | null;
    let shouldClear = false;
    if (state && state.paymentSuccess && state.message) {
      setPaymentSuccessMessage(state.message);
      shouldClear = true;
      // Clear the state
      navigate(location.pathname, { replace: true });
    } else {
      // Check sessionStorage nếu không có state
      const msg = sessionStorage.getItem("paymentSuccessMessage");
      if (msg) {
        setPaymentSuccessMessage(msg);
        shouldClear = true;
        sessionStorage.removeItem("paymentSuccessMessage");
      }
    }

    // Kiểm tra thêm cho trường hợp thanh toán COD
    const codSuccessMsg = sessionStorage.getItem("codSuccessMessage");
    if (codSuccessMsg) {
      setPaymentSuccessMessage(codSuccessMsg);
      shouldClear = true;
      sessionStorage.removeItem("codSuccessMessage");
    }

    if (shouldClear) {
      clearCart();
    }
  }, [location, navigate, clearCart]);

  // Auto-hide payment success message after 5 seconds
  useEffect(() => {
    if (paymentSuccessMessage) {
      const timer = setTimeout(() => {
        setPaymentSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccessMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newProductsData, topSellingData] = await Promise.all([
          productService.getNewProducts(8),
          productService.getTopSellingProducts(6),
        ]);

        // Ensure we have arrays
        setNewProducts(newProductsData);
        setTopSellingProducts(
          Array.isArray(topSellingData) ? topSellingData : []
        );
      } catch (error) {
        // Set empty arrays on error
        setNewProducts({ laptops: [], pcs: [], accessories: [] });
        setTopSellingProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const getProductImage = (product: Product): string => {
    // Ưu tiên sử dụng ảnh từ database
    if (product.images && product.images.length > 0) {
      // Lấy ảnh đầu tiên từ danh sách ảnh
      return product.images[0].url;
    }

    // Fallback: sử dụng ảnh fix cứng dựa trên category nếu không có ảnh từ database
    const categoryName = product.category?.name?.toLowerCase() || "";
    if (categoryName.includes("laptop")) return "/img/product01.png";
    if (categoryName.includes("pc")) return "/img/product02.png";
    if (categoryName.includes("monitor")) return "/img/product03.png";
    if (categoryName.includes("keyboard")) return "/img/product04.png";
    if (categoryName.includes("mouse")) return "/img/product05.png";
    if (categoryName.includes("headset")) return "/img/product06.png";
    if (categoryName.includes("cpu")) return "/img/product07.png";
    if (categoryName.includes("gpu")) return "/img/product08.png";
    if (categoryName.includes("ram")) return "/img/product09.png";
    return "/img/product01.png";
  };

  const handleOpenQuickView = async (product: Product) => {
    // Gọi API lấy chi tiết sản phẩm
    const detail = await productService.getProductById(product.id);
    setQuickViewProduct(detail || product);
    setIsQuickViewOpen(true);
  };
  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const handleAddToCart = async (product: Product) => {
    if (!product.id) {
      setAddToCartStatus({
        message: "Invalid product data",
        type: "error",
      });
      setTimeout(() => setAddToCartStatus(null), 3000);
      return;
    }

    try {
      await addToCart(product.id, 1);
      setAddToCartStatus({
        message: "Product added to cart successfully!",
        type: "success",
      });
      setTimeout(() => setAddToCartStatus(null), 3000);
    } catch (error) {
      setAddToCartStatus({
        message: "Failed to add product to cart",
        type: "error",
      });
      setTimeout(() => setAddToCartStatus(null), 3000);
    }
  };

  const renderProduct = (product: Product) => (
    <div
      key={product.id}
      className="product"
      style={{
        margin: "0 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div className="product-img">
          <img
            src={getProductImage(product)}
            alt={product.name}
            style={{
              width: "100%",
              height: 180,
              objectFit: "contain",
              background: "#fff",
              borderRadius: 12,
              display: "block",
              margin: "0 auto",
            }}
          />
          <div className="product-label">
            <span className="new">NEW</span>
          </div>
        </div>
        <div className="product-body">
          <p className="product-category">
            {product.category?.name || "Category"}
          </p>
          <h3 className="product-name">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <h4 className="product-price">{formatPrice(product.price)}</h4>
          <div className="product-btns">
            <button
              className="add-to-cart-icon"
              onClick={() => handleAddToCart(product)}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className="tooltipp">add to cart</span>
            </button>
            <button
              className="quick-view"
              onClick={async () => await handleOpenQuickView(product)}
            >
              <FontAwesomeIcon icon={faEye} />
              <span className="tooltipp">quick view</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Cấu hình slider cho 4 sản phẩm 1 lần, tự động trượt
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    style: { padding: "0 32px" },
  };

  const getFilteredProducts = () => {
    if (selectedTab === "laptop") {
      return newProducts.laptops || [];
    }
    if (selectedTab === "pc") {
      return newProducts.pcs || [];
    }
    // Accessories
    return newProducts.accessories || [];
  };

  // Thêm hàm mới để render sản phẩm Top Selling
  const renderTopSellingProduct = (product: Product) => (
    <div
      key={product.id}
      className="product-widget"
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 32,
        border: "none",
        boxShadow: "none",
      }}
    >
      <div
        className="product-img"
        style={{ minWidth: 60, maxWidth: 60, marginRight: 32 }}
      >
        <img
          src={getProductImage(product)}
          alt={product.name}
          style={{
            width: "100%",
            height: 80,
            objectFit: "contain",
            background: "#fff",
            borderRadius: 12,
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>
      <div className="product-body" style={{ flex: 1, textAlign: "left" }}>
        <p className="product-category">
          {product.category?.name || "Category"}
        </p>
        <h3
          className="product-name product-name-hover"
          style={{
            cursor: "pointer",
            transition: "color 0.2s",
            marginBottom: 2,
          }}
          onClick={async () => await handleOpenQuickView(product)}
        >
          {product.name}
        </h3>
        <h4 className="product-price">{formatPrice(product.price)}</h4>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h3>Loading...</h3>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Promo Banner Slider */}
      <div
        style={{
          width: "100%",
          position: "relative",
          background: "transparent",
          marginTop: 0,
          marginBottom: 5,
          height: 400,
          overflow: "hidden",
          maxWidth: "100%",
          padding: 0,
        }}
        className="promo-slider-hover-area"
      >
        <Slider {...promoSliderSettings}>
          {promoSlides.map((slide) => (
            <div
              key={slide.id}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 400,
                background: "#222",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
            >
              <img
                src={slide.image}
                alt="promo"
                style={{
                  height: 400,
                  width: "100%",
                  objectFit: "cover",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  margin: 0,
                  padding: 0,
                  position: "relative",
                  zIndex: 0,
                }}
                onMouseEnter={() => setIsImgHover(true)}
                onMouseLeave={() => setIsImgHover(false)}
              />
            </div>
          ))}
        </Slider>
      </div>
      {/* End Promo Banner Slider */}
      {addToCartStatus && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "15px",
            borderRadius: "5px",
            backgroundColor:
              addToCartStatus.type === "success" ? "#4CAF50" : "#f44336",
            color: "white",
            zIndex: 1000,
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {addToCartStatus.message}
        </div>
      )}
      {paymentSuccessMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "20px 30px",
            borderRadius: "8px",
            backgroundColor: "#28a745",
            color: "white",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "600",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <div style={{ marginBottom: "8px" }}>✅ {paymentSuccessMessage}</div>
          <button
            onClick={() => setPaymentSuccessMessage(null)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Đóng
          </button>
        </div>
      )}
      {/* SECTION: SHOP BOXES */}
      <div className="section" style={{ marginTop: 0 }}>
        <div className="container">
          <div className="row">
            {/* shop */}
            <div className="col-md-4 col-xs-6">
              <div
                className="shop"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate("/all-products", { state: { filter: "laptop" } })
                }
              >
                <div className="shop-img">
                  <img src="/img/shop01.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>
                    Laptop
                    <br />
                    Collection
                  </h3>
                  <span className="cta-btn">
                    Shop now <FontAwesomeIcon icon={faArrowCircleRight} />
                  </span>
                </div>
              </div>
            </div>
            {/* /shop */}
            <div className="col-md-4 col-xs-6">
              <div
                className="shop"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate("/all-products", {
                    state: { filter: "accessories" },
                  })
                }
              >
                <div className="shop-img">
                  <img src="/img/shop03.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>
                    Accessories
                    <br />
                    Collection
                  </h3>
                  <span className="cta-btn">
                    Shop now <FontAwesomeIcon icon={faArrowCircleRight} />
                  </span>
                </div>
              </div>
            </div>
            {/* /shop */}
            <div className="col-md-4 col-xs-6">
              <div
                className="shop"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate("/all-products", { state: { filter: "pc" } })
                }
              >
                <div className="shop-img">
                  <img src="/img/shop02.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>
                    PC
                    <br />
                    Collection
                  </h3>
                  <span className="cta-btn">
                    Shop now <FontAwesomeIcon icon={faArrowCircleRight} />
                  </span>
                </div>
              </div>
            </div>
            {/* /shop */}
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION: NEW PRODUCTS */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* section title */}
            <div className="col-md-12">
              <div className="section-title">
                <h3 className="title">New Products</h3>
                <div className="section-nav">
                  <ul className="section-tab-nav tab-nav">
                    <li className={selectedTab === "laptop" ? "active" : ""}>
                      <a
                        data-toggle="tab"
                        href="#tab1"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedTab("laptop");
                        }}
                      >
                        Laptop
                      </a>
                    </li>
                    <li className={selectedTab === "pc" ? "active" : ""}>
                      <a
                        data-toggle="tab"
                        href="#tab2"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedTab("pc");
                        }}
                      >
                        PC
                      </a>
                    </li>
                    <li
                      className={selectedTab === "accessories" ? "active" : ""}
                    >
                      <a
                        data-toggle="tab"
                        href="#tab3"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedTab("accessories");
                        }}
                      >
                        Accessories
                      </a>
                    </li>
                    <li>
                      <a
                        data-toggle="tab"
                        href="#tab4"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/request-for-quota");
                        }}
                      >
                        BUILD
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /section title */}
            {/* Products tab & slick */}
            <div className="col-md-12">
              <div className="row">
                <div className="products-tabs">
                  {/* tab */}
                  <div id="tab1" className="tab-pane active">
                    <Slider {...sliderSettings}>
                      {getFilteredProducts().map(renderProduct)}
                    </Slider>
                  </div>
                  {/* /tab */}
                </div>
              </div>
            </div>
            {/* Products tab & slick */}
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION: TOP SELLING */}
      <div className="section" style={{ background: "#fff" }}>
        <div
          className="container"
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          <div className="row" style={{ justifyContent: "center" }}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="col-md-4 col-xs-12"
                style={{ marginBottom: 24 }}
              >
                <div
                  className="section-title"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h4
                    className="title"
                    style={{
                      fontWeight: 700,
                      fontSize: 28,
                      letterSpacing: 1,
                      color: "#222",
                      marginBottom: 24,
                      marginTop: 0,
                    }}
                  >
                    TOP SELLING
                  </h4>
                  <div className="section-nav">
                    <div
                      id={`slick-nav-${index + 3}`}
                      className="products-slick-nav"
                    ></div>
                  </div>
                </div>
                <div>
                  {topSellingProducts &&
                    topSellingProducts.length > 0 &&
                    topSellingProducts
                      .slice(index * 2, (index + 1) * 2)
                      .map((product) => renderTopSellingProduct(product))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* /SECTION */}
      {/* Quick View Modal */}
      <ProductDetailModal
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        product={quickViewProduct}
      />
      <Footer />
    </>
  );
};

export default HomePage;
