import { Body, Controller, Get, Param, Patch, Post, Req, UseBefore, QueryParam, Delete } from "routing-controllers";
import { Service } from "typedi";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto, OrderStatus } from "./dtos/update-order.dto";
import { Auth } from "@/middlewares/auth.middleware";
import { AccountDetailsDto } from "@/auth/dtos/account.dto";
import { HttpException } from "@/exceptions/http-exceptions";
import { JwtService } from "@/auth/jwt/jwt.service";

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
} 