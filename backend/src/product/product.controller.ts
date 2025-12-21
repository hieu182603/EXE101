import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { Product } from "./product.entity";

@Service()
@Controller("/products")
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @Get("/")
    async getAllProducts() {
        try {
            const products = await this.productService.getAllProducts();
            return {
                message: "Products retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve products",
                error: error.message
            };
        }
    }

    @Get("/all-including-out-of-stock")
    @UseBefore(Auth)
    @CheckAbility("read", Product)
    async getAllProductsIncludingOutOfStock(@Req() req: any) {
        try {
            const products = await this.productService.getAllProductsIncludingOutOfStock();
            return {
                message: "All products (including out of stock) retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve all products",
                error: error.message
            };
        }
    }

    @Get("/admin/all")
    async getAllProductsForAdmin() {
        try {
            const products = await this.productService.getAllProductsIncludingOutOfStock();
            return {
                message: "All products for admin retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve all products for admin",
                error: error.message
            };
        }
    }

    @Get("/out-of-stock")
    @UseBefore(Auth)
    @CheckAbility("read", Product)
    async getOutOfStockProducts(@Req() req: any) {
        try {
            const products = await this.productService.getOutOfStockProducts();
            return {
                message: "Out of stock products retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve out of stock products",
                error: error.message
            };
        }
    }

    @Get("/new")
    async getNewProducts(@QueryParam("limit") limit: number = 8) {
        try {
            const products = await this.productService.getNewProducts(limit);
            return {
                message: "New products retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve new products",
                error: error.message
            };
        }
    }

    @Get("/top-selling")
    async getTopSellingProducts(@QueryParam("limit") limit: number = 6) {
        try {
            const products = await this.productService.getTopSellingProducts(limit);
            return {
                message: "Top selling products retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve top selling products",
                error: error.message
            };
        }
    }

    @Get("/category/:categoryId")
    async getProductsByCategory(@Param("categoryId") categoryId: string) {
        try {
            const products = await this.productService.getProductsByCategory(categoryId);
            return {
                message: "Products by category retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve products by category",
                error: error.message
            };
        }
    }

    @Get("/category-name/:categoryName")
    async getProductsByCategoryName(@Param("categoryName") categoryName: string) {
        try {
            const products = await this.productService.getProductsByCategoryName(categoryName);
            return {
                message: "Products by category name retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve products by category name",
                error: error.message
            };
        }
    }

    @Get("/search")
    async searchProducts(@QueryParam("q") keyword: string) {
        if (!keyword || keyword.trim() === "") {
            return {
                message: "Missing search keyword"
            };
        }
        try {
            const products = await this.productService.searchProducts(keyword);
            return {
                message: "Products search result",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to search products",
                error: error.message
            };
        }
    }

    @Get("/:id")
    async getProductById(@Param("id") id: string) {
        try {
            const product = await this.productService.getProductById(id);
            if (!product) {
                return {
                    message: "Product not found"
                };
            }
            return {
                message: "Product retrieved successfully",
                product
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve product",
                error: error.message
            };
        }
    }

    @Get("/name/:name")
    async getProductByName(@Param("name") name: string) {
        try {
            const product = await this.productService.getProductByName(name);
            if (!product) {
                return {
                    message: "Product not found"
                };
            }
            return {
                message: "Product retrieved successfully",
                product
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve product",
                error: error.message
            };
        }
    }

    @UseBefore(Auth)
    @CheckAbility("create", Product)
    @Post("/")
    async createProduct(@Body() createProductDto: CreateProductDto, @Req() req: any) {
        try {
            const product = await this.productService.createProduct(createProductDto);
            return {
                message: "Product created successfully",
                product
            };
        } catch (error: any) {
            return {
                message: "Failed to create product",
                error: error.message
            };
        }
    }

    @Put("/:id")
    async updateProduct(
        @Param("id") id: string,
        @Body() updateProductDto: UpdateProductDto
    ) {
        try {
            const product = await this.productService.updateProduct(id, updateProductDto);
            if (!product) {
                return {
                    message: "Product not found"
                };
            }
            return {
                message: "Product updated successfully",
                product
            };
        } catch (error: any) {
            return {
                message: "Failed to update product",
                error: error.message
            };
        }
    }

    @Delete("/:id")
    async deleteProduct(@Param("id") id: string) {
        try {
            const result = await this.productService.deleteProduct(id);
            if (!result) {
                return {
                    message: "Product not found"
                };
            }
            return {
                message: "Product deleted successfully"
            };
        } catch (error: any) {
            return {
                message: "Failed to delete product",
                error: error.message
            };
        }
    }

    // Thêm endpoint để lấy sản phẩm theo main category
    @Get("/main-category/:categoryId")
    async getProductsByMainCategory(
        @Param("categoryId") categoryId: string,
        @QueryParam("limit") limit: number = 8
    ) {
        try {
            const products = await this.productService.getProductsByMainCategory(categoryId, limit);
            return {
                message: "Products by main category retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve products by main category",
                error: error.message
            };
        }
    }

    // Thêm endpoint để lấy tất cả categories
    @Get("/categories/all")
    async getAllCategories() {
        try {
            const categories = await this.productService.getAllCategories();
            return {
                message: "Categories retrieved successfully",
                categories
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve categories",
                error: error.message
            };
        }
    }

    // Thêm endpoint để lấy sản phẩm theo nhiều categories
    @Get("/categories/multiple")
    async getProductsByMultipleCategories(
        @QueryParam("categoryIds") categoryIds: string,
        @QueryParam("limit") limit: number = 8
    ) {
        if (!categoryIds) {
            return {
                message: "Missing category IDs"
            };
        }
        
        try {
            const categoryIdArray = categoryIds.split(',').map(id => id.trim());
            const products = await this.productService.getProductsByMultipleCategories(categoryIdArray, limit);
            return {
                message: "Products by multiple categories retrieved successfully",
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve products by multiple categories",
                error: error.message
            };
        }
    }

    // Thêm endpoint để lấy sản phẩm theo loại
    @Get("/type/:type")
    async getProductsByType(
        @Param("type") type: string,
        @QueryParam("limit") limit: number = 8
    ) {
        if (!['laptop', 'pc', 'accessories'].includes(type)) {
            return {
                message: "Invalid product type. Must be laptop, pc, or accessories"
            };
        }
        
        try {
            const products = await this.productService.getProductsByType(type as 'laptop' | 'pc' | 'accessories', limit);
            return {
                message: `Products by type '${type}' retrieved successfully`,
                products
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve products by type",
                error: error.message
            };
        }
    }

    // @Post("/add-products")
    // async addProducts() {
    //     return await this.productService.addProducts();
    // }
}

  

  // @Post("/add-components")
  // async addComponents() {
  //   return await this.productService.addToComponents();
  // }
