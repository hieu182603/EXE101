import { useState, useEffect } from 'react';
import { fetchVietnamProvinces, formatProvincesData } from '../services/vietnamProvinces';

/**
 * Custom hook để quản lý dữ liệu địa giới hành chính Việt Nam
 * @returns {Object} { provinces, loading, error }
 */
export const useVietnamProvinces = () => {
    const [provinces, setProvinces] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const rawData = await fetchVietnamProvinces();
                const formattedData = formatProvincesData(rawData);
                setProvinces(formattedData);
                setError(null);
            } catch (err) {
                setError(err.message);
                // Fallback to basic data if API fails
                setProvinces(getBasicProvincesData());
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { provinces, loading, error };
};

/**
 * Fallback data khi API không khả dụng
 */
const getBasicProvincesData = () => ({
    "Hà Nội": {
        "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc"],
        "Quận Hoàn Kiếm": ["Phường Phúc Tấn", "Phường Đồng Xuân", "Phường Hàng Mã"],
        "Quận Hai Bà Trưng": ["Phường Nguyễn Du", "Phường Bạch Đằng", "Phường Phạm Đình Hổ"],
    },
    "TP. Hồ Chí Minh": {
        "Quận 1": ["Phường Tân Định", "Phường Đa Kao", "Phường Bến Nghé"],
        "Quận 3": ["Phường 1", "Phường 2", "Phường 3"],
        "Quận 7": ["Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng"],
    },
    "Đà Nẵng": {
        "Quận Hải Châu": ["Phường Thạch Thang", "Phường Hải Châu I", "Phường Hải Châu II"],
        "Quận Thanh Khê": ["Phường Tam Thuận", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông"],
    }
}); 