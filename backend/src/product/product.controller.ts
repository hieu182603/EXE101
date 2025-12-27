import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam, Req, UseBefore } from "routing-controllers";
import { getRepository } from "typeorm";
import { Service } from "typedi";
import { ProductService } from "./product.service";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { Product } from "./product.entity";
import { DbConnection } from "@/database/dbConnection";
import { Order } from "@/order/order.entity";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";
import { HttpException } from "@/exceptions/http-exceptions";

@Service()
@Controller("/products")
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) { }

    @Get("/")
    async getAllProducts() {
        try {
            const products = await this.productService.getAllProducts();
            return {
                success: true,
                message: "Products retrieved successfully",
                data: products
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to retrieve products");
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
            throw new HttpException(500, error?.message || "Failed to retrieve all products");
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
            throw new HttpException(500, error?.message || "Failed to retrieve all products for admin");
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
            throw new HttpException(500, error?.message || "Failed to retrieve out of stock products");
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
            throw new HttpException(500, error?.message || "Failed to retrieve new products");
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
            throw new HttpException(500, error?.message || "Failed to retrieve top selling products");
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
            throw new HttpException(500, error?.message || "Failed to retrieve products by category");
        }
    }

    @Get("/category-name/:categoryName")
    async getProductsByCategoryName(
        @Param("categoryName") categoryName: string,
        @QueryParam("limit") limit?: number
    ) {
        try {
            const safeLimit = limit && !isNaN(Number(limit)) ? Number(limit) : undefined;
            const products = await this.productService.getProductsByCategoryName(
                categoryName,
                safeLimit
            );
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
            throw new HttpException(400, "Missing search keyword");
        }
        try {
            const products = await this.productService.searchProducts(keyword);
            return {
                message: "Products search result",
                products
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to search products");
        }
    }

    @Get("/:id")
    async getProductById(@Param("id") id: string) {
        try {
            const product = await this.productService.getProductById(id);
            if (!product) {
                throw new HttpException(404, "Product not found");
            }
            return {
                message: "Product retrieved successfully",
                product
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to retrieve product");
        }
    }

    @Get("/name/:name")
    async getProductByName(@Param("name") name: string) {
        try {
            const product = await this.productService.getProductByName(name);
            if (!product) {
                throw new HttpException(404, "Product not found");
            }
            return {
                message: "Product retrieved successfully",
                product
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to retrieve product");
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
            throw new HttpException(500, error?.message || "Failed to create product");
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
                throw new HttpException(404, "Product not found");
            }
            return {
                message: "Product updated successfully",
                product
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to update product");
        }
    }

    @Delete("/:id")
    async deleteProduct(@Param("id") id: string) {
        try {
            const result = await this.productService.deleteProduct(id);
            if (!result) {
                throw new HttpException(404, "Product not found");
            }
            return {
                message: "Product deleted successfully"
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to delete product");
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
            throw new HttpException(400, "Missing category IDs");
        }

        try {
            const categoryIdArray = categoryIds.split(',').map(id => id.trim());
            const products = await this.productService.getProductsByMultipleCategories(categoryIdArray, limit);
            return {
                message: "Products by multiple categories retrieved successfully",
                products
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to retrieve products by multiple categories");
        }
    }

    // Thêm endpoint để lấy sản phẩm theo loại
    @Get("/type/:type")
    async getProductsByType(
        @Param("type") type: string,
        @QueryParam("limit") limit: number = 8
    ) {
        if (!['laptop', 'pc', 'accessories'].includes(type)) {
            throw new HttpException(400, "Invalid product type. Must be laptop, pc, or accessories");
        }

        try {
            const products = await this.productService.getProductsByType(type as 'laptop' | 'pc' | 'accessories', limit);
            return {
                message: `Products by type '${type}' retrieved successfully`,
                products
            };
        } catch (error: any) {
            throw new HttpException(500, error?.message || "Failed to retrieve products by type");
        }
    }

    /**
     * Get product performance analytics
     * GET /api/products/analytics/performance?startDate=...&endDate=...&limit=10
     */
    @Get("/analytics/performance")
    @UseBefore(Auth)
    async getProductPerformanceAnalytics(
        @Req() req: any,
        @QueryParam("startDate") startDateStr: string,
        @QueryParam("endDate") endDateStr: string,
        @QueryParam("limit") limit: number = 10
    ) {
        const user = req.user as AccountDetailsDto;

        // Only allow admin, manager, staff
        if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to product analytics");
        }

        try {
            if (!startDateStr || !endDateStr) {
                throw new HttpException(400, "startDate and endDate are required");
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new HttpException(400, "Invalid date format");
            }

            const analytics = await this.generateProductPerformanceAnalytics(startDate, endDate, limit);

            return {
                success: true,
                message: "Product performance analytics retrieved successfully",
                data: analytics
            };
        } catch (error: any) {
            console.error("Error getting product performance analytics:", error);
            throw new HttpException(500, error?.message || "Failed to retrieve product performance analytics");
        }
    }

    /**
     * Get product sales trends over time
     * GET /api/products/analytics/sales-trends?startDate=...&endDate=...&period=month
     */
    @Get("/analytics/sales-trends")
    @UseBefore(Auth)
    async getProductSalesTrends(
        @Req() req: any,
        @QueryParam("startDate") startDateStr: string,
        @QueryParam("endDate") endDateStr: string,
        @QueryParam("period") period: 'day' | 'month' | 'year' = 'month'
    ) {
        const user = req.user as AccountDetailsDto;

        // Only allow admin, manager, staff
        if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to product sales trends");
        }

        try {
            if (!startDateStr || !endDateStr) {
                throw new HttpException(400, "startDate and endDate are required");
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new HttpException(400, "Invalid date format");
            }

            const trends = await this.generateProductSalesTrends(startDate, endDate, period);

            return {
                success: true,
                message: "Product sales trends retrieved successfully",
                data: trends
            };
        } catch (error: any) {
            console.error("Error getting product sales trends:", error);
            throw new HttpException(500, error?.message || "Failed to retrieve product sales trends");
        }
    }

    // Helper methods for analytics
    private isAdmin(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('admin') || false;
    }

    private isManager(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('manager') || false;
    }

    private isStaff(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('staff') || false;
    }

    private async generateProductPerformanceAnalytics(
        startDate: Date,
        endDate: Date,
        limit: number
    ): Promise<any[]> {
        // Query product performance based on order details
        const result = await getRepository(Order)
            .createQueryBuilder("order")
            .leftJoin("order.orderDetails", "orderDetails")
            .leftJoin("orderDetails.product", "product")
            .select([
                "product.id as productId",
                "product.name as productName",
                "product.price as productPrice",
                "product.stockQuantity as stockQuantity",
                "SUM(orderDetails.quantity) as totalSold",
                "SUM(orderDetails.quantity * orderDetails.price) as totalRevenue",
                "AVG(orderDetails.price) as averageSellingPrice",
                "COUNT(DISTINCT order.id) as orderCount"
            ])
            .where("order.createdAt BETWEEN :startDate AND :endDate", {
                startDate,
                endDate,
            })
            .andWhere("order.status != :status", { status: "cancelled" })
            .groupBy("product.id")
            .orderBy("totalSold", "DESC")
            .limit(limit)
            .getRawMany();

        return result.map((row: any) => ({
            productId: row.productId,
            productName: row.productName,
            productPrice: parseFloat(row.productPrice) || 0,
            stockQuantity: parseInt(row.stockQuantity) || 0,
            totalSold: parseInt(row.totalSold) || 0,
            totalRevenue: parseFloat(row.totalRevenue) || 0,
            averageSellingPrice: parseFloat(row.averageSellingPrice) || 0,
            orderCount: parseInt(row.orderCount) || 0,
            performanceScore: this.calculatePerformanceScore(row),
        }));
    }

    private async generateProductSalesTrends(
        startDate: Date,
        endDate: Date,
        period: 'day' | 'month' | 'year'
    ): Promise<{ date: string; totalSold: number; totalRevenue: number; ordersCount: number }[]> {
        // Query product sales trends
        let dateFormat: string;
        let groupBy: string;

        if (period === 'day') {
            dateFormat = "DATE(order.createdAt)";
            groupBy = "DATE(order.createdAt)";
        } else if (period === 'month') {
            dateFormat = "TO_CHAR(order.createdAt, 'YYYY-MM')";
            groupBy = "TO_CHAR(order.createdAt, 'YYYY-MM')";
        } else {
            dateFormat = "EXTRACT(YEAR FROM order.createdAt)";
            groupBy = "EXTRACT(YEAR FROM order.createdAt)";
        }

        const result = await getRepository(Order)
            .createQueryBuilder("order")
            .leftJoin("order.orderDetails", "orderDetails")
            .select([
                `${dateFormat} as date`,
                "SUM(orderDetails.quantity) as totalSold",
                "SUM(orderDetails.quantity * orderDetails.price) as totalRevenue",
                "COUNT(DISTINCT order.id) as ordersCount"
            ])
            .where("order.createdAt BETWEEN :startDate AND :endDate", {
                startDate,
                endDate,
            })
            .andWhere("order.status != :status", { status: "cancelled" })
            .groupBy(groupBy)
            .orderBy("date", "ASC")
            .getRawMany();

        return result.map((row: any) => ({
            date: row.date,
            totalSold: parseInt(row.totalSold) || 0,
            totalRevenue: parseFloat(row.totalRevenue) || 0,
            ordersCount: parseInt(row.ordersCount) || 0,
        }));
    }

    private calculatePerformanceScore(row: any): number {
        const totalSold = parseInt(row.totalSold) || 0;
        const totalRevenue = parseFloat(row.totalRevenue) || 0;
        const orderCount = parseInt(row.orderCount) || 0;

        // Simple performance score calculation
        // Weight: 40% sales volume, 40% revenue, 20% order frequency
        const salesScore = Math.min(totalSold / 100, 1) * 40; // Max score for 100+ units
        const revenueScore = Math.min(totalRevenue / 10000, 1) * 40; // Max score for $10k+ revenue
        const orderScore = Math.min(orderCount / 10, 1) * 20; // Max score for 10+ orders

        return Math.round(salesScore + revenueScore + orderScore);
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
