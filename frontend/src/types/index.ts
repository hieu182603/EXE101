export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  price: number;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
} 