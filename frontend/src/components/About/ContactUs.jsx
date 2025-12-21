import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone, faEnvelope, faLocationDot, faClock,
    faShieldHalved, faTruck, faHeadset, faLock,
    faComments, faChevronDown, faAward, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import emailjs from '@emailjs/browser';
import styles from './ContactUs.module.css';
import Fade from 'react-reveal/Fade';
import Bounce from 'react-reveal/Bounce';
import Zoom from 'react-reveal/Zoom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../footer';

const ContactUs = () => {
    const form = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

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
            case 'success':
                notification.style.backgroundColor = '#22c55e';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
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
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4700);
    };

    const sendEmail = (e) => {
        e.preventDefault();
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
            showNotification('⚠️ Vui lòng đăng nhập để gửi yêu cầu tư vấn!', 'warning');
            navigate('/login');
            return;
        }

        setIsSubmitting(true);
        emailjs.sendForm(
            'service_rqshknr',
            'template_tj8a3xn',
            form.current,
            'N_MB7gWT5V-WSfWBY'
        )
            .then(() => {
                showNotification('✅ Cảm ơn bạn đã liên hệ!', 'success');
                form.current.reset();
            })
            .catch(() => {
                showNotification('❌ Có lỗi xảy ra, vui lòng thử lại.', 'error');
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <>
            <div className={styles.contactus}>
                <div className={styles.header} style={{cursor:'pointer'}} onClick={() => navigate('/') }>
                    <Bounce top cascade>
                        <h1>LIÊN HỆ VỚI CHÚNG TÔI</h1>
                    </Bounce>

                    <Fade bottom delay={500}>
                        <p className={styles.mainDesc}>
                            Chuyên cung cấp linh kiện máy tính chính hãng với giá tốt nhất thị trường
                        </p>
                    </Fade>

                    <Fade bottom delay={800}>
                        <p className={styles.subDesc}>
                            Giá tốt nhất thị trường - Bảo hành uy tín - Giao hàng nhanh chóng
                        </p>
                    </Fade>

                    <div className={styles.badges}>
                        <Zoom cascade delay={1000}>
                            <div className={styles.badge}>
                                <FontAwesomeIcon icon={faAward} />
                                <span>Uy tín hàng đầu</span>
                            </div>
                            <div className={styles.badge}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <span>Bảo hành chính hãng</span>
                            </div>
                            <div className={styles.badge}>
                                <FontAwesomeIcon icon={faTruck} />
                                <span>Giao hàng nhanh</span>
                            </div>
                        </Zoom>
                    </div>
                </div>

                <div className={styles.infoBoxes}>
                    <div className={`${styles.infoBox} ${styles.hotline}`}>
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={faPhone} />
                        </div>
                        <div className={styles.content}>
                            <h3>Hotline</h3>
                            <p className={styles.mainText}>1900-1234</p>
                            <p className={styles.subText}>Hỗ trợ 24/7</p>
                        </div>
                    </div>

                    <div className={`${styles.infoBox} ${styles.email}`}>
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <div className={styles.content}>
                            <h3>Email</h3>
                            <p className={styles.mainText}>Technical@gmail.com</p>
                            <p className={styles.subText}>Phản hồi trong 2h</p>
                        </div>
                    </div>

                    <div className={`${styles.infoBox} ${styles.address}`}>
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={faLocationDot} />
                        </div>
                        <div className={styles.content}>
                            <h3>Địa chỉ</h3>
                            <p className={styles.mainText}>Khu Công Nghệ Cao Hòa Lạc,Hà Nội</p>

                        </div>
                    </div>

                    <div className={`${styles.infoBox} ${styles.workHours}`}>
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div className={styles.content}>
                            <h3>Giờ làm việc</h3>
                            <p className={styles.mainText}>8:00 - 22:00</p>
                            <p className={styles.subText}>Tất cả các ngày</p>
                        </div>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.formSection}>
                        <div className={styles.formHeader}>
                            <div className={styles.iconBox}>
                                <FontAwesomeIcon icon={faComments} />
                            </div>
                            <div>
                                <h2>Gửi yêu cầu tư vấn</h2>
                                <p>Chúng tôi sẽ phản hồi trong vòng 30 phút</p>
                            </div>
                        </div>

                        {!isAuthenticated() && (
                            <div className={styles.authNotice}>
                                <FontAwesomeIcon icon={faLock} />
                                <p>Vui lòng <button type="button" onClick={() => navigate('/login')} className={styles.loginLink}>đăng nhập</button> để gửi yêu cầu tư vấn</p>
                            </div>
                        )}
                        
                        {isAuthenticated() && user && (
                            <div className={styles.authSuccess}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                                <p>Xin chào <strong>{user.username}</strong>! Bạn có thể gửi yêu cầu tư vấn.</p>
                            </div>
                        )}

                        <form ref={form} onSubmit={sendEmail}>
                            <div className={styles.formRow}>
                                <div className={styles.inputWrapper}>
                                    <input 
                                        type="text" 
                                        name="user_name" 
                                        placeholder="Họ và tên *" 
                                        defaultValue={isAuthenticated() && user ? user.username : ''}
                                        required 
                                    />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input type="email" name="user_email" placeholder="Email *" required />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.inputWrapper}>
                                    <input type="tel" name="phone_number" placeholder="Số điện thoại" />
                                </div>
                                <div className={styles.selectWrapper}>
                                    <select name="service" defaultValue="">
                                        <option value="" disabled>Tư vấn mua hàng</option>
                                        <option value="tuvan">Tư vấn sản phẩm</option>
                                        <option value="baohanh">Bảo hành</option>
                                        <option value="suachua">Sửa chữa</option>
                                    </select>
                                    <FontAwesomeIcon icon={faChevronDown} className={styles.selectIcon} />
                                </div>
                            </div>
                            <div className={styles.inputWrapper}>
                                <textarea
                                    name="message"
                                    placeholder="Mô tả chi tiết yêu cầu của bạn *"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={isSubmitting}>
                                <FontAwesomeIcon icon={faComments} />
                                {isSubmitting ? 'Đang gửi...' : 'GỬI YÊU CẦU TƯ VẤN'}
                            </button>
                        </form>
                    </div>

                    <div className={styles.whyUs}>
                        <h2>Tại sao chọn chúng tôi?</h2>
                        <div className={styles.reasons}>
                            <div className={styles.reason}>
                                <FontAwesomeIcon icon={faShieldHalved} />
                                <div>
                                    <h3>Bảo hành chính hãng</h3>
                                    <p>Cam kết 100% hàng chính hãng</p>
                                </div>
                            </div>
                            <div className={styles.reason}>
                                <FontAwesomeIcon icon={faTruck} />
                                <div>
                                    <h3>Giao hàng nhanh</h3>
                                    <p>Giao hàng trong 2-4 giờ tại TP Hà Nội</p>
                                </div>
                            </div>
                            <div className={styles.reason}>
                                <FontAwesomeIcon icon={faLock} />
                                <div>
                                    <h3>Chất lượng đảm bảo</h3>
                                    <p>Kiểm tra kỹ trước khi giao</p>
                                </div>
                            </div>
                            <div className={styles.reason}>
                                <FontAwesomeIcon icon={faHeadset} />
                                <div>
                                    <h3>Tư vấn chuyên nghiệp</h3>
                                    <p>Đội ngũ kỹ thuật giàu kinh nghiệm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ContactUs;