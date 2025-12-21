import { Service, Container } from 'typedi';
import { Order } from './order.entity';
import { OrderDetail } from './orderDetail.entity';
import { CartService } from '@/Cart/cart.service';
import { Product } from '@/product/product.entity';
import { Account } from '@/auth/account/account.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderStatus, UpdateOrderDto } from './dtos/update-order.dto';
import { EntityNotFoundException } from '@/exceptions/http-exceptions';
import { DbConnection } from '@/database/dbConnection';
import { Cart } from '@/Cart/cart.entity';
import { InvoiceService } from '@/payment/invoice.service';
import { Invoice, InvoiceStatus } from '@/payment/invoice.entity';

// Định nghĩa type cho filter options để dùng lại và đồng bộ controller-service
export interface OrderFilterOptions {
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
    shipper?: string;
    assigned?: boolean;
    unassigned?: boolean;
}

@Service()
export class OrderService {
    constructor(
        private readonly cartService: CartService,
        private readonly invoiceService: InvoiceService
    ) {}

    private validateOrderStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED, OrderStatus.EXTERNAL],
            [OrderStatus.ASSIGNED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
            [OrderStatus.DELIVERED]: [], 
            [OrderStatus.CANCELLED]: [], 
            [OrderStatus.EXTERNAL]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED]
        };

        // Check if the status transition is valid
        const allowedTransitions = validTransitions[currentStatus] || [];
        const isValidTransition = allowedTransitions.includes(newStatus);
        
        if (!isValidTransition) {
            console.warn(`[Warning] Invalid status transition attempted: ${currentStatus} -> ${newStatus}`);
        }
        
        return isValidTransition;
    }

    private isAdmin(account: Account): boolean {
        return account.role?.name?.toLowerCase().includes('admin') || false;
    }

    private isShipper(account: Account): boolean {
        return account.role?.name?.toLowerCase().includes('shipper') || false;
    }

    async createOrder(username: string, createOrderDto: CreateOrderDto): Promise<Order> {
        if (!createOrderDto.shippingAddress) {
            throw new Error('Shipping address cannot be empty');
        }

        const shippingAddress = createOrderDto.shippingAddress.trim();
        if (!shippingAddress) {
            throw new Error('Shipping address cannot be empty');
        }

        const savedOrder = await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            // Step 1: Get account and check existence
            const account = await transactionalEntityManager.findOne(Account, { 
                where: { username },
                relations: ['role']
            });
            
            if (!account) {
                throw new EntityNotFoundException('Account');
            }

            // Step 2: Get cart WITHIN transaction
            const cart = await transactionalEntityManager.findOne(Cart, {
                where: { account: { id: account.id } },
                relations: ['cartItems', 'cartItems.product', 'cartItems.product.category', 'account']
            });

            if (!cart) {
                throw new EntityNotFoundException('Cart');
            }
            
            // Step 3: Check cart is not empty
            if (!cart.cartItems || cart.cartItems.length === 0) {
                throw new Error('Cart is empty. Please add products before placing order.');
            }

            // Step 4: Validate each product in cart
            const invalidItems = [];
            
            for (const cartItem of cart.cartItems) {
                if (!cartItem.product.isActive) {
                    invalidItems.push(`${cartItem.product.name} (no longer active)`);
                }
                if (cartItem.product.stock < cartItem.quantity) {
                    invalidItems.push(`${cartItem.product.name} (insufficient stock: available ${cartItem.product.stock}, needed ${cartItem.quantity})`);
                }
            }

            if (invalidItems.length > 0) {
                throw new Error(`Some products in cart are invalid: ${invalidItems.join(', ')}`);
            }

            // Step 5: Validate product prices and lock products
            const productIds = cart.cartItems.map(item => item.product.id);
            const products = await transactionalEntityManager
                .createQueryBuilder(Product, 'product')
                .setLock('pessimistic_write')
                .where('product.id IN (:...ids)', { ids: productIds })
                .getMany();

            const priceChanges = [];
            const stockIssues = [];

            for (const cartItem of cart.cartItems) {
                const latestProduct = products.find(p => p.id === cartItem.product.id);
                if (!latestProduct) {
                    throw new Error(`Product ${cartItem.product.name} does not exist`);
                }
                
                // Check price changes
                if (latestProduct.price !== cartItem.product.price) {
                    priceChanges.push({
                        name: latestProduct.name,
                        oldPrice: cartItem.product.price,
                        newPrice: latestProduct.price
                    });
                }
                
                // Check stock
                if (!latestProduct.isActive) {
                    stockIssues.push(`${latestProduct.name} (product no longer active)`);
                } else if (latestProduct.stock < cartItem.quantity) {
                    stockIssues.push(`${latestProduct.name} (insufficient stock: available ${latestProduct.stock}, needed ${cartItem.quantity})`);
                }
            }

            if (priceChanges.length > 0) {
                const changeDetails = priceChanges.map(change => 
                    `${change.name}: ${change.oldPrice} → ${change.newPrice}`
                ).join(', ');
                throw new Error(`Product prices have changed, please review cart: ${changeDetails}`);
            }

            if (stockIssues.length > 0) {
                throw new Error(`Some products have stock issues: ${stockIssues.join(', ')}`);
            }

            // Step 6: Create order entity
            const currentDateTime = new Date(); // Use single timestamp for consistency
            const order = new Order();
            order.customer = cart.account;
            order.orderDate = currentDateTime;
            order.status = OrderStatus.PENDING;
            order.totalAmount = cart.totalAmount;
            order.shippingAddress = createOrderDto.shippingAddress || '';
            order.note = createOrderDto.note || '';
            order.paymentMethod = createOrderDto.paymentMethod || 'Not selected';
            order.requireInvoice = createOrderDto.requireInvoice || false;
            
            await transactionalEntityManager.save(order);

            // Step 7: Create order details and update stock
            let orderDetailCount = 0;
            
            for (const cartItem of cart.cartItems) {
                const product = products.find(p => p.id === cartItem.product.id)!;

                const orderDetail = new OrderDetail();
                orderDetail.order = order;
                orderDetail.product = product;
                orderDetail.quantity = cartItem.quantity;
                orderDetail.price = product.price;
                await transactionalEntityManager.save(orderDetail);

                orderDetailCount++;

                // Update stock
                const oldStock = product.stock;
                if(product.name?.toLowerCase() !== "build"){
                    product.stock -= cartItem.quantity;
                }
                await transactionalEntityManager.save(product);
            }

            // Step 8: Clear cart WITHIN transaction
            if (cart.cartItems && cart.cartItems.length > 0) {
                await transactionalEntityManager.remove(cart.cartItems);
            }
            cart.totalAmount = 0;
            await transactionalEntityManager.save(cart);

            // Step 9: Create Invoice WITHIN the same transaction
            try {
                const invoice = new Invoice();
                invoice.order = order;
                
                const invoiceNumber = `INV${currentDateTime.getFullYear()}${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}${currentDateTime.getDate().toString().padStart(2, '0')}${currentDateTime.getTime().toString().slice(-6)}`;
                invoice.invoiceNumber = invoiceNumber;
                invoice.totalAmount = order.totalAmount;
                invoice.paymentMethod = createOrderDto.paymentMethod || 'COD';
                invoice.status = InvoiceStatus.UNPAID;
                invoice.notes = `Invoice created for order ${order.id}`;
                
                const savedInvoice = await transactionalEntityManager.save(invoice);
                
            } catch (invoiceError) {
                throw new Error(`Failed to create invoice for order ${order.id}: ${(invoiceError as Error).message}`);
            }

            // Step 10: Return order with relations
            const savedOrder = await transactionalEntityManager.findOne(Order, {
                where: { id: order.id },
                relations: [
                    'customer', 
                    'customer.role',
                    'orderDetails', 
                    'orderDetails.product',
                    'orderDetails.product.category',
                    'orderDetails.product.images',
                    'invoices'
                ]
            });

            if (!savedOrder) {
                throw new Error('Failed to retrieve created order');
            }

            return savedOrder;
        });

        // Step 11: Auto-assign order to shipper (AFTER main transaction completes)
        // Run in separate transaction to avoid circular dependency but ensure atomicity
        try {
            const { OrderAssignmentService } = await import('@/shipper/orderAssignment.service');
            const orderAssignmentService = Container.get(OrderAssignmentService);
            
            const assignmentResult = await orderAssignmentService.assignOrderToShipper(savedOrder);
            
            if (assignmentResult.success) {
                await this.markOrderForManualAssignmentSafe(savedOrder.id, assignmentResult.message);
            } else {
                await this.markOrderForManualAssignmentSafe(savedOrder.id, assignmentResult.message);
            }
        } catch (assignmentError) {
            await this.markOrderForManualAssignmentSafe(savedOrder.id, 'Auto-assignment service error');
        }
        
        // Return the created order (shipper assignment happens asynchronously)
        return savedOrder;
    }

    async createGuestOrder(createOrderDto: CreateOrderDto): Promise<Order> {
        if (!createOrderDto.shippingAddress) {
            throw new Error('Shipping address cannot be empty');
        }

        if (!createOrderDto.guestInfo) {
            throw new Error('Guest information is required');
        }

        // Validate guest info
        const { fullName, phone, email } = createOrderDto.guestInfo;
        if (!fullName?.trim() || fullName.trim().length > 100) {
            throw new Error('Invalid guest name: must be 1-100 characters');
        }
        
        if (!phone?.trim() || !/^[0-9]{10,11}$/.test(phone.trim())) {
            throw new Error('Invalid guest phone: must be 10-11 digits');
        }
        
        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new Error('Invalid guest email format');
        }

        if (!createOrderDto.guestCartItems || createOrderDto.guestCartItems.length === 0) {
            throw new Error('Cart items are required');
        }
        
        if (createOrderDto.guestCartItems.length > 50) {
            throw new Error('Too many items in cart. Maximum 50 items allowed');
        }

        const shippingAddress = createOrderDto.shippingAddress.trim();
        if (!shippingAddress) {
            throw new Error('Shipping address cannot be empty');
        }

        const savedOrder = await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            // Step 1: Validate products and check stock
            const productIds = createOrderDto.guestCartItems!.map(item => item.productId);
            const products = await transactionalEntityManager
                .createQueryBuilder(Product, 'product')
                .setLock('pessimistic_write')
                .where('product.id IN (:...ids)', { ids: productIds })
                .getMany();

            const stockIssues = [];
            const priceIssues = [];
            
            for (const cartItem of createOrderDto.guestCartItems!) {
                // Validate cart item
                if (!cartItem.quantity || cartItem.quantity <= 0) {
                    throw new Error(`Invalid quantity for product ${cartItem.name}: ${cartItem.quantity}`);
                }
                
                if (!cartItem.price || cartItem.price < 0) {
                    throw new Error(`Invalid price for product ${cartItem.name}: ${cartItem.price}`);
                }
                
                const product = products.find(p => p.id === cartItem.productId);
                if (!product) {
                    throw new Error(`Product ${cartItem.name} does not exist`);
                }
                
                // Security: Validate price từ frontend với database
                if (Math.abs(product.price - cartItem.price) > 0.01) {
                    priceIssues.push(`${product.name} (price changed: frontend ${cartItem.price}, actual ${product.price})`);
                }
                
                if (!product.isActive) {
                    stockIssues.push(`${product.name} (product no longer active)`);
                } else if (product.stock < cartItem.quantity) {
                    stockIssues.push(`${product.name} (insufficient stock: available ${product.stock}, needed ${cartItem.quantity})`);
                }
            }
            
            if (priceIssues.length > 0) {
                throw new Error(`Product prices have changed, please refresh cart: ${priceIssues.join(', ')}`);
            }

            if (stockIssues.length > 0) {
                throw new Error(`Some products have stock issues: ${stockIssues.join(', ')}`);
            }

            // Step 2: Calculate total amount using actual database prices (security)
            const totalAmount = createOrderDto.guestCartItems!.reduce((total, item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    throw new Error(`Product ${item.name} not found for total calculation`);
                }
                return total + (product.price * item.quantity);
            }, 0);
            
            // Validate total amount
            if (totalAmount < 0) {
                throw new Error('Invalid total amount calculated');
            }

            // Step 3: Create order entity
            const currentDateTime = new Date();
            const order = new Order();
            order.customer = null; // Guest order - no customer
            order.orderDate = currentDateTime;
            order.status = OrderStatus.PENDING;
            order.totalAmount = totalAmount;
            order.shippingAddress = shippingAddress;
            order.note = createOrderDto.note || '';
            order.paymentMethod = createOrderDto.paymentMethod || 'Not selected';
            order.requireInvoice = createOrderDto.requireInvoice || false;
            
            await transactionalEntityManager.save(order);

            // Step 4: Create order details and update stock
            for (const cartItem of createOrderDto.guestCartItems!) {
                const product = products.find(p => p.id === cartItem.productId)!;

                const orderDetail = new OrderDetail();
                orderDetail.order = order;
                orderDetail.product = product;
                orderDetail.quantity = cartItem.quantity;
                orderDetail.price = product.price; 
                await transactionalEntityManager.save(orderDetail);

                // Update stock
                product.stock -= cartItem.quantity;
                await transactionalEntityManager.save(product);
            }

            // Step 5: Create Invoice
            try {
                const invoice = new Invoice();
                invoice.order = order;
                
                const invoiceNumber = `INV${currentDateTime.getFullYear()}${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}${currentDateTime.getDate().toString().padStart(2, '0')}${currentDateTime.getTime().toString().slice(-6)}`;
                invoice.invoiceNumber = invoiceNumber;
                invoice.totalAmount = order.totalAmount;
                invoice.paymentMethod = createOrderDto.paymentMethod || 'COD';
                invoice.status = InvoiceStatus.UNPAID;
                invoice.notes = `Guest order invoice - ${createOrderDto.guestInfo!.fullName} (${createOrderDto.guestInfo!.phone})`;
                
                const savedInvoice = await transactionalEntityManager.save(invoice);
                
            } catch (invoiceError) {
                throw new Error(`Failed to create guest invoice for order ${order.id}: ${(invoiceError as Error).message}`);
            }

            // Step 6: Return order with relations
            const savedOrder = await transactionalEntityManager.findOne(Order, {
                where: { id: order.id },
                relations: [
                    'orderDetails', 
                    'orderDetails.product',
                    'orderDetails.product.category',
                    'orderDetails.product.images',
                    'invoices'
                ]
            });

            if (!savedOrder) {
                throw new Error('Failed to retrieve created guest order');
            }

            return savedOrder;
        });

        // Step 7: Auto-assign guest order to shipper (AFTER main transaction completes)
        try {
            
            const { OrderAssignmentService } = await import('@/shipper/orderAssignment.service');
            
            const orderAssignmentService = Container.get(OrderAssignmentService);
            
            const assignmentResult = await orderAssignmentService.assignOrderToShipper(savedOrder);
            
            if (assignmentResult.success) {
                await this.markOrderForManualAssignmentSafe(savedOrder.id, assignmentResult.message);
            } else {
                await this.markOrderForManualAssignmentSafe(savedOrder.id, assignmentResult.message);
            }
        } catch (assignmentError) {
            await this.markOrderForManualAssignmentSafe(savedOrder.id, 'Auto-assignment service error');
        }
        
        return savedOrder;
    }

    async getOrderById(orderId: string): Promise<Order> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: [
                'customer',
                'customer.role',
                'shipper',
                'orderDetails',
                'orderDetails.product',
                'orderDetails.product.category',
                'orderDetails.product.images'
            ]
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        return order;
    }

    async getOrdersByUsername(
        username: string,
        page: number = 1,
        limit: number = 10000 // Đặt limit rất cao để lấy tất cả đơn hàng
    ): Promise<{ orders: Order[]; total: number }> {
        const offset = (page - 1) * limit;
        
        const [orders, total] = await Order.findAndCount({
            where: { customer: { username } },
            relations: [
                'customer',
                'customer.role',
                'orderDetails',
                'orderDetails.product',
                'orderDetails.product.category',
                'orderDetails.product.images'
            ],
            order: { orderDate: 'DESC' },
            skip: offset,
            take: limit
        });

        return { orders, total };
    }

    async updateOrderStatus(
        orderId: string,
        username: string,
        updateOrderDto: UpdateOrderDto
    ): Promise<Order> {
        const account = await Account.findOne({ 
            where: { username },
            relations: ['role']
        });
        
        if (!account) {
            throw new EntityNotFoundException('Account');
        }

        const order = await Order.findOne({
            where: { id: orderId },
            relations: ['customer', 'customer.role', 'orderDetails', 'orderDetails.product']
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        // Check permissions
        const isOrderOwner = order.customer ? order.customer.username === username : false;
        const hasAdminAccess = this.isAdmin(account) || this.isShipper(account);

        if (!isOrderOwner && !hasAdminAccess) {
            throw new Error('Access denied to update this order');
        }

        // Validate status transition
        if (!this.validateOrderStatusTransition(order.status, updateOrderDto.status)) {
            throw new Error(`Invalid status transition from ${order.status} to ${updateOrderDto.status}`);
        }

        // Handle stock restoration for cancelled orders
        const oldStatus = order.status;
        const newStatus = updateOrderDto.status;
        
        await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            // If order is being cancelled, restore product stock
            if (newStatus === OrderStatus.CANCELLED && 
                [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.EXTERNAL].includes(oldStatus)) {
                
                for (const orderDetail of order.orderDetails) {
                    const product = await transactionalEntityManager.findOne(Product, {
                        where: { id: orderDetail.product.id },
                        lock: { mode: 'pessimistic_write' }
                    });
                    
                    if (product) {
                        const oldStock = product.stock;
                        product.stock += orderDetail.quantity;
                        await transactionalEntityManager.save(product);
                        
                    }
                }
            }

            // Update order status
            const orderToUpdate = await transactionalEntityManager.findOne(Order, {
                where: { id: orderId },
                lock: { mode: 'pessimistic_write' }
            });
            
            if (!orderToUpdate) {
                throw new EntityNotFoundException('Order');
            }
            
            orderToUpdate.status = newStatus;
            if (updateOrderDto.cancelReason) {
                orderToUpdate.cancelReason = updateOrderDto.cancelReason;
            }

            await transactionalEntityManager.save(orderToUpdate);
        });

        // Return updated order with full relations
        return await this.getOrderById(orderId);
    }

    async getOrderStatistics(username: string): Promise<{
        total: number;
        pending: number;
        shipping: number;
        delivered: number;
        cancelled: number;
    }> {
        const baseQuery = Order.createQueryBuilder('order')
            .leftJoin('order.customer', 'customer')
            .where('customer.username = :username', { username });

        const [
            total,
            pending,
            shipping,
            delivered,
            cancelled
        ] = await Promise.all([
            baseQuery.getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.PENDING }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.SHIPPING }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.DELIVERED }).getCount(),
            baseQuery.clone().andWhere('order.status = :status', { status: OrderStatus.CANCELLED }).getCount()
        ]);

        return {
            total,
            pending,
            shipping,
            delivered,
            cancelled
        };
    }

    async getOrdersByShipperId(
        shipperId: string,
        options: { status?: string; search?: string; sort?: string; page?: number; limit?: number }
    ): Promise<{ orders: Order[]; total: number }> {
        const { status, search, sort = 'orderDate', page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        let queryBuilder = Order.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('customer.role', 'customerRole')
            .leftJoinAndSelect('order.orderDetails', 'orderDetails')
            .leftJoinAndSelect('orderDetails.product', 'product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('order.shipper', 'shipper')
            .where('shipper.id = :shipperId', { shipperId });

        if (status) {
            queryBuilder = queryBuilder.andWhere('order.status = :status', { status });
        }

        if (search) {
            queryBuilder = queryBuilder.andWhere(
                '(customer.username ILIKE :search OR "order".id::text ILIKE :search OR "order".shippingAddress ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (sort === 'orderDate') {
            queryBuilder = queryBuilder.orderBy('order.orderDate', 'DESC');
        } else if (sort === 'totalAmount') {
            queryBuilder = queryBuilder.orderBy('order.totalAmount', 'DESC');
        }

        const [orders, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return { orders, total };
    }

    async updateOrderStatusByShipper(
        orderId: string,
        shipperId: string,
        updateData: { status: string; reason?: string }
    ): Promise<Order> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: ['customer', 'shipper', 'orderDetails', 'orderDetails.product']
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        // Check if shipper is assigned to this order
        if (!order.shipper || order.shipper.id !== shipperId) {
            throw new Error('Access denied - shipper not assigned to this order');
        }

        // Validate status transition for shipper
        const currentStatus = order.status as OrderStatus;
        const newStatus = updateData.status as OrderStatus;
        
        if (!this.validateOrderStatusTransition(currentStatus, newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }

        await DbConnection.appDataSource.manager.transaction(async transactionalEntityManager => {
            // If order is being cancelled by shipper, restore product stock
            if (newStatus === OrderStatus.CANCELLED && 
                [OrderStatus.PENDING, OrderStatus.ASSIGNED, OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.EXTERNAL].includes(currentStatus)) {
                
                for (const orderDetail of order.orderDetails) {
                    const product = await transactionalEntityManager.findOne(Product, {
                        where: { id: orderDetail.product.id },
                        lock: { mode: 'pessimistic_write' }
                    });
                    
                    if (product) {
                        const oldStock = product.stock;
                        product.stock += orderDetail.quantity;
                        await transactionalEntityManager.save(product);
                        
                    }
                }
            }

            // Update order status
            const orderToUpdate = await transactionalEntityManager.findOne(Order, {
                where: { id: orderId },
                lock: { mode: 'pessimistic_write' }
            });
            
            if (!orderToUpdate) {
                throw new EntityNotFoundException('Order');
            }
            
            orderToUpdate.status = newStatus;
            if (updateData.reason && newStatus === OrderStatus.CANCELLED) {
                orderToUpdate.cancelReason = updateData.reason;
            }

            await transactionalEntityManager.save(orderToUpdate);
        });

        // Return updated order with relations
        return await this.getOrderById(orderId);
    }

    // Thay đổi: nhận thêm shipper, assigned, unassigned
    async getAllOrdersWithFilter(options: OrderFilterOptions): Promise<{ orders: Order[]; total: number }> {
        const { status, search, sort = 'orderDate', page = 1, limit = 10, shipper, assigned, unassigned } = options;
        const offset = (page - 1) * limit;

        let queryBuilder = Order.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('customer.role', 'customerRole')
            .leftJoinAndSelect('order.orderDetails', 'orderDetails')
            .leftJoinAndSelect('orderDetails.product', 'product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('order.shipper', 'shipper');

        // Ưu tiên filter shipper cụ thể trước
        if (shipper) {
            queryBuilder = queryBuilder.where('shipper.id = :shipperId', { shipperId: shipper });
        } else if (assigned) {
            queryBuilder = queryBuilder.where('order.shipper IS NOT NULL');
        } else if (unassigned) {
            queryBuilder = queryBuilder.where('order.shipper IS NULL');
        }

        if (status) {
            // Nếu đã có where ở trên thì dùng andWhere, nếu chưa thì where
            if (shipper || assigned || unassigned) {
                queryBuilder = queryBuilder.andWhere('order.status = :status', { status });
            } else {
            queryBuilder = queryBuilder.where('order.status = :status', { status });
            }
        }

        if (search) {
            const whereClause = (shipper || assigned || unassigned || status) ? 'andWhere' : 'where';
            queryBuilder = queryBuilder[whereClause](
                '(customer.username ILIKE :search OR "order".id::text ILIKE :search OR "order".shippingAddress ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (sort === 'orderDate') {
            queryBuilder = queryBuilder.orderBy('order.orderDate', 'DESC');
        } else if (sort === 'totalAmount') {
            queryBuilder = queryBuilder.orderBy('order.totalAmount', 'DESC');
        }

        const [orders, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return { orders, total };
    }

    async deleteOrderById(orderId: string): Promise<void> {
        const order = await Order.findOne({
            where: { id: orderId },
            relations: ['orderDetails']
        });

        if (!order) {
            throw new EntityNotFoundException('Order');
        }

        await order.remove();
    }

    /**
     * Lấy tất cả đơn hàng chưa có shipper
     */
    async getUnassignedOrders(): Promise<Order[]> {
        return await Order.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.shipper', 'shipper')
            .leftJoinAndSelect('order.orderDetails', 'orderDetails')
            .leftJoinAndSelect('orderDetails.product', 'product')
            .where('order.shipper IS NULL')
            .andWhere('order.status IN (:...statuses)', { 
                statuses: [OrderStatus.PENDING] 
            })
            .orderBy('order.orderDate', 'ASC')
            .getMany();
    }

    private async markOrderForManualAssignment(orderId: string, reason: string): Promise<void> {
        // Mark order for manual assignment in database
        const order = await Order.findOne({ where: { id: orderId } });
        if (order) {
            order.status = OrderStatus.EXTERNAL; // Đổi sang EXTERNAL
            order.shipper = null; // Clear auto-assigned shipper
            order.cancelReason = `Auto-assignment failed: ${reason}`; // Record failure reason
            await order.save();
        }
    }

    private async markOrderForManualAssignmentSafe(orderId: string, reason: string): Promise<void> {
        try {
            // Tìm order và thông tin chi tiết
            const order = await Order.findOne({ 
                where: { id: orderId },
                relations: ['customer', 'orderDetails', 'orderDetails.product'] 
            });

            if (order) {
                // Log thông tin chi tiết về đơn hàng
                console.log(`[Auto-Assignment] Chi tiết đơn hàng ${orderId}:`);
                console.log(`- Địa chỉ: ${order.shippingAddress}`);
                console.log(`- Số sản phẩm: ${order.orderDetails?.length || 0}`);
                console.log(`- Tổng tiền: ${order.totalAmount}`);
                console.log(`- Lý do giao thất bại: ${reason}`);
                
                // Chỉ cập nhật note để Admin xem xét thay vì tự động chuyển sang bên thứ 3
                const originalNote = order.note || '';
                order.note = `${originalNote}\n[Hệ thống] Phân công tự động thất bại: ${reason}\nCần Admin xem xét phân công (${new Date().toLocaleString('vi-VN')})`;
                
                // Không thay đổi trạng thái đơn hàng, để Admin quyết định
                // order.status = OrderStatus.EXTERNAL;
                
                await order.save();
            }
        } catch (error) {
            // Không throw error để tránh ảnh hưởng đến quy trình chính
        }
    }
} 