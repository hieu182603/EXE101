// Common interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
}

export interface IOrder {
  id: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  customer?: ICustomer;
  shipper?: IShipper;
}

export interface ICustomer {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  role: Role;
  customerOrders?: IOrder[];
  createdAt: string;
  isRegistered: boolean;
}

export interface IShipper {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  role: Role;
  shipperOrders?: IOrder[];
  createdAt: string;
  isRegistered: boolean;
  // New fields for automatic assignment system
  workingZones?: string[];
  isAvailable?: boolean;
  priority?: number;
  dailyOrderCount?: number;
  maxDailyOrders?: number;
}

// DTOs
export interface CreateCustomerDto {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface UpdateCustomerDto {
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

export interface CreateShipperDto {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface UpdateShipperDto {
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

// New DTOs for automatic shipper assignment system
export interface UpdateWorkingZoneDto {
  workingZones: string[];
}

export interface UpdateAvailabilityDto {
  isAvailable: boolean;
}

export interface UpdatePriorityDto {
  priority: number;
}

export interface ShippingStatistics {
  totalOrders: number;
  assignedOrders: number;
  unassignedOrders: number;
  availableShippers: number;
  totalShippers: number;
  averageAssignmentTime: number;
  successRate: number;
}

export interface ShipperStatistics {
  totalOrders: number;
  deliveredOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  deliveryRate: number;
  cancellationRate: number;
  rating: number;
  todayOrders: number;
  maxDailyOrders: number;
  isAvailable: boolean;
  priority: number;
}

export interface ShippingConfiguration {
  autoAssignmentEnabled: boolean;
  maxDistance: number;
  priorityWeight: number;
  workloadWeight: number;
  distanceWeight: number;
  availabilityWeight: number;
  resetTime: string;
  assignmentInterval: number;
}

export interface AssignmentResult {
  success: boolean;
  assignedOrders: number;
  failedOrders: number;
  message: string;
}

export interface WorkingZone {
  id: string;
  name: string;
  province: string;
  type: string;
}

export interface AvailableZones {
  provinces: string[];
  districtsByProvince: {
    [province: string]: string[]
  };
}

// Custom error types
export interface ApiError extends Error {
  response?: {
    data: {
      message: string;
      error?: string;
    };
    status: number;
  };
} 