import React from "react";
import { BsArrowDown } from "react-icons/bs";
import { FaTruck, FaExchangeAlt, FaPercent, FaClock } from 'react-icons/fa';
import { BsPeople, BsBox, BsStar, BsEmojiSmile } from 'react-icons/bs';
import { Carousel } from 'react-bootstrap';
import styles from './Aboutus.module.css';
import Footer from '../footer';
import { useNavigate } from 'react-router-dom';

function Aboutus() {
    const scrollToMission = (e) => {
        e.preventDefault();
        const missionElement = document.getElementById("mission");
        missionElement.scrollIntoView({ behavior: "smooth" });
    };
    const navigate = useNavigate();

    const stats = [
        { number: "2M+", label: "Happy Customers", icon: BsPeople },
        { number: "15K+", label: "Products", icon: BsBox },
        { number: "4.9", label: "Rating", icon: BsStar },
        { number: "99%", label: "Satisfaction", icon: BsEmojiSmile }
    ];

    const services = [
        { 
            icon: FaTruck, 
            title: "Free Delivery",
            desc: "Free shipping on orders over $99",
            iconClass: "delivery"
        },
        { 
            icon: FaExchangeAlt, 
            title: "Easy Returns",
            desc: "30-day hassle-free returns",
            iconClass: "returns"
        },
        { 
            icon: FaPercent, 
            title: "Best Prices",
            desc: "Price match guarantee",
            iconClass: "prices"
        },
        { 
            icon: FaClock, 
            title: "24/7 Support",
            desc: "Round-the-clock assistance",
            iconClass: "support"
        }
    ];

    const brands = [
        {
            name: "MSI",
            category: "Gaming Hardware",
            logo: "MSI"
        },
        {
            name: "NVIDIA",
            category: "Graphics Cards",
            logo: "NVIDIA"
        },
        {
            name: "CORSAIR",
            category: "PC Components",
            logo: "CORSAIR"
        },
        {
            name: "Intel",
            category: "Processors",
            logo: "intel"
        },
        {
            name: "AMD",
            category: "CPUs & GPUs",
            logo: "AMD"
        },
        {
            name: "ASUS",
            category: "Motherboards",
            logo: "ASUS"
        }
    ];

    return (
        <>
            <section className={styles.aboutSection}>
                <div className="container">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-6">
                            <div className={styles.contentWrapper}>
                                <div className={styles.contentBox}>
                                    <h2>
                                        More than a
                                        <span>retailer</span>
                                    </h2>
                                    <p>
                                        Since 2015, we've been fulfilling the tech dreams and big
                                        plans of millions of people. You can find literally
                                        everything here for your perfect gaming setup.
                                    </p>
                                    <div className="d-flex gap-3">
                                        <a href="#" className={`${styles.seeMoreBtn} ${styles.primary}`}>
                                            Explore Products
                                        </a>
                                        <a
                                            href="#mission"
                                            onClick={scrollToMission}
                                            className={styles.seeMoreBtn}
                                        >
                                            See More
                                            <BsArrowDown className={styles.bounceArrow} />
                                        </a>
                                    </div>
                                    <div className={styles.statsContainer}>
                                        {stats.map((stat, index) => (
                                            <div key={index} className={styles.statItem}>
                                                <stat.icon className={styles.statIcon} />
                                                <div className={styles.statNumber}>{stat.number}</div>
                                                <div className={styles.statLabel}>{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className={styles.imageWrapper}>
                                <img
                                    src="/img/pexels.png"
                                    alt="Gaming Setup"
                                    className={styles.image}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="mission" className={styles.servicesSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Our Services</h2>
                    <p className={styles.sectionDesc}>
                        Quality components – Build a standard PC to assemble according to your needs. <br />
                        High quality, top performance, dedicated support.
                    </p>
                    <div className="row g-4">
                        {services.map((service, index) => (
                            <div key={index} className="col-md-6 col-lg-3">
                                <div className={styles.serviceCard}>
                                    <div className={styles.iconWrapper}>
                                        <service.icon className={`${styles.serviceIcon} ${styles[service.iconClass]}`} />
                                    </div>
                                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                                    <p className={styles.serviceDesc}>{service.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.brandsSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Our Brands</h2>
                    <p className={styles.sectionDesc}>
                        We partner with the world's leading gaming and PC component manufacturers <br />
                        to bring you the best in performance and reliability.
                    </p>
                    <div className={styles.brandsCarousel}>
                        <Carousel
                            controls={false}
                            indicators={false}
                            interval={3000}
                            pause="hover"
                        >
                            <Carousel.Item>
                                <div className="row">
                                    {['c1', 'c2', 'c3', 'c4'].map((brand, index) => (
                                        <div key={index} className="col-3">
                                            <a href="#">
                                                <img 
                                                    className={styles.brandImg} 
                                                    src={`/img/${brand}.png`}
                                                    alt={`${brand} Logo`} 
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="row">
                                    {['c8', 'c5', 'c6', 'c7'].map((brand, index) => (
                                        <div key={index} className="col-3">
                                            <a href="#">
                                                <img 
                                                    className={styles.brandImg} 
                                                    src={`/img/${brand}.png`}
                                                    alt={`${brand} Logo`} 
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </Carousel.Item>
                        </Carousel>
                    </div>

                    <div className={styles.ctaSection}>
                        <h2 className={styles.ctaTitle}>Ready to Build Your Dream Setup?</h2>
                        <p className={styles.ctaText}>Join millions of satisfied customers and start building today</p>
                        <button className={styles.ctaButton} onClick={() => navigate('/')}>Start Shopping</button>
                    </div>
                </div>
            </section>
            <Footer/>
        </>
    );
}

export default Aboutus;
