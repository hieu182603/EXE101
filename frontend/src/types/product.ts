export interface ProductImage {
  id: string;
  url: string;
  originalName?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  slug: string;
  price: number;
  description: string;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Response format mới từ backend (không có success field)
export interface ApiResponse<T> {
  message: string;
  error?: string;
  [key: string]: any; // Cho phép các field khác như products, categories, etc.
}

// Response format cũ (để backward compatibility)
export interface LegacyApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export type ProductCategory = 
  | 'laptop' 
  | 'pc' 
  | 'cpu' 
  | 'ram' 
  | 'drive' 
  | 'monitor' 
  | 'cooler' 
  | 'psu' 
  | 'case' 
  | 'headset' 
  | 'network-card';

export interface FilterState {
  categories: ProductCategory[];
  priceRange?: [number, number];
  brands?: string[];
  inStockOnly?: boolean;
  searchQuery?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
} 