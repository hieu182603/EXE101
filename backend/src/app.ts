import express from "express";
import { Container } from "typedi";
import swaggerUi from "swagger-ui-express";
import { getMetadataArgsStorage, useExpressServer, useContainer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { DbConnection } from "@/database/dbConnection";
import cors from "cors";
import { CronJobService } from "./shipper/cronJob.service";
import { errorHandler } from "./middlewares/error-handler.middleware";

// Import routers
// All routers migrated to routing-controllers

// Import all controllers for routing-controllers
import { AccountController } from "./auth/account/account.controller";
// import { CartController } from "./cart/cart.controller";
import { CustomerController } from "./customer/customer.controller";
import { FeedbackController } from "./feedback/feedback.controller";
import { InvoiceController } from "./payment/invoice.controller";
import { JwtController } from "./jwt/jwt.controller";
import { NotificationController } from "./notification/notification.controller";
import { OrderController } from "./order/order.controller";
import { OtpController } from "./otp/otp.controller";
import { PaymentController } from "./payment/payment.controller";
import { ProductController } from "./product/product.controller";
import { ReportsController } from "./reports/reports.controller";
import { RFQController } from "./rfq/rfq.controller";
import { RoleController } from "./role/role.controller";
import { ShipperController } from "./shipper/shipper.controller";
import { OrderAssignmentController } from "./shipper/orderAssignment.controller";
import { ImageController } from "./image/image.controller";

export default class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
  }

  public getServer() {
    return this.app;
  }

  public listen() {
    console.log();
    this.app.listen(this.port, () => {
      console.log(`🚀 Backend listening on port ${this.port}`);
      console.log(`📘 Api docs at: http://localhost:${this.port}/api-docs`);
      this.initializeCronJobs();
    });
  }

  private initializeMiddlewares() {
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (req.originalUrl.toString().includes("webhook")) {
          next();
        } else {
          // Better JSON parsing with error handling
          express.json({
            limit: '50mb',
            type: 'application/json'
          })(req, res, (err) => {
            if (err) {
              console.error('🔴 JSON Parse Error:', {
                url: req.originalUrl,
                method: req.method,
                body: req.body,
                rawBody: err.body,
                error: err.message
              });
              
              // If it's a JSON parse error for endpoints that don't need body, ignore it
              if (err.type === 'entity.parse.failed' && 
                  (req.originalUrl.includes('/assign-shipper') || 
                   req.originalUrl.includes('/bulk-assign-shipper'))) {
                console.log('⚠️ Ignoring JSON parse error for assignment endpoint');
                req.body = {}; // Set empty body
                next();
              } else {
                res.status(400).json({
                  success: false,
                  message: 'Invalid JSON format in request body',
                  error: err.message
                });
              }
            } else {
              next();
            }
          });
        }
      }
    );
    this.app.use(cors());
    
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static("public"));
  }

  private async connectToDatabase() {
    try {
      await DbConnection.createConnection();
      console.log("✅ Database connection established successfully.");
    } catch (error) {
      console.error("❌ Failed to connect to the database: ", error);
      throw error;
    }
  }

  private initializeRoutes() {
    // Setup dependency injection container for routing-controllers
    useContainer(Container);

    // Setup routing-controllers with all controllers
    useExpressServer(this.app, {
      controllers: [
        AccountController,
        // CartController,
        CustomerController,
        FeedbackController,
        ImageController,
        InvoiceController,
        JwtController,
        NotificationController,
        OrderController,
        OtpController,
        PaymentController,
        ProductController,
        ReportsController,
        RFQController,
        RoleController,
        ShipperController,
        OrderAssignmentController,
      ],
      routePrefix: "/api",
      middlewares: [],
      interceptors: [],
      validation: {
        skipMissingProperties: false,
        whitelist: true,
        forbidNonWhitelisted: true,
      },
      defaultErrorHandler: false, // We'll use our custom error handler
      classTransformer: true,
    });

    // All routers have been migrated to routing-controllers

    // Error handler middleware (must be last)
    this.app.use(errorHandler);
  }

  private initializeSwagger() {
    // Generate OpenAPI spec from routing-controllers metadata so controllers/routes
    // decorated with routing-controllers decorators are included automatically.
    try {
      const storage = getMetadataArgsStorage();

      const swaggerSpec = routingControllersToSpec(
        storage,
        {},
        {
          info: {
            title: "Backend API",
            version: "1.0.0",
            description: "API documentation for the backend application",
          },
          servers: [
            {
              url: `http://localhost:${this.port}/api`,
              description: "Development server",
            },
          ],
          components: {
            securitySchemes: {
              ApiKeyAuth: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
                description: "API key for authorization (Bearer token)",
              },
            },
            schemas: {
              CreateAccountSchema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 50 },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", pattern: "^\\+?[0-9]{10,15}$" },
                  username: { type: "string", minLength: 3, maxLength: 30 },
                  password: { type: "string", minLength: 6 }
                },
                required: ["name", "email", "username", "password"]
              },
              VerifyRegisterSchema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  otp: { type: "string", minLength: 6, maxLength: 6, pattern: "^[0-9]{6}$" }
                },
                required: ["email", "otp"]
              },
              CredentialsSchema: {
                type: "object",
                properties: {
                  identifier: { type: "string", description: "Username or email" },
                  password: { type: "string", minLength: 6 }
                },
                required: ["identifier", "password"]
              },
              UpdateAccountSchema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 50 },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", pattern: "^\\+?[0-9]{10,15}$" },
                  username: { type: "string", minLength: 3, maxLength: 30 },
                  oldUsername: { type: "string" }
                }
              },
              CreateAccountAdminSchema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 50 },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", pattern: "^\\+?[0-9]{10,15}$" },
                  username: { type: "string", minLength: 3, maxLength: 30 },
                  password: { type: "string", minLength: 6 },
                  roleId: { type: "string" }
                },
                required: ["name", "email", "username", "password", "roleId"]
              },
              CreateOrderSchema: {
                type: "object",
                properties: {
                  customerName: { type: "string" },
                  customerEmail: { type: "string", format: "email" },
                  customerPhone: { type: "string" },
                  shippingAddress: { type: "string" },
                  paymentMethod: { type: "string", enum: ["cod", "bank_transfer", "momo", "zalopay"] },
                  notes: { type: "string" }
                },
                required: ["customerName", "customerEmail", "customerPhone", "shippingAddress", "paymentMethod"]
              },
              UpdateOrderSchema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] },
                  shipperId: { type: "string" },
                  notes: { type: "string" }
                }
              }
            }
          },
        }
      );

      // Add manual routes that are not using routing-controllers decorators
      const manualPaths: any = {
        // Auth routes
        "/account/register": {
          post: {
            summary: "Register a new account",
            description: "Register a new account (sends OTP email)",
            tags: ["Account"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateAccountSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Registration initiated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/verify-register": {
          post: {
            summary: "Verify registration with OTP",
            description: "Verify registration with OTP and complete account setup",
            tags: ["Account"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VerifyRegisterSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Registration completed successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/login": {
          post: {
            summary: "Login with credentials",
            description: "Login with username/email and password",
            tags: ["Account"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CredentialsSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Login successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                        refreshToken: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/logout": {
          post: {
            summary: "Logout user",
            description: "Logout and invalidate refresh token",
            tags: ["Account"],
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: { type: "string" }
                    },
                    required: ["username"]
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Logout successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/details": {
          get: {
            summary: "Get account details",
            description: "Get current user account details",
            tags: ["Account"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Account details retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/all": {
          get: {
            summary: "Get all accounts",
            description: "Get all accounts (admin only)",
            tags: ["Account"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Accounts retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/create": {
          post: {
            summary: "Create account",
            description: "Create new account (admin only)",
            tags: ["Account"],
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateAccountAdminSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Account created successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/update": {
          patch: {
            summary: "Update account",
            description: "Update account information",
            tags: ["Account"],
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UpdateAccountSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Account updated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/account/delete": {
          delete: {
            summary: "Delete account",
            description: "Delete account (admin only)",
            tags: ["Account"],
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: { type: "string" }
                    },
                    required: ["username"]
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Account deleted successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // Product routes
        "/products": {
          get: {
            summary: "Get all products",
            description: "Get all available products",
            tags: ["Products"],
            responses: {
              200: {
                description: "Products retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/products/search": {
          get: {
            summary: "Search products",
            description: "Search products by query",
            tags: ["Products"],
            parameters: [
              {
                name: "q",
                in: "query",
                schema: { type: "string" },
                description: "Search query"
              }
            ],
            responses: {
              200: {
                description: "Search results",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/products/{id}": {
          get: {
            summary: "Get product by ID",
            description: "Get a specific product by ID",
            tags: ["Products"],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Product ID"
              }
            ],
            responses: {
              200: {
                description: "Product retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          },
          put: {
            summary: "Update product",
            description: "Update product information",
            tags: ["Products"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Product ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { type: "object" }
                }
              }
            },
            responses: {
              200: {
                description: "Product updated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: "Delete product",
            description: "Delete a product",
            tags: ["Products"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Product ID"
              }
            ],
            responses: {
              200: {
                description: "Product deleted successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/products/category/{categoryId}": {
          get: {
            summary: "Get products by category",
            description: "Get all products in a specific category",
            tags: ["Products"],
            parameters: [
              {
                name: "categoryId",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Category ID"
              }
            ],
            responses: {
              200: {
                description: "Products retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/products/categories/all": {
          get: {
            summary: "Get all categories",
            description: "Get all product categories",
            tags: ["Products"],
            responses: {
              200: {
                description: "Categories retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        // Order routes
        "/orders": {
          get: {
            summary: "Get user orders",
            description: "Get orders for the authenticated user",
            tags: ["Orders"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
                description: "Page number"
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 1000 },
                description: "Items per page"
              }
            ],
            responses: {
              200: {
                description: "Orders retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { type: "object" } },
                        pagination: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: "Create order",
            description: "Create a new order from cart",
            tags: ["Orders"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateOrderSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Order created successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/orders/{id}": {
          get: {
            summary: "Get order by ID",
            description: "Get a specific order by ID",
            tags: ["Orders"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Order ID"
              }
            ],
            responses: {
              200: {
                description: "Order retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          },
          patch: {
            summary: "Update order status",
            description: "Update order status",
            tags: ["Orders"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Order ID"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UpdateOrderSchema" }
                }
              }
            },
            responses: {
              200: {
                description: "Order updated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          },
          delete: {
            summary: "Delete order",
            description: "Delete an order",
            tags: ["Orders"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Order ID"
              }
            ],
            responses: {
              200: {
                description: "Order deleted successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/orders/{id}/confirm-delivery": {
          post: {
            summary: "Confirm order delivery",
            description: "Confirm that an order has been delivered",
            tags: ["Orders"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Order ID"
              }
            ],
            responses: {
              200: {
                description: "Order delivery confirmed",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/orders/dashboard/stats": {
          get: {
            summary: "Get dashboard statistics",
            description: "Get comprehensive dashboard statistics including revenue, orders, customers, products, etc. (Admin/Manager/Staff only)",
            tags: ["Dashboard"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Dashboard statistics retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            totalRevenue: { type: "number" },
                            totalOrders: { type: "number" },
                            totalCustomers: { type: "number" },
                            totalProducts: { type: "number" },
                            totalShippers: { type: "number" },
                            totalFeedbacks: { type: "number" },
                            recentOrders: { type: "array", items: { type: "object" } },
                            topProducts: { type: "array", items: { type: "object" } },
                            orderStatusDistribution: { type: "object" },
                            monthlyRevenue: { type: "array", items: { type: "object" } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/orders/dashboard/revenue-stats": {
          get: {
            summary: "Get revenue statistics",
            description: "Get revenue statistics with date range and period grouping (Admin/Manager/Staff only)",
            tags: ["Dashboard"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "period",
                in: "query",
                schema: { type: "string", enum: ["day", "month", "year"], default: "month" },
                description: "Grouping period"
              }
            ],
            responses: {
              200: {
                description: "Revenue statistics retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            period: { type: "string" },
                            data: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  date: { type: "string" },
                                  revenue: { type: "number" },
                                  orders: { type: "number" }
                                }
                              }
                            },
                            totalRevenue: { type: "number" },
                            totalOrders: { type: "number" },
                            averageOrderValue: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/orders/analytics/trends": {
          get: {
            summary: "Get order analytics trends",
            description: "Get order trends and analytics with date range and period grouping (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "period",
                in: "query",
                schema: { type: "string", enum: ["day", "month", "year"], default: "month" },
                description: "Grouping period"
              }
            ],
            responses: {
              200: {
                description: "Order analytics trends retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            period: { type: "string" },
                            summary: {
                              type: "object",
                              properties: {
                                totalOrders: { type: "number" },
                                totalRevenue: { type: "number" },
                                averageOrderValue: { type: "number" }
                              }
                            },
                            data: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  date: { type: "string" },
                                  orders: { type: "number" },
                                  revenue: { type: "number" },
                                  averageValue: { type: "number" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/orders/analytics/status-trends": {
          get: {
            summary: "Get order status trends",
            description: "Get order status distribution trends over time (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              }
            ],
            responses: {
              200: {
                description: "Order status trends retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              date: { type: "string" },
                              pending: { type: "number" },
                              confirmed: { type: "number" },
                              processing: { type: "number" },
                              shipped: { type: "number" },
                              delivered: { type: "number" },
                              cancelled: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/products/analytics/performance": {
          get: {
            summary: "Get product performance analytics",
            description: "Get product performance analytics including sales, revenue, and performance scores (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10 },
                description: "Number of top products to return"
              }
            ],
            responses: {
              200: {
                description: "Product performance analytics retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              productId: { type: "string" },
                              productName: { type: "string" },
                              productPrice: { type: "number" },
                              stockQuantity: { type: "number" },
                              totalSold: { type: "number" },
                              totalRevenue: { type: "number" },
                              averageSellingPrice: { type: "number" },
                              orderCount: { type: "number" },
                              performanceScore: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/products/analytics/sales-trends": {
          get: {
            summary: "Get product sales trends",
            description: "Get product sales trends over time with period grouping (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "period",
                in: "query",
                schema: { type: "string", enum: ["day", "month", "year"], default: "month" },
                description: "Grouping period"
              }
            ],
            responses: {
              200: {
                description: "Product sales trends retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              date: { type: "string" },
                              totalSold: { type: "number" },
                              totalRevenue: { type: "number" },
                              ordersCount: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/customers/analytics/growth": {
          get: {
            summary: "Get customer growth analytics",
            description: "Get customer registration and growth trends over time (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "period",
                in: "query",
                schema: { type: "string", enum: ["day", "month", "year"], default: "month" },
                description: "Grouping period"
              }
            ],
            responses: {
              200: {
                description: "Customer growth analytics retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              date: { type: "string" },
                              newCustomers: { type: "number" },
                              totalCustomers: { type: "number" },
                              cumulativeGrowth: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/customers/analytics/top-spenders": {
          get: {
            summary: "Get top customers by spending",
            description: "Get top customers ranked by total spending in a date range (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10 },
                description: "Number of top customers to return"
              }
            ],
            responses: {
              200: {
                description: "Top customers by spending retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              customerId: { type: "string" },
                              customerName: { type: "string" },
                              customerEmail: { type: "string" },
                              totalOrders: { type: "number" },
                              totalSpent: { type: "number" },
                              averageOrderValue: { type: "number" },
                              lastOrderDate: { type: "string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/shippers/analytics/performance": {
          get: {
            summary: "Get shipper performance analytics",
            description: "Get shipper performance analytics including delivery rates and statistics (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10 },
                description: "Number of top shippers to return"
              }
            ],
            responses: {
              200: {
                description: "Shipper performance analytics retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              shipperId: { type: "string" },
                              shipperName: { type: "string" },
                              shipperPhone: { type: "string" },
                              totalOrders: { type: "number" },
                              deliveredOrders: { type: "number" },
                              shippedOrders: { type: "number" },
                              deliveryRate: { type: "number" },
                              totalRevenue: { type: "number" },
                              averageOrderValue: { type: "number" },
                              firstDeliveryDate: { type: "string" },
                              lastDeliveryDate: { type: "string" },
                              performanceScore: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/shippers/analytics/delivery-trends": {
          get: {
            summary: "Get shipper delivery trends",
            description: "Get shipper delivery trends and performance over time (Admin/Manager/Staff only)",
            tags: ["Analytics"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "Start date (ISO format)"
              },
              {
                name: "endDate",
                in: "query",
                required: true,
                schema: { type: "string", format: "date" },
                description: "End date (ISO format)"
              },
              {
                name: "period",
                in: "query",
                schema: { type: "string", enum: ["day", "month", "year"], default: "month" },
                description: "Grouping period"
              }
            ],
            responses: {
              200: {
                description: "Shipper delivery trends retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              date: { type: "string" },
                              totalOrders: { type: "number" },
                              deliveredOrders: { type: "number" },
                              deliveryRate: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/admin": {
          get: {
            summary: "Get notifications",
            description: "Get notifications for current admin/staff user with filtering and pagination",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
                description: "Page number"
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 20 },
                description: "Items per page"
              },
              {
                name: "status",
                in: "query",
                schema: { type: "string", enum: ["unread", "read", "archived"] },
                description: "Filter by status"
              },
              {
                name: "type",
                in: "query",
                schema: {
                  type: "string",
                  enum: ["order_created", "order_status_updated", "payment_received", "low_stock_alert", "new_customer", "shipper_assigned", "system_alert", "feedback_received"]
                },
                description: "Filter by type"
              },
              {
                name: "priority",
                in: "query",
                schema: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                description: "Filter by priority"
              },
              {
                name: "isRead",
                in: "query",
                schema: { type: "boolean" },
                description: "Filter by read status"
              },
              {
                name: "dateFrom",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Filter from date"
              },
              {
                name: "dateTo",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Filter to date"
              }
            ],
            responses: {
              200: {
                description: "Notifications retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: { type: "object" }
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            total: { type: "integer" },
                            totalPages: { type: "integer" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/stats": {
          get: {
            summary: "Get notification statistics",
            description: "Get notification statistics for current user",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Notification statistics retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            total: { type: "integer" },
                            unread: { type: "integer" },
                            read: { type: "integer" },
                            archived: { type: "integer" },
                            byPriority: { type: "object" },
                            byType: { type: "object" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/unread-count": {
          get: {
            summary: "Get unread notification count",
            description: "Get count of unread notifications for current user",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Unread count retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            unreadCount: { type: "integer" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/{id}/read": {
          put: {
            summary: "Mark notification as read",
            description: "Mark a specific notification as read",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Notification ID"
              }
            ],
            responses: {
              200: {
                description: "Notification marked as read successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/mark-read": {
          put: {
            summary: "Mark multiple notifications as read",
            description: "Mark multiple notifications as read",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      notificationIds: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["notificationIds"]
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Notifications marked as read successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            markedCount: { type: "integer" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/{id}/archive": {
          put: {
            summary: "Archive notification",
            description: "Archive a notification",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Notification ID"
              }
            ],
            responses: {
              200: {
                description: "Notification archived successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/{id}": {
          delete: {
            summary: "Delete notification",
            description: "Delete a notification",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Notification ID"
              }
            ],
            responses: {
              200: {
                description: "Notification deleted successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/notifications/create": {
          post: {
            summary: "Create notification",
            description: "Create a custom notification (Admin only)",
            tags: ["Notifications"],
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["order_created", "order_status_updated", "payment_received", "low_stock_alert", "new_customer", "shipper_assigned", "system_alert", "feedback_received"]
                      },
                      priority: {
                        type: "string",
                        enum: ["low", "medium", "high", "urgent"]
                      },
                      title: { type: "string" },
                      message: { type: "string" },
                      data: { type: "object" },
                      recipientId: { type: "string" },
                      isBroadcast: { type: "boolean" },
                      expiresAt: { type: "string", format: "date-time" }
                    },
                    required: ["type", "priority", "title", "message"]
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Notification created successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: { type: "array", items: { type: "object" } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/summary": {
          get: {
            summary: "Get reports summary",
            description: "Get summary of all available reports and their capabilities",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Reports summary retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            totalReports: { type: "integer" },
                            availableReports: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "string" },
                                  name: { type: "string" },
                                  description: { type: "string" },
                                  exportFormats: { type: "array", items: { type: "string" } },
                                  filters: { type: "array", items: { type: "string" } }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/sales": {
          get: {
            summary: "Generate sales report",
            description: "Generate comprehensive sales report with revenue, orders, and product performance",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Start date for the report"
              },
              {
                name: "endDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "End date for the report"
              },
              {
                name: "status",
                in: "query",
                schema: { type: "string" },
                description: "Filter by order status"
              },
              {
                name: "category",
                in: "query",
                schema: { type: "string" },
                description: "Filter by product category"
              }
            ],
            responses: {
              200: {
                description: "Sales report generated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            totalRevenue: { type: "number" },
                            totalOrders: { type: "integer" },
                            totalCustomers: { type: "integer" },
                            averageOrderValue: { type: "number" },
                            topProducts: { type: "array", items: { type: "object" } },
                            salesByPeriod: { type: "array", items: { type: "object" } },
                            salesByCategory: { type: "array", items: { type: "object" } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/sales/export": {
          get: {
            summary: "Export sales report",
            description: "Export sales report to Excel format",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Start date for the report"
              },
              {
                name: "endDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "End date for the report"
              },
              {
                name: "format",
                in: "query",
                schema: { type: "string", default: "excel" },
                description: "Export format (currently only excel supported)"
              }
            ],
            responses: {
              200: {
                description: "Excel file download",
                content: {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                    schema: {
                      type: "string",
                      format: "binary"
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/inventory": {
          get: {
            summary: "Generate inventory report",
            description: "Generate inventory report with stock levels and valuation",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            responses: {
              200: {
                description: "Inventory report generated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            totalProducts: { type: "integer" },
                            lowStockProducts: { type: "array", items: { type: "object" } },
                            outOfStockProducts: { type: "array", items: { type: "object" } },
                            inventoryByCategory: { type: "array", items: { type: "object" } },
                            inventoryValue: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/inventory/export": {
          get: {
            summary: "Export inventory report",
            description: "Export inventory report to Excel format",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "format",
                in: "query",
                schema: { type: "string", default: "excel" },
                description: "Export format (currently only excel supported)"
              }
            ],
            responses: {
              200: {
                description: "Excel file download",
                content: {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                    schema: {
                      type: "string",
                      format: "binary"
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/customers": {
          get: {
            summary: "Generate customer report",
            description: "Generate customer analysis report with spending and retention metrics",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Start date for the report"
              },
              {
                name: "endDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "End date for the report"
              }
            ],
            responses: {
              200: {
                description: "Customer report generated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            totalCustomers: { type: "integer" },
                            newCustomers: { type: "integer" },
                            topCustomers: { type: "array", items: { type: "object" } },
                            customerRetentionRate: { type: "number" },
                            averageOrdersPerCustomer: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/customers/export": {
          get: {
            summary: "Export customer report",
            description: "Export customer report to Excel format",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Start date for the report"
              },
              {
                name: "endDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "End date for the report"
              },
              {
                name: "format",
                in: "query",
                schema: { type: "string", default: "excel" },
                description: "Export format (currently only excel supported)"
              }
            ],
            responses: {
              200: {
                description: "Excel file download",
                content: {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                    schema: {
                      type: "string",
                      format: "binary"
                    }
                  }
                }
              }
            }
          }
        },
        "/reports/shippers": {
          get: {
            summary: "Generate shipper report",
            description: "Generate shipper performance report with delivery rates and efficiency",
            tags: ["Reports"],
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: "startDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "Start date for the report"
              },
              {
                name: "endDate",
                in: "query",
                schema: { type: "string", format: "date" },
                description: "End date for the report"
              },
              {
                name: "shipperId",
                in: "query",
                schema: { type: "string" },
                description: "Filter by specific shipper ID"
              }
            ],
            responses: {
              200: {
                description: "Shipper report generated successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            totalShippers: { type: "integer" },
                            activeShippers: { type: "array", items: { type: "object" } },
                            deliveryStats: { type: "object" },
                            averageDeliveryTime: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      // Add image endpoints (implemented as express routes) to manual paths
      manualPaths["/image/upload"] = {
        post: {
          summary: "Upload image",
          tags: ["Image"],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary" }
                  },
                  required: ["file"]
                }
              }
            }
          },
          responses: {
            200: {
              description: "Image uploaded successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      originalName: { type: "string" },
                      url: { type: "string" },
                      name: { type: "string" }
                    }
                  }
                  ,example: {
                    id: "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
                    originalName: "photo.jpg",
                    url: "https://res.cloudinary.com/example/photo.jpg",
                    name: "photo_2025.jpg"
                  }
                }
              }
            }
          }
        }
      };

      manualPaths["/image/attach-to-product"] = {
        post: {
          summary: "Attach images to product",
          tags: ["Image"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string" },
                    imagesURLs: { type: "array", items: { type: "string" } }
                  },
                  required: ["query", "imagesURLs"]
                }
              }
            }
          },
          responses: {
            200: {
              description: "Images attached to product successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      product: { type: "object" }
                    }
                  }
                  ,example: {
                    message: "Images attached to product successfully",
                    product: { id: "prod-uuid", name: "Example product", images: [{ url: "https://res.cloudinary.com/example/a.jpg" }] }
                  }
                }
              }
            }
          }
        }
      };

      manualPaths["/image/attach-to-feedback"] = {
        post: {
          summary: "Attach images to feedback",
          tags: ["Image"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    query: { type: "string" },
                    imagesURLs: { type: "array", items: { type: "string" } }
                  },
                  required: ["query", "imagesURLs"]
                }
              }
            }
          },
          responses: {
            200: {
              description: "Images attached to feedback successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      feedback: { type: "object" }
                    }
                  }
                  ,example: {
                    message: "Images attached to feedback successfully",
                    feedback: { id: "fb-uuid", productId: "prod-uuid", images: [{ url: "https://res.cloudinary.com/example/a.jpg" }] }
                  }
                }
              }
            }
          }
        }
      };

      // Merge manual paths with auto-generated paths
      swaggerSpec.paths = { ...swaggerSpec.paths, ...manualPaths };

      this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    } catch (err) {
      console.error("Failed to generate swagger spec from routing-controllers metadata:", err);
      // Fallback: serve an empty spec so Swagger UI still loads
      const fallbackSpec = {
        openapi: "3.0.0",
        info: { title: "Backend API", version: "1.0.0" },
        paths: {},
      };
      this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(fallbackSpec));
    }
  }

  private initializeCronJobs() {
    try {
      const cronJobService = Container.get(CronJobService);
      cronJobService.initializeCronJobs();
    } catch (error) {
      console.error("❌ Failed to initialize cron jobs:", error);
    }
  }
}
