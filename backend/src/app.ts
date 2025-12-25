import express from "express";
import { Container } from "typedi";
import swaggerUi from "swagger-ui-express";
import { getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { DbConnection } from "@/database/dbConnection";
import cors from "cors";
import { CronJobService } from "./shipper/cronJob.service";
import { errorHandler } from "./middlewares/error-handler.middleware";

// Import routers
import authRouter from "./auth/auth.router";
import jwtRouter from "./jwt/jwt.router";
import otpRouter from "./otp/otp.router";
import roleRouter from "./role/role.router";
import paymentRouter from "./payment/payment.router";
import productRouter from "./product/product.router";
import orderRouter from "./order/order.router";
import cartRouter from "./Cart/cart.router";
import customerRouter from "./customer/customer.router";
import feedbackRouter from "./feedback/feedback.router";
import imageRouter from "./image/image.router";
import rfqRouter from "./rfq/rfq.router";
import shipperRouter from "./shipper/shipper.router";

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
    // Mount all routers
    this.app.use("/api", authRouter);
    this.app.use("/api", jwtRouter);
    this.app.use("/api", otpRouter);
    this.app.use("/api", roleRouter);
    this.app.use("/api", paymentRouter);
    this.app.use("/api", productRouter);
    this.app.use("/api", orderRouter);
    this.app.use("/api", cartRouter);
    this.app.use("/api", customerRouter);
    this.app.use("/api", feedbackRouter);
    this.app.use("/api", imageRouter);
    this.app.use("/api", rfqRouter);
    this.app.use("/api", shipperRouter);

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
          },
        }
      );

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
