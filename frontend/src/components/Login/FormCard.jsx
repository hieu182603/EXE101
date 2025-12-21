import React from 'react';
import styles from './FormCard.module.css';

const FormCard = ({ children }) => {
  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <div className={styles.formContent}>
          {children}
        </div>
        <div className={styles.formImage}>
          <img 
            src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop" 
            alt="PC Components and Hardware"
          />
          <div className={styles.imageOverlay}>
            <h3>Premium PC Components</h3>
            <p>Build your dream workstation with quality parts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormCard; 