import { Service } from "typedi";
import { getRepository, Between, MoreThanOrEqual } from "typeorm";
import { Order } from "@/order/order.entity";
import { Account } from "@/auth/account/account.entity";
import { Product } from "@/product/product.entity";
import { Invoice } from "@/payment/invoice.entity";
import { ShipperProfile } from "@/auth/shipperProfile.entity";
import { Feedback } from "@/feedback/feedback.entity";
import { OrderStatus } from "@/order/dtos/update-order.dto";
import ExcelJS from "exceljs";

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  category?: string;
  shipperId?: string;
}

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: any[];
  salesByPeriod: any[];
  salesByCategory: any[];
}

export interface InventoryReportData {
  totalProducts: number;
  lowStockProducts: any[];
  outOfStockProducts: any[];
  inventoryByCategory: any[];
  inventoryValue: number;
}

export interface CustomerReportData {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: any[];
  customerRetentionRate: number;
  averageOrdersPerCustomer: number;
}

export interface ShipperReportData {
  totalShippers: number;
  activeShippers: any[];
  deliveryStats: any[];
  averageDeliveryTime: number;
}

@Service()
export class ReportsService {
  private get orderRepository() {
    return getRepository(Order);
  }

  private get accountRepository() {
    return getRepository(Account);
  }

  private get productRepository() {
    return getRepository(Product);
  }

  private get invoiceRepository() {
    return getRepository(Invoice);
  }

  private get shipperRepository() {
    return getRepository(ShipperProfile);
  }

  private get feedbackRepository() {
    return getRepository(Feedback);
  }

  async generateSalesReport(filters: ReportFilters): Promise<SalesReportData> {
    const { startDate, endDate } = filters;

    // Get orders in date range
    const ordersQuery = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.customer", "customer")
      .leftJoinAndSelect("order.orderDetails", "orderDetails")
      .leftJoinAndSelect("orderDetails.product", "product")
      .leftJoinAndSelect("product.category", "category");

    if (startDate && endDate) {
      ordersQuery.andWhere("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate });
    }

    const orders = await ordersQuery.getMany();

    // Calculate basic metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map(order => order.customer?.id)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productSales = new Map();
    orders.forEach(order => {
      order.orderDetails?.forEach(detail => {
        const productId = detail.product?.id;
        const quantity = detail.quantity || 0;
        const revenue = (detail.price || 0) * quantity;

        if (!productSales.has(productId)) {
          productSales.set(productId, {
            productId,
            productName: detail.product?.name || 'Unknown',
            totalSold: 0,
            totalRevenue: 0,
            orderCount: 0
          });
        }

        const product = productSales.get(productId);
        product.totalSold += quantity;
        product.totalRevenue += revenue;
        product.orderCount += 1;
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Sales by period (monthly)
    const salesByPeriod = await this.getSalesByPeriod(startDate, endDate);

    // Sales by category
    const categorySales = new Map();
    orders.forEach(order => {
      order.orderDetails?.forEach(detail => {
        const categoryName = detail.product?.category?.name || 'Uncategorized';
        const revenue = (detail.price || 0) * (detail.quantity || 0);

        if (!categorySales.has(categoryName)) {
          categorySales.set(categoryName, { category: categoryName, revenue: 0, orders: 0 });
        }

        const category = categorySales.get(categoryName);
        category.revenue += revenue;
        category.orders += 1;
      });
    });

    const salesByCategory = Array.from(categorySales.values())
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      topProducts,
      salesByPeriod,
      salesByCategory
    };
  }

  async generateInventoryReport(): Promise<InventoryReportData> {
    // Get all products with inventory info
    const products = await this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.components", "components")
      .orderBy("product.stock", "ASC")
      .getMany();

    const totalProducts = products.length;

    // Low stock products (stock <= 10)
    const lowStockProducts = products
      .filter(product => product.stock <= 10 && product.stock > 0)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        stock: product.stock,
        price: product.price,
        category: product.category?.name || 'Uncategorized'
      }));

    // Out of stock products
    const outOfStockProducts = products
      .filter(product => product.stock <= 0)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        stock: product.stock,
        price: product.price,
        category: product.category?.name || 'Uncategorized'
      }));

    // Inventory by category
    const categoryInventory = new Map();
    products.forEach(product => {
      const categoryName = product.category?.name || 'Uncategorized';

      if (!categoryInventory.has(categoryName)) {
        categoryInventory.set(categoryName, {
          category: categoryName,
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0
        });
      }

      const category = categoryInventory.get(categoryName);
      category.totalProducts += 1;
      category.totalStock += product.stock || 0;
      category.totalValue += (product.stock || 0) * (product.price || 0);
    });

    const inventoryByCategory = Array.from(categoryInventory.values());

    // Total inventory value
    const inventoryValue = products.reduce((sum, product) =>
      sum + ((product.stock || 0) * (product.price || 0)), 0);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      inventoryByCategory,
      inventoryValue
    };
  }

  async generateCustomerReport(filters: ReportFilters): Promise<CustomerReportData> {
    const { startDate, endDate } = filters;

    // Get all customers
    const customers = await this.accountRepository
      .createQueryBuilder("account")
      .leftJoin("account.role", "role")
      .where("role.name = :roleName", { roleName: "customer" })
      .leftJoinAndSelect("account.customerOrders", "orders")
      .getMany();

    const totalCustomers = customers.length;

    // New customers in date range
    const newCustomers = customers.filter(customer => {
      if (!startDate || !endDate) return false;
      const createdAt = new Date(customer.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    }).length;

    // Top customers by spending
    const customerSpending = customers.map(customer => {
      const customerOrders = customer.customerOrders || [];
      const totalSpent = customerOrders.reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0);
      const orderCount = customerOrders.length;

      return {
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        totalSpent,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0,
      lastOrderDate: customerOrders.length > 0 ?
        Math.max(...customerOrders.map((order: Order) => new Date(order.createdAt).getTime())) : null
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    // Customer retention rate (customers with multiple orders)
    const customersWithMultipleOrders = customers.filter(customer =>
      (customer.customerOrders?.length || 0) > 1
    ).length;

    const customerRetentionRate = totalCustomers > 0 ?
      (customersWithMultipleOrders / totalCustomers) * 100 : 0;

    // Average orders per customer
    const totalOrders = customers.reduce((sum: number, customer: Account) =>
      sum + (customer.customerOrders?.length || 0), 0);
    const averageOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

    return {
      totalCustomers,
      newCustomers,
      topCustomers: customerSpending,
      customerRetentionRate,
      averageOrdersPerCustomer
    };
  }

  async generateShipperReport(filters: ReportFilters): Promise<ShipperReportData> {
    const { startDate, endDate } = filters;

    // Get all shippers with their orders
    const shippers = await this.accountRepository
      .createQueryBuilder("account")
      .leftJoin("account.role", "role")
      .where("role.name = :roleName", { roleName: "shipper" })
      .leftJoinAndSelect("account.shipperOrders", "orders")
      .leftJoinAndSelect("account.shipperProfile", "profile")
      .getMany();

    const totalShippers = shippers.length;

    // Active shippers (have orders in date range)
    const activeShippers = [];
    for (const account of shippers) {
      const shipperOrders = account.shipperOrders || [];

      // Filter orders by date range
      const filteredOrders = shipperOrders.filter((order: Order) => {
        if (!startDate || !endDate) return true;
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });

      if (filteredOrders.length > 0) {
        const deliveredOrders = filteredOrders.filter((order: Order) => order.status === OrderStatus.DELIVERED).length;
        const deliveryRate = filteredOrders.length > 0 ? (deliveredOrders / filteredOrders.length) * 100 : 0;

        activeShippers.push({
          shipperId: account.id,
          shipperName: account.name,
          shipperPhone: account.phone,
          totalOrders: filteredOrders.length,
          deliveredOrders,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          totalRevenue: filteredOrders.reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0)
        });
      }
    }

    // Delivery stats
    const deliveryStats = {
      totalOrders: activeShippers.reduce((sum, shipper) => sum + shipper.totalOrders, 0),
      totalDelivered: activeShippers.reduce((sum, shipper) => sum + shipper.deliveredOrders, 0),
      averageDeliveryRate: 0
    };

    deliveryStats.averageDeliveryRate = deliveryStats.totalOrders > 0 ?
      (deliveryStats.totalDelivered / deliveryStats.totalOrders) * 100 : 0;

    // Average delivery time (mock - would need actual delivery timestamps)
    const averageDeliveryTime = 24; // hours

    return {
      totalShippers,
      activeShippers: activeShippers.sort((a, b) => b.totalOrders - a.totalOrders),
      deliveryStats: [{
        totalOrders: deliveryStats.totalOrders,
        totalDelivered: deliveryStats.totalDelivered,
        averageDeliveryRate: deliveryStats.averageDeliveryRate
      }],
      averageDeliveryTime
    };
  }

  // Export methods
  async exportSalesReportToExcel(filters: ReportFilters): Promise<ExcelJS.Buffer> {
    const data = await this.generateSalesReport(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dashboard System';
    workbook.created = new Date();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    summarySheet.addRows([
      { metric: 'Total Revenue', value: `${data.totalRevenue.toLocaleString('vi-VN')} VND` },
      { metric: 'Total Orders', value: data.totalOrders },
      { metric: 'Total Customers', value: data.totalCustomers },
      { metric: 'Average Order Value', value: `${data.averageOrderValue.toLocaleString('vi-VN')} VND` }
    ]);

    // Top products sheet
    const productsSheet = workbook.addWorksheet('Top Products');
    productsSheet.columns = [
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Total Sold', key: 'totalSold', width: 15 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 20 },
      { header: 'Order Count', key: 'orderCount', width: 15 }
    ];

    productsSheet.addRows(data.topProducts.map(product => ({
      productName: product.productName,
      totalSold: product.totalSold,
      totalRevenue: `${product.totalRevenue.toLocaleString('vi-VN')} VND`,
      orderCount: product.orderCount
    })));

    return await workbook.xlsx.writeBuffer();
  }

  async exportInventoryReportToExcel(): Promise<ExcelJS.Buffer> {
    const data = await this.generateInventoryReport();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dashboard System';
    workbook.created = new Date();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Inventory Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    summarySheet.addRows([
      { metric: 'Total Products', value: data.totalProducts },
      { metric: 'Low Stock Products', value: data.lowStockProducts.length },
      { metric: 'Out of Stock Products', value: data.outOfStockProducts.length },
      { metric: 'Total Inventory Value', value: `${data.inventoryValue.toLocaleString('vi-VN')} VND` }
    ]);

    // Low stock products sheet
    const lowStockSheet = workbook.addWorksheet('Low Stock Products');
    lowStockSheet.columns = [
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Stock Quantity', key: 'stock', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Category', key: 'category', width: 20 }
    ];

    lowStockSheet.addRows(data.lowStockProducts.map(product => ({
      productName: product.productName,
      stock: product.stock,
      price: `${product.price.toLocaleString('vi-VN')} VND`,
      category: product.category
    })));

    return await workbook.xlsx.writeBuffer();
  }

  async exportCustomerReportToExcel(filters: ReportFilters): Promise<ExcelJS.Buffer> {
    const data = await this.generateCustomerReport(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dashboard System';
    workbook.created = new Date();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Customer Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    summarySheet.addRows([
      { metric: 'Total Customers', value: data.totalCustomers },
      { metric: 'New Customers', value: data.newCustomers },
      { metric: 'Customer Retention Rate', value: `${data.customerRetentionRate.toFixed(2)}%` },
      { metric: 'Average Orders per Customer', value: data.averageOrdersPerCustomer.toFixed(2) }
    ]);

    // Top customers sheet
    const customersSheet = workbook.addWorksheet('Top Customers');
    customersSheet.columns = [
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Email', key: 'customerEmail', width: 30 },
      { header: 'Total Spent', key: 'totalSpent', width: 20 },
      { header: 'Order Count', key: 'orderCount', width: 15 },
      { header: 'Average Order Value', key: 'averageOrderValue', width: 20 }
    ];

    customersSheet.addRows(data.topCustomers.map(customer => ({
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      totalSpent: `${customer.totalSpent.toLocaleString('vi-VN')} VND`,
      orderCount: customer.orderCount,
      averageOrderValue: `${customer.averageOrderValue.toLocaleString('vi-VN')} VND`
    })));

    return await workbook.xlsx.writeBuffer();
  }

  private async getSalesByPeriod(startDate?: Date, endDate?: Date): Promise<any[]> {
    let dateFormat: string;
    let groupBy: string;

    // Default to last 6 months if no date range provided
    if (!startDate || !endDate) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      startDate = sixMonthsAgo;
      endDate = new Date();
    }

    dateFormat = "TO_CHAR(order.createdAt, 'YYYY-MM')";
    groupBy = "TO_CHAR(order.createdAt, 'YYYY-MM')";

    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select([
        `${dateFormat} as period`,
        "COUNT(order.id) as orderCount",
        "SUM(order.totalAmount) as revenue"
      ])
      .where("order.createdAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .andWhere("order.status != :status", { status: "cancelled" })
      .groupBy(groupBy)
      .orderBy("period", "ASC")
      .getRawMany();

    return result.map(row => ({
      period: row.period,
      orderCount: parseInt(row.orderCount),
      revenue: parseFloat(row.revenue) || 0
    }));
  }
}
