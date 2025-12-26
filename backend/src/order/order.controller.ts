import { Body, Controller, Get, Param, Patch, Post, Req, UseBefore, QueryParam, Delete } from "routing-controllers";
import { Service } from "typedi";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto, OrderStatus } from "./dtos/update-order.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.schema";
import { HttpException } from "@/exceptions/http-exceptions";
import { JwtService } from "@/jwt/jwt.service";
import { getRepository } from "typeorm";
import { Order } from "./order.entity";
import { Account } from "@/auth/account/account.entity";
import { Product } from "@/product/product.entity";
import { Invoice } from "@/payment/invoice.entity";
import { Feedback } from "@/feedback/feedback.entity";
import { ShipperProfile } from "@/auth/shipperProfile.entity";

@Service()
@Controller("/orders")
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        private readonly jwtService: JwtService
    ) {}

    @Post()
    async createOrder(
        @Req() req: any,
        @Body() createOrderDto: CreateOrderDto
    ) {
        try {
            let order;
            // Nếu là guest order thì không cần xác thực
            if (createOrderDto.isGuest) {
                order = await this.orderService.createGuestOrder(createOrderDto);
            } else {
                // User order: kiểm tra xác thực
                const authHeader = req.headers.authorization || req.header('Authorization');
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return {
                        success: false,
                        message: "Authentication required for user orders",
                        error: "No valid authorization header provided"
                    };
                }
                // Extract token and verify
                const token = authHeader.substring(7);
                const decodedToken = this.jwtService.verifyAccessToken(token);
                if (!decodedToken || !decodedToken.username) {
                    return {
                        success: false,
                        message: "Invalid authentication token",
                        error: "Token verification failed"
                    };
                }
                order = await this.orderService.createOrder(decodedToken.username, createOrderDto);
            }
            // Trả về order object đầy đủ
            return {
                success: true,
                message: createOrderDto.isGuest ? "Guest order created successfully" : "Order created successfully",
                data: order
            };
        } catch (error: any) {
            console.error('[Error] Order Creation Failed:', error.message);
            return {
                success: false,
                message: "Order creation failed",
                error: error.message
            };
        }
    }

    @Get()
    @UseBefore(Auth)
    async getOrders(
        @Req() req: any,
        @QueryParam("page") page: number = 1,
        @QueryParam("limit") limit: number = 1000 // Đặt limit rất cao để lấy tất cả đơn hàng
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const orders = await this.orderService.getOrdersByUsername(
                user.username, 
                page, 
                limit
            );
            return {
                message: "Orders retrieved successfully",
                data: orders.orders,
                pagination: {
                    page,
                    limit,
                    total: orders.total,
                    totalPages: Math.ceil(orders.total / limit)
                }
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve orders",
                error: error.message
            };
        }
    }

    @Get("/statistics")
    @UseBefore(Auth)
    async getStatistics(@Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            const statistics = await this.orderService.getOrderStatistics(user.username);
            return {
                message: "Order statistics retrieved successfully",
                statistics
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve order statistics",
                error: error.message
            };
        }
    }

    /**
     * Get orders list for admin/staff/shipper with filter, search, sort, paging
     * GET /orders/admin?status=...&search=...&sort=...&page=...&limit=...
     */
    @Get("/admin")
    @UseBefore(Auth)
    async getAllOrdersForAdmin(
        @Req() req: any,
        @QueryParam("status") status: string,
        @QueryParam("search") search: string,
        @QueryParam("sort") sort: string,
        @QueryParam("page") page: number = 1,
        @QueryParam("limit") limit: number = 10,
        @QueryParam("shipper") shipper: string,
        @QueryParam("assigned") assigned: boolean,
        @QueryParam("unassigned") unassigned: boolean
    ) {
        const user = req.user as AccountDetailsDto;
        
        // Only allow admin, manager, staff, shipper
        if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user) && !this.isShipper(user)) {
            throw new HttpException(401, "Access denied to orders list");
        }
        
        try {
            const result = await this.orderService.getAllOrdersWithFilter({ status, search, sort, page, limit, shipper, assigned, unassigned });
            return {
                message: "Orders retrieved successfully",
                data: result.orders,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve orders",
                error: error.message
            };
        }
    }

    @Get("/:id")
    @UseBefore(Auth)
    async getOrder(@Param("id") id: string, @Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            const order = await this.orderService.getOrderById(id);
            
            // Check permission to view order
            // For guest orders, customer will be null - only admin/staff can view
            const isOwner = order.customer ? order.customer.username === user.username : false;
            const hasAdminAccess = this.isAdmin(user) || this.isStaff(user);
            
            if (!isOwner && !hasAdminAccess) {
                throw new HttpException(401, "Access denied to view this order");
            }
            
            return {
                message: "Order retrieved successfully",
                order
            };
        } catch (error: any) {
            return {
                message: "Failed to retrieve order",
                error: error.message
            };
        }
    }

    @Patch("/:id/status")
    @UseBefore(Auth)
    async updateOrderStatus(
        @Param("id") id: string,
        @Body() updateOrderDto: UpdateOrderDto,
        @Req() req: any
    ) {
        const user = req.user as AccountDetailsDto;
        try {
            const order = await this.orderService.updateOrderStatus(
                id,
                user.username,
                updateOrderDto
            );
            return {
                message: "Order status updated successfully",
                order
            };
        } catch (error: any) {
            return {
                message: "Failed to update order status",
                error: error.message
            };
        }
    }

    /**
     * Delete order (admin or staff only)
     * DELETE /orders/:id
     */
    @Delete(":id")
    @UseBefore(Auth)
    async deleteOrder(@Param("id") id: string, @Req() req: any) {
        const user = req.user as AccountDetailsDto;
        if (!this.isAdmin(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to delete order");
        }
        try {
            await this.orderService.deleteOrderById(id);
            return {
                message: "Order deleted successfully"
            };
        } catch (error: any) {
            return {
                message: "Failed to delete order",
                error: error.message
            };
        }
    }
    
    /**
     * Khách hàng xác nhận đã nhận hàng thành công
     * POST /orders/:id/confirm-delivery
     */
    @Post(":id/confirm-delivery")
    @UseBefore(Auth)
    async confirmOrderDelivery(@Param("id") id: string, @Req() req: any) {
        const user = req.user as AccountDetailsDto;
        try {
            // Tạo update dto với trạng thái DELIVERED
            const updateOrderDto: UpdateOrderDto = {
                status: OrderStatus.DELIVERED
            };
            
            const order = await this.orderService.updateOrderStatus(
                id,
                user.username,
                updateOrderDto
            );
            
            return {
                message: "Order delivery confirmed successfully",
                order
            };
        } catch (error: any) {
            return {
                message: "Failed to confirm order delivery",
                error: error.message
            };
        }
    }

    /**
     * Get order analytics - trends and statistics over time
     * GET /api/orders/analytics/trends?startDate=...&endDate=...&period=month
     */
    @Get("/analytics/trends")
    @UseBefore(Auth)
    async getOrderAnalytics(
        @Req() req: any,
        @QueryParam("startDate") startDateStr: string,
        @QueryParam("endDate") endDateStr: string,
        @QueryParam("period") period: 'day' | 'month' | 'year' = 'month'
    ) {
        const user = req.user as AccountDetailsDto;

        // Only allow admin, manager, staff
        if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to order analytics");
        }

        try {
            if (!startDateStr || !endDateStr) {
                return {
                    success: false,
                    message: "startDate and endDate are required"
                };
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return {
                    success: false,
                    message: "Invalid date format"
                };
            }

            const analytics = await this.generateOrderAnalytics(startDate, endDate, period);

            return {
                success: true,
                message: "Order analytics retrieved successfully",
                data: analytics
            };
        } catch (error: any) {
            console.error("Error getting order analytics:", error);
            return {
                success: false,
                message: "Failed to retrieve order analytics",
                error: error.message
            };
        }
    }

    /**
     * Get order status distribution over time
     * GET /api/orders/analytics/status-trends?startDate=...&endDate=...
     */
    @Get("/analytics/status-trends")
    @UseBefore(Auth)
    async getOrderStatusTrends(
        @Req() req: any,
        @QueryParam("startDate") startDateStr: string,
        @QueryParam("endDate") endDateStr: string
    ) {
        const user = req.user as AccountDetailsDto;

        // Only allow admin, manager, staff
        if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to order status trends");
        }

        try {
            if (!startDateStr || !endDateStr) {
                return {
                    success: false,
                    message: "startDate and endDate are required"
                };
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            const trends = await this.generateOrderStatusTrends(startDate, endDate);

            return {
                success: true,
                message: "Order status trends retrieved successfully",
                data: trends
            };
        } catch (error: any) {
            console.error("Error getting order status trends:", error);
            return {
                success: false,
                message: "Failed to retrieve order status trends",
                error: error.message
            };
        }
    }

    /**
     * Get comprehensive dashboard statistics
     * GET /orders/dashboard/stats
     */
    @Get("/dashboard/stats")
    @UseBefore(Auth)
    async getDashboardStats(@Req() req: any) {
        const user = req.user as AccountDetailsDto;

        // Only allow admin, manager, staff
        if (!this.isAdmin(user) && !this.isManager(user) && !this.isStaff(user)) {
            throw new HttpException(401, "Access denied to dashboard statistics");
        }

        try {
            const [
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                totalShippers,
                totalFeedbacks,
                recentOrders,
                topProducts,
                orderStatusDistribution,
                monthlyRevenue
            ] = await Promise.all([
                this.getTotalRevenue(),
                this.getTotalOrders(),
                this.getTotalCustomers(),
                this.getTotalProducts(),
                this.getTotalShippers(),
                this.getTotalFeedbacks(),
                this.getRecentOrders(),
                this.getTopSellingProducts(),
                this.getOrderStatusDistribution(),
                this.getMonthlyRevenue()
            ]);

            return {
                success: true,
                message: "Dashboard statistics retrieved successfully",
                data: {
                    totalRevenue,
                    totalOrders,
                    totalCustomers,
                    totalProducts,
                    totalShippers,
                    totalFeedbacks,
                    recentOrders,
                    topProducts,
                    orderStatusDistribution,
                    monthlyRevenue,
                },
            };
        } catch (error: any) {
            console.error("Error getting dashboard stats:", error);
            return {
                success: false,
                message: "Failed to retrieve dashboard statistics",
                error: error.message,
            };
        }
    }

    // Helper method to check admin role
    private isAdmin(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('admin') || false;
    }

    // Helper method to check staff role
    private isStaff(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('staff') || false;
    }

    // Helper method to check shipper role
    private isShipper(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('shipper') || false;
    }

    // Helper method to check manager role
    private isManager(user: AccountDetailsDto): boolean {
        return user.role?.name?.toLowerCase().includes('manager') || false;
    }

    // Dashboard statistics helper methods
    private async getTotalRevenue(): Promise<number> {
        const result = await getRepository(Invoice)
            .createQueryBuilder("invoice")
            .select("SUM(invoice.totalAmount)", "total")
            .where("invoice.status = :status", { status: "paid" })
            .getRawOne();
        return result?.total || 0;
    }

    private async getTotalOrders(): Promise<number> {
        return await getRepository(Order).count();
    }

    private async getTotalCustomers(): Promise<number> {
        return await getRepository(Account)
            .createQueryBuilder("account")
            .leftJoin("account.roles", "role")
            .where("role.name = :roleName", { roleName: "customer" })
            .getCount();
    }

    private async getTotalProducts(): Promise<number> {
        return await getRepository(Product).count();
    }

    private async getTotalShippers(): Promise<number> {
        return await getRepository(ShipperProfile).count();
    }

    private async getTotalFeedbacks(): Promise<number> {
        return await getRepository(Feedback).count();
    }

    private async getRecentOrders(): Promise<any[]> {
        const orders = await getRepository(Order)
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.customer", "customer")
            .leftJoinAndSelect("order.orderDetails", "orderDetails")
            .leftJoinAndSelect("orderDetails.product", "product")
            .orderBy("order.createdAt", "DESC")
            .limit(5)
            .getMany();

    return orders.map(order => ({
      id: order.id,
      orderNumber: `ORD-${order.id}`,
      customerName: order.customer?.name || 'Guest',
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      itemsCount: order.orderDetails?.length || 0,
    }));
    }

    private async getTopSellingProducts(): Promise<any[]> {
        const result = await getRepository(Order)
            .createQueryBuilder("order")
            .leftJoin("order.orderDetails", "orderDetails")
            .leftJoin("orderDetails.product", "product")
            .select([
                "product.id as id",
                "product.name as name",
                "product.price as price",
                "SUM(orderDetails.quantity) as totalSold",
                "SUM(orderDetails.quantity * orderDetails.price) as totalRevenue",
            ])
            .where("order.status != :status", { status: "cancelled" })
            .groupBy("product.id")
            .orderBy("totalSold", "DESC")
            .limit(5)
            .getRawMany();

        return result.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            totalSold: parseInt(product.totalSold) || 0,
            totalRevenue: parseFloat(product.totalRevenue) || 0,
        }));
    }

    private async getOrderStatusDistribution(): Promise<{ [key: string]: number }> {
        const result = await getRepository(Order)
            .createQueryBuilder("order")
            .select("order.status", "status")
            .addSelect("COUNT(*)", "count")
            .groupBy("order.status")
            .getRawMany();

        const distribution: { [key: string]: number } = {};
        result.forEach(row => {
            distribution[row.status] = parseInt(row.count);
        });
        return distribution;
    }

    private async getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const result = await getRepository(Invoice)
            .createQueryBuilder("invoice")
            .select([
                "DATE_FORMAT(invoice.createdAt, '%Y-%m') as month",
                "SUM(invoice.totalAmount) as revenue",
            ])
            .where("invoice.createdAt >= :sixMonthsAgo", { sixMonthsAgo })
            .andWhere("invoice.status = :status", { status: "paid" })
            .groupBy("DATE_FORMAT(invoice.createdAt, '%Y-%m')")
            .orderBy("month", "ASC")
            .getRawMany();

        return result.map(row => ({
            month: row.month,
            revenue: parseFloat(row.revenue) || 0,
        }));
    }

    // Analytics helper methods
    private async generateOrderAnalytics(
        startDate: Date,
        endDate: Date,
        period: 'day' | 'month' | 'year'
    ) {
        // Query orders trong khoảng thời gian
        const orders = await getRepository(Order)
            .createQueryBuilder("order")
            .where("order.createdAt BETWEEN :startDate AND :endDate", {
                startDate,
                endDate,
            })
            .orderBy("order.createdAt", "ASC")
            .getMany();

        // Tính tổng quan
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Nhóm dữ liệu theo period
        const groupedData = this.groupOrdersByPeriod(orders, period, startDate, endDate);

        return {
            period,
            summary: {
                totalOrders,
                totalRevenue,
                averageOrderValue,
            },
            data: groupedData,
        };
    }

    private groupOrdersByPeriod(
        orders: any[],
        period: 'day' | 'month' | 'year',
        startDate: Date,
        endDate: Date
    ): { date: string; orders: number; revenue: number; averageValue: number }[] {
        const grouped: { [key: string]: { orders: number; revenue: number } } = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key: string;

            if (period === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (period === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = date.getFullYear().toString();
            }

            if (!grouped[key]) {
                grouped[key] = { orders: 0, revenue: 0 };
            }

            grouped[key].orders += 1;
            grouped[key].revenue += order.totalAmount || 0;
        });

        // Generate all periods in range
        const result: { date: string; orders: number; revenue: number; averageValue: number }[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            let key: string;

            if (period === 'day') {
                key = current.toISOString().split('T')[0];
            } else if (period === 'month') {
                key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = current.getFullYear().toString();
            }

            const orders = grouped[key]?.orders || 0;
            const revenue = grouped[key]?.revenue || 0;
            const averageValue = orders > 0 ? revenue / orders : 0;

            result.push({
                date: key,
                orders,
                revenue,
                averageValue,
            });

            // Increment date
            if (period === 'day') {
                current.setDate(current.getDate() + 1);
            } else if (period === 'month') {
                current.setMonth(current.getMonth() + 1);
            } else {
                current.setFullYear(current.getFullYear() + 1);
            }
        }

        return result;
    }

    private async generateOrderStatusTrends(
        startDate: Date,
        endDate: Date
    ): Promise<{ date: string; pending: number; confirmed: number; processing: number; shipped: number; delivered: number; cancelled: number }[]> {
        // Query orders theo ngày và status
        const result = await getRepository(Order)
            .createQueryBuilder("order")
            .select([
                "DATE(order.createdAt) as date",
                "order.status as status",
                "COUNT(*) as count"
            ])
            .where("order.createdAt BETWEEN :startDate AND :endDate", {
                startDate,
                endDate,
            })
            .groupBy("DATE(order.createdAt)")
            .addGroupBy("order.status")
            .orderBy("date", "ASC")
            .getRawMany();

        // Group by date
        const groupedByDate: { [key: string]: { [status: string]: number } } = {};

        result.forEach(row => {
            const date = row.date;
            const status = row.status;
            const count = parseInt(row.count);

            if (!groupedByDate[date]) {
                groupedByDate[date] = {
                    pending: 0,
                    confirmed: 0,
                    processing: 0,
                    shipped: 0,
                    delivered: 0,
                    cancelled: 0,
                };
            }

            groupedByDate[date][status] = count;
        });

        // Convert to array format
        const trends: { date: string; pending: number; confirmed: number; processing: number; shipped: number; delivered: number; cancelled: number }[] = [];

        Object.keys(groupedByDate).sort().forEach(date => {
          trends.push({
            date,
            pending: groupedByDate[date].pending || 0,
            confirmed: groupedByDate[date].confirmed || 0,
            processing: groupedByDate[date].processing || 0,
            shipped: groupedByDate[date].shipped || 0,
            delivered: groupedByDate[date].delivered || 0,
            cancelled: groupedByDate[date].cancelled || 0,
          });
        });

        return trends;
    }
} 