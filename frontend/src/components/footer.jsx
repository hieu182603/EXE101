/** @type {import('react').FC} */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeRegular } from '@fortawesome/free-regular-svg-icons';
import '../Page/HomePage.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleFooterNav = (type) => {
    if (type === 'home') {
      navigate('/');
    } else if (type === 'all-products') {
      navigate('/all-products', { state: { clearFilter: true } });
    } else if (type === 'laptop' || type === 'pc' || type === 'accessories') {
      navigate('/all-products', { state: { filter: type } });
    }
  };

  return (
    <footer id="footer" className="bg-gray-900 text-white text-xl ">
      <div className="section py-8 px-2">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-32 gap-y-10 justify-items-center mx-auto">
            <div className="footer">
              <h3 className="footer-title text-2xl">About Us</h3>
              <p className="text-xl">Since 2015, we've been fulfilling the tech dreams and big plans of millions of people. You can find literally everything here for your perfect gaming setup.</p>
              <ul className="footer-links space-y-2 text-xl">
                <li><Link to="/contact" className="flex items-center gap-2"><FontAwesomeIcon icon={faMapMarker} color="#D10024" />Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</Link></li>
                <li><Link to="/contact" className="flex items-center gap-2"><FontAwesomeIcon icon={faPhone} color="#D10024" />1900-1234</Link></li>
                <li><Link to="/contact" className="flex items-center gap-2"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" />Technical@gmail.com</Link></li>
              </ul>
            </div>

            <div className="footer md:col-start-2">
              <h3 className="footer-title text-2xl">Categories</h3>
              <ul className="footer-links space-y-2">
                <li><button className="footer-link-btn bg-transparent border-none cursor-pointer p-0" onClick={() => handleFooterNav('home')}>Home</button></li>
                <li><button className="footer-link-btn bg-transparent border-none cursor-pointer p-0" onClick={() => handleFooterNav('all-products')}>All Products</button></li>
                <li><button className="footer-link-btn bg-transparent border-none cursor-pointer p-0" onClick={() => handleFooterNav('laptop')}>Laptop</button></li>
                <li><button className="footer-link-btn bg-transparent border-none cursor-pointer p-0" onClick={() => handleFooterNav('pc')}>PC</button></li>
                <li><button className="footer-link-btn bg-transparent border-none cursor-pointer p-0" onClick={() => handleFooterNav('accessories')}>Accessories</button></li>
              </ul>
            </div>

            <div className="footer md:col-start-3">
              <h3 className="footer-title text-2xl">Information</h3>
              <ul className="footer-links space-y-2">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Orders and Returns</a></li>
              </ul>
            </div>

            <div className="footer md:col-start-4">
              <h3 className="footer-title text-2xl">Service</h3>
              <ul className="footer-links space-y-2">
                <li><a href="#">My Account</a></li>
                <li><Link to="/cart">View Cart</Link></li>
                <li><a href="#">Wishlist</a></li>
                <li><Link to="/cart?showHistory=true">Track My Order</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 