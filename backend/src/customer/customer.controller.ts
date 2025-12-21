import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam } from "routing-controllers";
import { Service } from "typedi";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto, UpdateCustomerDto } from "./dtos/customer.dtos";

@Service()
@Controller("/customers")
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService
  ) {}

  @Post("/")
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      const customer = await this.customerService.createCustomer(createCustomerDto);
      return {
        success: true,
        data: customer,
        message: "Customer created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/")
  async getAllCustomers() {
    try {
      const customers = await this.customerService.getAllCustomers();
      return {
        success: true,
        data: customers,
        message: "Customers retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve customers",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/search")
  async searchCustomers(@QueryParam("q") searchTerm: string) {
    try {
      if (!searchTerm) {
        return {
          success: false,
          message: "Search term is required"
        };
      }
      const customers = await this.customerService.searchCustomers(searchTerm);
      return {
        success: true,
        data: customers,
        message: "Customers found successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to search customers",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/:id")
  async getCustomerById(@Param("id") id: string) {
    try {
      const customer = await this.customerService.getCustomerById(id);
      return {
        success: true,
        data: customer,
        message: "Customer retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Put("/:id")
  async updateCustomer(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    try {
      const customer = await this.customerService.updateCustomer(id, updateCustomerDto);
      return {
        success: true,
        data: customer,
        message: "Customer updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Delete("/:id")
  async deleteCustomer(@Param("id") id: string) {
    try {
      await this.customerService.deleteCustomer(id);
      return {
        success: true,
        message: "Customer deleted successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to delete customer",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/export")
  async exportCustomers() {
    try {
      // For now, return a placeholder response
      // TODO: Implement actual Excel generation logic
      return {
        success: true,
        message: "Export functionality is not yet implemented"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to export customers", 
        error: error.message || "Unknown error"
      };
    }
  }
}
