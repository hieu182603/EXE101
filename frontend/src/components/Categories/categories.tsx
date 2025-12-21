import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPhone, faMapMarker, faShoppingCart as faCart, faTimes, faArrowCircleRight, faBars, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeRegular, faUser as faUserRegular } from '@fortawesome/free-regular-svg-icons';
import { 
  Monitor, Cpu, HardDrive, Headphones, Keyboard, Laptop, 
  Clapperboard as Motherboard, Mouse, Wifi, Zap, MemoryStick, 
  Box, Fan 
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

export const categories: Category[] = [
  { id: 'case', name: 'PC Cases', icon: <Box className="w-8 h-8" />, gradient: 'from-blue-500 to-cyan-400' },
  { id: 'cooler', name: 'Coolers', icon: <Fan className="w-8 h-8" />, gradient: 'from-cyan-500 to-blue-400' },
  { id: 'cpu', name: 'Processors', icon: <Cpu className="w-8 h-8" />, gradient: 'from-purple-500 to-pink-400' },
  { id: 'drive', name: 'Storage', icon: <HardDrive className="w-8 h-8" />, gradient: 'from-green-500 to-emerald-400' },
  { id: 'headset', name: 'Headsets', icon: <Headphones className="w-8 h-8" />, gradient: 'from-orange-500 to-red-400' },
  { id: 'keyboard', name: 'Keyboards', icon: <Keyboard className="w-8 h-8" />, gradient: 'from-indigo-500 to-purple-400' },
  { id: 'laptop', name: 'Laptops', icon: <Laptop className="w-8 h-8" />, gradient: 'from-pink-500 to-rose-400' },
  { id: 'monitor', name: 'Monitors', icon: <Monitor className="w-8 h-8" />, gradient: 'from-teal-500 to-cyan-400' },
  { id: 'motherboard', name: 'Motherboards', icon: <Motherboard className="w-8 h-8" />, gradient: 'from-violet-500 to-purple-400' },
  { id: 'mouse', name: 'Mice', icon: <Mouse className="w-8 h-8" />, gradient: 'from-yellow-500 to-orange-400' },
  { id: 'networkCard', name: 'Network Cards', icon: <Wifi className="w-8 h-8" />, gradient: 'from-emerald-500 to-teal-400' },
  { id: 'psu', name: 'Power Supplies', icon: <Zap className="w-8 h-8" />, gradient: 'from-red-500 to-pink-400' },
  { id: 'ram', name: 'Memory (RAM)', icon: <MemoryStick className="w-8 h-8" />, gradient: 'from-blue-600 to-indigo-400' }
];

interface BackendCategory {
  id: number;
  name: string;
  products?: any[];
}

const CategoriesComponent = () => {
  const [backendCategories, setBackendCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setBackendCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      {/* HEADER (from HomePage.jsx) */}
      <header>
        {/* TOP HEADER */}
        <div id="top-header">
          <div className="container">
            <ul className="header-links pull-left">
              <li>
                <a href="#"><FontAwesomeIcon icon={faPhone} color="#D10024" /> 0373307285</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" /> manhndthe181128@fpt.edu.vn</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faMapMarker} color="#D10024" /> Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a>
              </li>
            </ul>
            <ul className="header-links pull-right">
              <li>
                <Link to="/login"><FontAwesomeIcon icon={faUserRegular} /> My Account</Link>
              </li>
            </ul>
          </div>
        </div>
        {/* /TOP HEADER */}

        {/* MAIN HEADER */}
        <div id="header">
          <div className="container">
            <div className="row">
              {/* LOGO */}
              <div className="col-md-3">
                <div className="header-logo">
                  <a href="#" className="logo">
                    <img src="/img/logo.png" alt="" />
                  </a>
                </div>
              </div>
              {/* /LOGO */}

              {/* SEARCH BAR */}
              <div className="col-md-6">
                <div className="header-search">
                  <form>
                    <select className="input-select">
                      <option value="0">All Categories</option>
                      <option value="1">Category 01</option>
                      <option value="1">Category 02</option>
                    </select>
                    <input className="input" placeholder="Search here" />
                    <button className="search-btn">Search</button>
                  </form>
                </div>
              </div>
              {/* /SEARCH BAR */}

              {/* ACCOUNT */}
              <div className="col-md-3 clearfix">
                <div className="header-ctn">
                  {/* Wishlist */}
                  <div>
                    <a href="#">
                      <FontAwesomeIcon icon={faHeart} size="lg" className="wishlist-icon" />
                      <span className="wishlist-text">Your Wishlist</span>
                      <div className="qty">2</div>
                    </a>
                  </div>
                  {/* /Wishlist */}

                  {/* Cart */}
                  <div className="dropdown">
                    <Link to="/cart" className="dropdown-toggle">
                      <FontAwesomeIcon icon={faCart} />
                      <span>Your Cart</span>
                      <div className="qty">3</div>
                    </Link>
                    <div className="cart-dropdown">
                      <div className="cart-list">
                        <div className="product-widget">
                          <div className="product-img">
                            <img src="/img/product01.png" alt="" />
                          </div>
                          <div className="product-body">
                            <h3 className="product-name">
                              <a href="#">product name goes here</a>
                            </h3>
                            <h4 className="product-price">
                              <span className="qty">1x</span>$980.00
                            </h4>
                          </div>
                          <button className="delete">
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                        <div className="product-widget">
                          <div className="product-img">
                            <img src="/img/product02.png" alt="" />
                          </div>
                          <div className="product-body">
                            <h3 className="product-name">
                              <a href="#">product name goes here</a>
                            </h3>
                            <h4 className="product-price">
                              <span className="qty">3x</span>$980.00
                            </h4>
                          </div>
                          <button className="delete">
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-summary">
                        <small>3 Item(s) selected</small>
                        <h5>SUBTOTAL: $2940.00</h5>
                      </div>
                      <div className="cart-btns">
                        <Link to="/cart">View Cart</Link>
                        <a href="#">Checkout <FontAwesomeIcon icon={faArrowCircleRight} /></a>
                      </div>
                    </div>
                  </div>
                  {/* /Cart */}

                  {/* Menu Toogle */}
                  <div className="menu-toggle">
                    <a href="#">
                      <FontAwesomeIcon icon={faBars} />
                      <span>Menu</span>
                    </a>
                  </div>
                  {/* /Menu Toogle */}
                </div>
              </div>
              {/* /ACCOUNT */}
            </div>
          </div>
        </div>
        {/* /MAIN HEADER */}
      </header>
      {/* /HEADER */}

      {/* NAVIGATION */}
      <nav id="navigation">
        <div className="container">
          <div id="responsive-nav">
            <ul className="main-nav nav navbar-nav">
              <li className="active"><a href="#">Home</a></li>
              <li><a href="#">Hot Deals</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">Laptop</a></li>
              <li><a href="#">PC</a></li>
              <li><a href="#">Accessories</a></li>
              <li><a href="#">Build PC</a></li>
            </ul>
          </div>
        </div>
      </nav>
      {/* /NAVIGATION */}

      {/* CATEGORIES CONTENT */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Product Categories</h1>
            <p className="text-gray-300 text-lg">Browse our comprehensive selection of PC components</p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg">Loading categories...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group block"
                >
                  <div className={`p-6 bg-gradient-to-r ${category.gradient} rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white text-center">
                      {category.name}
                    </h3>
                    <div className="mt-4 text-center">
                      <span className="text-white/80 text-sm">
                        {backendCategories.find(bc => bc.name === category.name)?.products?.length || 0} products
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER (from HomePage.jsx) */}
      <footer id="footer">
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">About Us</h3>
                  <p>Quality components – Build a standard PC to assemble according to your needs.
                    High quality, top performance, dedicated support.</p>
                  <ul className="footer-links">
                    <li><a href="#"><FontAwesomeIcon icon={faMapMarker} color="#D10024" />Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faPhone} color="#D10024" />0373307285</a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" />manhndthe181128</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">Categories</h3>
                  <ul className="footer-links">
                    <li><a href="#">Hot deals</a></li>
                    <li><a href="#">Laptop</a></li>
                    <li><a href="#">PC</a></li>
                    <li><a href="#">Accessories</a></li>
                    <li><a href="#">Build PC</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">Information</h3>
                  <ul className="footer-links">
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Orders and Returns</a></li>
                    <li><a href="#">Terms & Conditions</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">Service</h3>
                  <ul className="footer-links">
                    <li><a href="#">My Account</a></li>
                    <li><a href="#">View Cart</a></li>
                    <li><a href="#">Wishlist</a></li>
                    <li><a href="#">Track My Order</a></li>
                    <li><a href="#">Help</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* /FOOTER */}
    </>
  );
};

export default CategoriesComponent; 