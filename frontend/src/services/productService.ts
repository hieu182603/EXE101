import api from "./apiInterceptor";
import type { Product, Category, ApiResponse } from "../types/product";

class ProductService {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>("/products");
      if (response.data && response.data.data && response.data.data.products) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error fetching all products:", error);
      return [];
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        `/products/category/${categoryId}`
      );
      if (response.data && response.data.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  }

  async getProductsByCategoryName(categoryName: string): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        `/products/category-name/${categoryName}`
      );
      // Correct mapping for your API response:
      if (response.data && response.data.data && response.data.data.products) {
        return response.data.data.products;
      }
      // Fallback for other possible structures
      if (response.data && response.data.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error fetching products by category name:", error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>(
        "/products/categories/all"
      );
      console.log("Categories API response:", response.data);

      // Check for the correct response structure
      if (
        response.data &&
        response.data.data &&
        response.data.data.categories
      ) {
        return response.data.data.categories;
      }
      // Fallback: try different response structure
      if (response.data && response.data.categories) {
        return response.data.categories;
      }
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      if (response.data && response.data.data && response.data.data.product) {
        return response.data.data.product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  async getProductByName(name: string): Promise<Product | null> {
    try {
      const response = await api.get<ApiResponse<Product>>(
        `/products/name/${name}`
      );
      console.log("response: ", response);
      if (response.data && response.data.product) {
        return response.data.product;
      }
      if(response.data && response.data.data && response.data.data.product){
        return response.data.data.product;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product by name:", error);
      return null;
    }
  }

  async getNewProducts(
    limit: number = 8
  ): Promise<{ laptops: Product[]; pcs: Product[]; accessories: Product[] }> {
    try {
      const response = await api.get<
        ApiResponse<{
          laptops: Product[];
          pcs: Product[];
          accessories: Product[];
        }>
      >(`/products/new?limit=${limit}`);
      if (response.data && response.data.data && response.data.data.products) {
        return response.data.data.products;
      }
      return { laptops: [], pcs: [], accessories: [] };
    } catch (error) {
      console.error("Error fetching new products:", error);
      return { laptops: [], pcs: [], accessories: [] };
    }
  }

  async getTopSellingProducts(limit: number = 6): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        `/products/top-selling?limit=${limit}`
      );
      if (response.data && response.data.data && response.data.data.products) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      return [];
    }
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        `/products/search?q=${encodeURIComponent(keyword)}`
      );
      if (response.data && response.data.data && response.data.data.products) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error searching products:", error);
      // Fallback: search locally if API fails
      try {
        const allProducts = await this.getAllProducts();
        const keywordLower = keyword.toLowerCase();
        return allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(keywordLower) ||
            (product.category?.name || "")
              .toLowerCase()
              .includes(keywordLower) ||
            (product.description || "").toLowerCase().includes(keywordLower)
        );
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        return [];
      }
    }
  }

  async getProductsByType(
    type: "laptop" | "pc" | "accessories",
    limit: number = 8
  ): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        `/products/type/${type}?limit=${limit}`
      );
      if (response.data && response.data.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching products by type ${type}:`, error);
      return [];
    }
  }

  async getProductsByMultipleCategories(
    categoryIds: string[],
    limit: number = 8
  ): Promise<Product[]> {
    try {
      const categoryIdsParam = categoryIds.join(",");
      const response = await api.get<ApiResponse<Product[]>>(
        `/products/categories/multiple?categoryIds=${categoryIdsParam}&limit=${limit}`
      );
      if (response.data && response.data.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error fetching products by multiple categories:", error);
      return [];
    }
  }

  // Admin methods
  async getAllProductsIncludingOutOfStock(): Promise<Product[]> {
    try {
      const response = await api.get("/products/admin/all");
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.products)
      ) {
        return response.data.data.products;
      }
      return [];
    } catch (error) {
      console.error(
        "Error fetching all products including out of stock:",
        error
      );
      return [];
    }
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        "/products/out-of-stock"
      );
      if (response.data && response.data.products) {
        return response.data.products;
      }
      return [];
    } catch (error) {
      console.error("Error fetching out of stock products:", error);
      return [];
    }
  }

  async updateProduct(
    id: string,
    data: Partial<Product>
  ): Promise<Product | null> {
    try {
      const response = await api.put<ApiResponse<Product>>(
        `/products/${id}`,
        data
      );
      if (response.data && response.data.data && response.data.data.product) {
        return response.data.data.product;
      }
      return null;
    } catch (error) {
      console.error("Error updating product:", error);
      return null;
    }
  }

  async removeProduct(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<unknown>>(`/products/${id}`);
      // Chấp nhận status 200, 201, 204 là thành công
      return [200, 201, 204].includes(response.status);
    } catch (error) {
      console.error('Error removing product:', error);
      return false;
    }
  }

  async createProduct(data: Partial<Product>): Promise<Product | null> {
    try {
      const response = await api.post("/products", data);
      if (response.data && response.data.data && response.data.data.product) {
        return response.data.data.product;
      }
      return null;
    } catch (error) {
      console.error("Error creating product:", error);
      return null;
    }
  }
}

export const productService = new ProductService();
