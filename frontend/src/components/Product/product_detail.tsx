/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './productDetail.css';

interface ProductImage {
  id: string;
  url: string;
  originalName?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id?: string;
  name: string;
  categoryId: string;
  images?: ProductImage[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  slug?: string;
  price: number;
  description: string;   
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Partial<Product>>({});
  const navigate = useNavigate();

  const isAddMode = !id; // Kiểm tra nếu không có id thì là chế độ thêm mới

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/categories");
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();

    if (isAddMode) {
      // Chế độ thêm mới: Khởi tạo form rỗng
      const initialFormData: Product = {
        name: "",
        categoryId: "",
        images: [],
        isActive: true,
        price: 0,
        description: "",
        stock: 0,
      };
      setFormData(initialFormData);
    } else {
      // Chế độ chỉnh sửa: Lấy dữ liệu sản phẩm
      const fetchProduct = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/products/${id}`
          );
          if (response.data.success) {
            // Giữ nguyên toàn bộ object trả về từ API để không mất các trường động
            setProduct(response.data.data);
            setFormData(response.data.data);
          } else {
            setError("Không thể lấy dữ liệu sản phẩm");
          }
        } catch (err: any) {
          setError("Đã có lỗi xảy ra khi gọi API: " + err.message);
        }
      };

      fetchProduct();
    }
  }, [id, isAddMode]);

  const validateForm = (data: Product): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = "Tên sản phẩm là bắt buộc";
    if (!data.categoryId.trim()) errors.categoryId = "Danh mục là bắt buộc";
    if (!data.images || data.images.length === 0) errors.images = "Hình ảnh là bắt buộc";
    if (!data.description.trim()) errors.description = "Mô tả là bắt buộc";
    if (data.price <= 0) errors.price = "Giá phải lớn hơn 0";
    if (data.stock < 0) errors.stock = "Số lượng tồn kho không được âm";
    return errors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "price") {
      const rawValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              [name]: rawValue ? Number(rawValue) : 0,
            }
          : prev
      );
    } else {
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              [name]: type === "checkbox" ? checked : value,
            }
          : prev
      );
    }
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSave = async () => {
    if (!formData) return;
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        price: formData.price,
        stock: formData.stock,
        images: formData.images,
        description: formData.description,
        isActive: formData.isActive,
      };

      if (isAddMode) {
        // Chế độ thêm mới: Gửi POST request
        const response = await axios.post(
          "http://localhost:3000/api/products",
          payload
        );
        if (response.data.success) {
          setSuccessMessage("Tạo sản phẩm thành công!");
          setTimeout(() => {
            navigate("/products");
          }, 3000);
        } else {
          setError("Không thể tạo sản phẩm");
        }
      } else {
        // Chế độ chỉnh sửa: Gửi PUT request với payload
        const response = await axios.put(
          `http://localhost:3000/api/products/${id}`,
          payload
        );
        if (response.data.success) {
          setProduct({ ...product, ...payload });
          setSuccessMessage("Cập nhật sản phẩm thành công!");
          setTimeout(() => {
            navigate("/products");
          }, 3000);
        } else {
          setError("Không thể cập nhật sản phẩm");
        }
      }
    } catch (err: any) {
      setError(
        `Lỗi khi ${isAddMode ? "tạo" : "cập nhật"} sản phẩm: ${err.message}`
      );
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      setSuccessMessage("Xóa sản phẩm thành công!");
      setTimeout(() => {
        navigate("/products");
      }, 3000);
    } catch (err: any) {
      setError("Lỗi khi xóa sản phẩm: " + err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => navigate("/products");

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  if (error) return <div>{error}</div>;
  if (!formData) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="product-detail-container">
      <h2>{isAddMode ? "Thêm Sản Phẩm Mới" : "Chi Tiết Sản Phẩm"}</h2>
      {successMessage && (
        <div className="success-notification">
          {successMessage}
        </div>
      )}
      <div className="product-detail-card">
        <div className="product-detail-image-wrapper">
          {/* Chỉ hiển thị ảnh nếu có trong database */}
          {formData.images && formData.images.length > 0 && (
            <img
              src={formData.images[0].url}
              alt={formData.name}
              className="product-detail-image"
            />
          )}
        </div>

        <div className="product-detail-info">
          <div className="form-group">
            <label>Tên sản phẩm:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.name ? 'border-red-500' : ''}`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm">{validationErrors.name}</p>
            )}
          </div>
          <div className="form-group">
            <label>Danh mục:</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.categoryId ? 'border-red-500' : ''}`}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {validationErrors.categoryId && (
              <p className="text-red-500 text-sm">{validationErrors.categoryId}</p>
            )}
          </div>
          <div className="form-group">
            <label>Giá:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.price ? 'border-red-500' : ''}`}
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm">{validationErrors.price}</p>
            )}
          </div>
          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.description ? 'border-red-500' : ''}`}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm">{validationErrors.description}</p>
            )}
          </div>
          <div className="form-group">
            <label>Hàng tồn kho:</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.stock ? 'border-red-500' : ''}`}
            />
            {validationErrors.stock && (
              <p className="text-red-500 text-sm">{validationErrors.stock}</p>
            )}
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Trạng thái: {formData.isActive ? "Hoạt động" : "Không hoạt động"}
            </label>
          </div>
        </div>
      </div>

      <div className="product-detail-actions">
        <button onClick={handleBack}>Quay lại</button>
        <button onClick={handleSave}>{isAddMode ? "Lưu" : "Chỉnh sửa"}</button>
        {!isAddMode && <button onClick={openDeleteModal}>Xóa</button>}
      </div>

      {showDeleteModal && !isAddMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong>{product?.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;