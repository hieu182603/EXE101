

const VIETNAM_PROVINCES_API = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';


export const fetchVietnamProvinces = async () => {
    try {
        const response = await fetch(VIETNAM_PROVINCES_API);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu địa giới hành chính');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu địa giới hành chính:', error);
        throw error;
    }
};


export const formatProvincesData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) return {};

    const formattedData = {};

    rawData.forEach(province => {
        const provinceName = province.Name;
        formattedData[provinceName] = {};

        if (province.Districts && Array.isArray(province.Districts)) {
            province.Districts.forEach(district => {
                const districtName = district.Name;
                formattedData[provinceName][districtName] = [];

                if (district.Wards && Array.isArray(district.Wards)) {
                    district.Wards.forEach(ward => {
                        formattedData[provinceName][districtName].push(ward.Name);
                    });
                }
            });
        }
    });

    return formattedData;
};


export const searchProvinces = (provinces, searchTerm) => {
    if (!searchTerm) return Object.keys(provinces);

    return Object.keys(provinces).filter(province =>
        province.toLowerCase().includes(searchTerm.toLowerCase())
    );
};


export const getDistrictsByProvince = (provinces, provinceName) => {
    if (!provinces[provinceName]) return [];
    return Object.keys(provinces[provinceName]);
};


export const getWardsByDistrict = (provinces, provinceName, districtName) => {
    if (!provinces[provinceName] || !provinces[provinceName][districtName]) return [];
    return provinces[provinceName][districtName];
};


export const validateAddress = (provinces, provinceName, districtName, wardName) => {
    if (!provinces[provinceName]) {
        return { valid: false, message: 'Tỉnh/thành phố không hợp lệ' };
    }

    if (!provinces[provinceName][districtName]) {
        return { valid: false, message: 'Quận/huyện không hợp lệ' };
    }

    if (!provinces[provinceName][districtName].includes(wardName)) {
        return { valid: false, message: 'Phường/xã không hợp lệ' };
    }

    return { valid: true, message: 'Địa chỉ hợp lệ' };
};



export const getVietnamStatistics = (provinces) => {
    const provinceCount = Object.keys(provinces).length;
    const districtCount = Object.values(provinces).reduce((total, districts) =>
        total + Object.keys(districts).length, 0);
    const wardCount = Object.values(provinces).reduce((total, districts) =>
        total + Object.values(districts).reduce((sum, wards) => sum + wards.length, 0), 0);

    return { provinceCount, districtCount, wardCount };
};