
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: 'instock' | 'lowstock' | 'outstock';
  image: string;
  rating?: number;
  reviews?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  status: OrderStatus;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
  level?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalShippers: number;
  totalFeedbacks: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  orderStatusDistribution: { [key: string]: number };
  monthlyRevenue: MonthlyRevenue[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemsCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  totalSold: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// Analytics Types
export interface RevenueStats {
  period: 'day' | 'month' | 'year';
  data: RevenueDataPoint[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderAnalytics {
  period: 'day' | 'month' | 'year';
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  data: OrderAnalyticsDataPoint[];
}

export interface OrderAnalyticsDataPoint {
  date: string;
  orders: number;
  revenue: number;
  averageValue: number;
}

export interface OrderStatusTrends {
  date: string;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  productPrice: number;
  stockQuantity: number;
  totalSold: number;
  totalRevenue: number;
  averageSellingPrice: number;
  orderCount: number;
  performanceScore: number;
}

export interface ProductSalesTrends {
  date: string;
  totalSold: number;
  totalRevenue: number;
  ordersCount: number;
}

export interface CustomerGrowth {
  date: string;
  newCustomers: number;
  totalCustomers: number;
  cumulativeGrowth: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface ShipperPerformance {
  shipperId: string;
  shipperName: string;
  shipperPhone: string;
  totalOrders: number;
  deliveredOrders: number;
  shippedOrders: number;
  deliveryRate: number;
  totalRevenue: number;
  averageOrderValue: number;
  firstDeliveryDate: string;
  lastDeliveryDate: string;
  performanceScore: number;
}

export interface ShipperDeliveryTrends {
  date: string;
  totalOrders: number;
  deliveredOrders: number;
  deliveryRate: number;
}

// Notification Types
export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  PAYMENT_RECEIVED = 'payment_received',
  LOW_STOCK_ALERT = 'low_stock_alert',
  NEW_CUSTOMER = 'new_customer',
  SHIPPER_ASSIGNED = 'shipper_assigned',
  SYSTEM_ALERT = 'system_alert',
  FEEDBACK_RECEIVED = 'feedback_received'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  data: any;
  recipientId: string;
  isBroadcast: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byPriority: { [key in NotificationPriority]: number };
  byType: { [key in NotificationType]: number };
}

export interface CreateNotificationData {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: any;
  recipientId?: string;
  isBroadcast?: boolean;
  expiresAt?: string;
}

// Reports Types
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
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
  topCustomers: TopCustomer[];
  customerRetentionRate: number;
  averageOrdersPerCustomer: number;
}

export interface ShipperReportData {
  totalShippers: number;
  activeShippers: ShipperPerformance[];
  deliveryStats: {
    totalOrders: number;
    totalDelivered: number;
    averageDeliveryRate: number;
  }[];
  averageDeliveryTime: number;
}

export interface AvailableReport {
  id: string;
  name: string;
  description: string;
  exportFormats: string[];
  filters: string[];
}

export interface ReportsSummary {
  totalReports: number;
  availableReports: AvailableReport[];
}